import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if ((token_hash || token) && type) {
    const supabase = await createClient()

    let data, error

    // Handle password recovery flow specifically
    if (type === 'recovery') {
      // For password recovery, we need to exchange the code for a session
      if (token) {
        // Use exchangeCodeForSession for password recovery
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(token)
        data = sessionData
        error = sessionError
      } else if (token_hash) {
        // Fallback to verifyOtp if token_hash is provided
        const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        })
        data = otpData
        error = otpError
      }

      if (!error && data?.user) {
        // For password recovery, redirect directly to update password page
        // The user now has an active session and can update their password
        const updatePasswordUrl = next.startsWith('/auth/update-password') 
          ? next 
          : '/auth/update-password'
        return NextResponse.redirect(new URL(updatePasswordUrl, request.url))
      }
    } else {
      // Handle other confirmation types (signup, email change, etc.)
      if (token_hash) {
        const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        })
        data = otpData
        error = otpError
      } else if (token) {
        // For other types, also try exchangeCodeForSession
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(token)
        data = sessionData
        error = sessionError
      }

      if (!error && data?.user) {
        // Handle other confirmation types (signup, email change, etc.)
        // Check if user profile exists for new signups
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        // If no profile exists and we have user metadata, create one
        if (!existingProfile && data.user.user_metadata) {
          const metadata = data.user.user_metadata
          
          try {
            await supabase
              .from('user_profiles')
              .insert([{
                user_id: data.user.id,
                first_name: metadata.first_name || '',
                last_name: metadata.last_name || '',
                player_id: metadata.player_id || '',
                user_role: metadata.user_role || 'player',
                birth_year: metadata.birth_year ? parseInt(metadata.birth_year, 10) : null,
                organization_name: metadata.organization_name || null,
                organizer_license: metadata.organizer_license || null,
              }])
          } catch (profileError) {
            console.error('Error creating user profile:', profileError)
            // Continue with redirect even if profile creation fails
            // User can complete profile later
          }
        }

        // Redirect to the next URL or dashboard
        const redirectUrl = next.startsWith('/') ? next : '/dashboard'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }

    // Handle specific error cases
    console.error('Token verification error:', error)
    
    if (type === 'recovery') {
      // For recovery errors, redirect to forgot password with error message
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'expired_token')
      loginUrl.searchParams.set('message', 'The recovery link has expired or is invalid. Please request a new one.')
      return NextResponse.redirect(loginUrl)
    }
    
    // For other types, redirect to login with error
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'invalid_token')
    loginUrl.searchParams.set('message', 'The confirmation link is invalid or has expired.')
    return NextResponse.redirect(loginUrl)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}