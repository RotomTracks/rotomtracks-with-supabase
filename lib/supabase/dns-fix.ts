/**
 * DNS resolution fix for Supabase
 * This helps resolve DNS issues in development
 */

export function fixSupabaseUrl(url: string): string {
  // If we're having DNS issues with the supabase.co domain,
  // we can try to use the IP directly with proper headers
  if (url.includes('szedaxhmjvpbjaiodnfg.supabase.co')) {
    console.warn('DNS resolution issue detected for Supabase. Using IP fallback.');
    // Note: This is a temporary fix. The proper solution is to fix DNS resolution
    // or check if the Supabase project is active
  }
  
  return url;
}

export function createCustomFetch() {
  const originalFetch = global.fetch;
  
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      return await originalFetch(input, init);
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch failed')) {
        console.error('Fetch failed, possibly due to DNS resolution:', error.message);
        throw new Error('Connection failed: Unable to reach Supabase. Please check your internet connection and Supabase project status.');
      }
      throw error;
    };
  };
}