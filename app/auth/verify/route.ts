import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const redirect_to = searchParams.get('redirect_to');

  if (!token || !type) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
  }

  const supabase = await createClient();

  try {
    // Verify the token using Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash: token,
    });

    if (error || !data.user) {
      console.error('Token verification error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
    }

    // Handle password recovery flow
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/update-password', request.url));
    }

    // Handle other confirmation types
    if (redirect_to) {
      return NextResponse.redirect(new URL(redirect_to, request.url));
    }

    // Default redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (error) {
    console.error('Error in token verification:', error);
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
  }
}
