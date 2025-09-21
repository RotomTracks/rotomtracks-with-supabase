/**
 * Rate limiting utilities for API endpoints
 */

// Simple in-memory rate limiter (for production, use Redis)
class MemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  async checkLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const existing = this.requests.get(key);
    
    if (!existing || now > existing.resetTime) {
      // First request or window expired
      this.requests.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime
      };
    }
    
    if (existing.count >= limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime
      };
    }
    
    // Increment count
    existing.count++;
    this.requests.set(key, existing);
    
    return {
      allowed: true,
      remaining: limit - existing.count,
      resetTime: existing.resetTime
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new MemoryRateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  SEARCH_API: {
    requests: 100, // requests per window
    window: 15 * 60 * 1000, // 15 minutes
  },
  SUGGESTIONS_API: {
    requests: 200, // requests per window
    window: 15 * 60 * 1000, // 15 minutes
  },
  GENERAL_API: {
    requests: 1000, // requests per window
    window: 60 * 60 * 1000, // 1 hour
  }
};

/**
 * Check rate limit for a given key and endpoint
 */
export async function checkRateLimit(
  key: string,
  endpoint: 'search' | 'suggestions' | 'general' = 'general'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}> {
  const config = RATE_LIMITS[`${endpoint.toUpperCase()}_API` as keyof typeof RATE_LIMITS];
  
  const result = await rateLimiter.checkLimit(
    `${endpoint}:${key}`,
    config.requests,
    config.window
  );

  return {
    ...result,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000)
  };
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  };
}

/**
 * Rate limit middleware for API routes
 */
export async function withRateLimit<T>(
  request: Request,
  endpoint: 'search' | 'suggestions' | 'general',
  handler: () => Promise<T>
): Promise<T | Response> {
  // Get client identifier (IP address)
  const clientIP = getClientIP(request);
  
  // Check rate limit
  const rateLimitResult = await checkRateLimit(clientIP, endpoint);
  
  if (!rateLimitResult.allowed) {
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMITS[`${endpoint.toUpperCase()}_API` as keyof typeof RATE_LIMITS].requests
    );
    
    if (rateLimitResult.retryAfter) {
      headers['Retry-After'] = rateLimitResult.retryAfter.toString();
    }
    
    return new Response(
      JSON.stringify({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retry_after: rateLimitResult.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }
    );
  }
  
  // Execute handler
  const result = await handler();
  
  // Add rate limit headers to successful responses
  if (result instanceof Response) {
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMITS[`${endpoint.toUpperCase()}_API` as keyof typeof RATE_LIMITS].requests
    );
    
    Object.entries(headers).forEach(([key, value]) => {
      result.headers.set(key, value);
    });
  }
  
  return result;
}

/**
 * Get client IP address from request headers
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Advanced rate limiting with different tiers based on user authentication
 */
export async function checkAdvancedRateLimit(
  request: Request,
  endpoint: string,
  userId?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  tier: 'anonymous' | 'authenticated' | 'premium';
}> {
  const clientIP = getClientIP(request);
  
  // Determine user tier
  let tier: 'anonymous' | 'authenticated' | 'premium' = 'anonymous';
  let multiplier = 1;
  
  if (userId) {
    tier = 'authenticated';
    multiplier = 2; // Authenticated users get 2x the limit
    
    // TODO: Check if user has premium subscription
    // if (await isPremiumUser(userId)) {
    //   tier = 'premium';
    //   multiplier = 5; // Premium users get 5x the limit
    // }
  }
  
  const key = userId ? `user:${userId}` : `ip:${clientIP}`;
  const config = RATE_LIMITS[`${endpoint.toUpperCase()}_API` as keyof typeof RATE_LIMITS];
  const adjustedLimit = Math.floor(config.requests * multiplier);
  
  const result = await rateLimiter.checkLimit(
    `${endpoint}:${key}`,
    adjustedLimit,
    config.window
  );
  
  return {
    ...result,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
    tier
  };
}

// Cleanup on process exit
process.on('SIGTERM', () => {
  rateLimiter.destroy();
});

process.on('SIGINT', () => {
  rateLimiter.destroy();
});