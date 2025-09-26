/**
 * Get the base URL for authentication redirects
 * Handles both development and production environments
 */
export function getAuthBaseUrl(): string {
  // Check for explicit production URL first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // In server environment (Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Production domain (fallback)
  if (process.env.NODE_ENV === 'production') {
    return 'https://rotomtracks-with-supabase.vercel.app';
  }
  
  // In browser environment (development)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Get the password reset redirect URL
 * This URL is used in the password reset email and should point to the confirmation handler
 * which will validate the token and then redirect to the update password page
 * 
 * IMPORTANT: This should ALWAYS use the production URL for emails, 
 * even in development, so users can access the reset link from anywhere
 */
export function getPasswordResetUrl(): string {
  // Always use production URL for password reset emails
  const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rotomtracks-with-supabase.vercel.app';
  return `${productionUrl}/auth/confirm?type=recovery&next=/auth/update-password`;
}

/**
 * Get the base URL for local redirects (can be localhost in development)
 */
export function getLocalBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  return getAuthBaseUrl();
}