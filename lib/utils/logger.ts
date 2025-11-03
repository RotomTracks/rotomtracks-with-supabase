/**
 * Production-safe logging utility
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
  
  error: (message: string, error?: any) => {
    // Always log errors, but sanitize sensitive data
    const sanitizedError = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error;
    
    console.error(`[ERROR] ${message}`, sanitizedError);
  },
  
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};
