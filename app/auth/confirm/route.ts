import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error && data.user) {
      // Check if user profile exists
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

      // Redirect to the next URL or protected page
      const redirectUrl = next.startsWith('/') ? next : '/protected'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}