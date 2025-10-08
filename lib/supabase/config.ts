/**
 * Supabase configuration and environment validation
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

/**
 * Get Supabase configuration from environment variables
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_CLIENT_AUTH || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  const serviceKey = process.env.SERVER_AUTH || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      'Missing Supabase URL. Please set NEXT_PUBLIC_DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable.'
    );
  }

  if (!anonKey) {
    throw new Error(
      'Missing Supabase anon key. Please set NEXT_PUBLIC_CLIENT_AUTH or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY environment variable.'
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid Supabase URL format: ${url}`);
  }

  return {
    url,
    anonKey,
    serviceKey,
  };
}

/**
 * Check if all required Supabase environment variables are set
 */
export function hasRequiredEnvVars(): boolean {
  try {
    getSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get common Supabase client options
 */
export function getClientOptions() {
  return {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce' as const,
      // Configure redirect URLs for email verification
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://rotomtracks.es',
    },
    global: {
      headers: {
        'X-Client-Info': 'rotomtracks-web',
      },
      fetch: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        try {
          return await fetch(input, init);
        } catch (error) {
          console.error('Supabase fetch error:', error);
          if (error instanceof Error && error.message.includes('fetch failed')) {
            throw new Error('Unable to connect to Supabase. Please check:\n1. Your internet connection\n2. Supabase project status\n3. DNS resolution');
          }
          throw error;
        }
      },
    },
  };
}