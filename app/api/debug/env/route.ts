import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_DATABASE_URL: process.env.NEXT_PUBLIC_DATABASE_URL,
    NEXT_PUBLIC_CLIENT_AUTH: process.env.NEXT_PUBLIC_CLIENT_AUTH,
    SERVER_AUTH: process.env.SERVER_AUTH,
    NODE_ENV: process.env.NODE_ENV,
  };

  const status = {
    hasUrl: !!envVars.NEXT_PUBLIC_DATABASE_URL,
    hasClientAuth: !!envVars.NEXT_PUBLIC_CLIENT_AUTH,
    hasServerAuth: !!envVars.SERVER_AUTH,
    urlFormat: envVars.NEXT_PUBLIC_DATABASE_URL?.startsWith('https://') ? 'valid' : 'invalid',
    clientAuthFormat: envVars.NEXT_PUBLIC_CLIENT_AUTH?.startsWith('eyJ') ? 'valid' : 'invalid',
  };

  return NextResponse.json({
    status,
    envVars: {
      ...envVars,
      // Mask sensitive data
      NEXT_PUBLIC_CLIENT_AUTH: envVars.NEXT_PUBLIC_CLIENT_AUTH ? 
        envVars.NEXT_PUBLIC_CLIENT_AUTH.substring(0, 20) + '...' : undefined,
      SERVER_AUTH: envVars.SERVER_AUTH ? 
        envVars.SERVER_AUTH.substring(0, 20) + '...' : undefined,
    }
  });
}