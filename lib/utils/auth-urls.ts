/**
 * Get the base URL for authentication redirects
 * Handles both development and production environments
 */
export function getAuthBaseUrl(): string {
  // In browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // In server environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Production domain
    return 'https://rotomtracks-with-supabase.vercel.app';
  }
  
  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Get the password reset redirect URL
 * This URL is used in the password reset email and should point to the confirmation handler
 * which will validate the token and then redirect to the update password page
 */
export function getPasswordResetUrl(): string {
  return `${getAuthBaseUrl()}/auth/confirm?next=/auth/update-password`;
}