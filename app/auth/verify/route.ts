import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const redirect_to = searchParams.get('redirect_to');

  const authToken = token || code;

  if (!authToken) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
  }

  const supabase = await createClient();

  try {
    let data, error;

    if (type === 'recovery' || (!type && code)) {
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(authToken);
      data = sessionData;
      error = sessionError;
    } else {
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(authToken);
      data = sessionData;
      error = sessionError;
    }

    if (error || !data?.user) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token&message=El enlace de recuperación ha expirado o es inválido', request.url));
    }

    if (type === 'recovery' || (!type && code)) {
      return NextResponse.redirect(new URL(`/auth/update-password?recovery=true&user_id=${data.user.id}`, request.url));
    }

    if (redirect_to) {
      return NextResponse.redirect(new URL(redirect_to, request.url));
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));

  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed&message=Error al verificar el enlace de recuperación', request.url));
  }
}
