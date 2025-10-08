import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getFullUrl, isProduction } from '@/lib/config/app';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Validate origin for security (optional but recommended)
  const allowedOrigins = isProduction() 
    ? ['https://rotomtracks.es'] // Solo dominio de producción
    : [
        'https://rotomtracks.es', // Dominio de producción
        'http://localhost:3000',   // Desarrollo local
        'http://localhost:3001'    // Desarrollo local (puerto alternativo)
      ];
  
  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    console.warn('Unauthorized origin for auth callback:', origin);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the intended destination or success page
      const redirectUrl = next && next !== '/' ? getFullUrl(next) : getFullUrl('/auth/sign-up-success');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If there's an error or no code, redirect to home with an error
  const redirectUrl = getFullUrl('/?error=auth_callback_error');
  return NextResponse.redirect(redirectUrl);
}
