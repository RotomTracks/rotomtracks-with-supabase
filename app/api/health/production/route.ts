import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: {
      url: process.env.VERCEL_URL,
      region: process.env.VERCEL_REGION,
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID,
    },
    supabase: {
      url_configured: !!process.env.NEXT_PUBLIC_DATABASE_URL,
      key_configured: !!process.env.NEXT_PUBLIC_CLIENT_AUTH,
      site_url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    urls: {
      current_url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'unknown',
      configured_site_url: process.env.NEXT_PUBLIC_SITE_URL,
    }
  };

  return NextResponse.json(healthCheck);
}