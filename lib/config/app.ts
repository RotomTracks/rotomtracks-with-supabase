/**
 * Application configuration
 */

// Get the base URL with proper fallbacks
function getBaseUrlFromEnv(): string {
  // Check for NEXT_PUBLIC_SITE_URL first (your current config)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback to NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Default fallback
  return 'https://rotomtracks.es';
}

export const APP_CONFIG = {
  // Base URL for the application
  baseUrl: getBaseUrlFromEnv(),
  
  // Site name
  siteName: 'RotomTracks',
  
  // Default locale
  defaultLocale: 'es',
  
  // Supported locales
  supportedLocales: ['es', 'en'],
} as const;

/**
 * Get the full URL for a given path
 */
export function getFullUrl(path: string = ''): string {
  const baseUrl = APP_CONFIG.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  return APP_CONFIG.baseUrl;
}

/**
 * Check if the current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if the current environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get the current environment
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}
