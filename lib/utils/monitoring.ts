/**
 * Monitoring and logging utilities for API performance tracking
 */

// Performance metrics interface
export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  query_complexity?: 'simple' | 'moderate' | 'complex';
  results_count?: number;
  cache_hit?: boolean;
  user_id?: string;
  ip_address?: string;
  timestamp: Date;
}

// Error tracking interface
export interface ErrorMetrics {
  endpoint: string;
  method: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  ip_address?: string;
  request_body?: Record<string, unknown>;
  timestamp: Date;
}

// Search analytics interface
export interface SearchAnalytics {
  query: string;
  results_count: number;
  search_time: number;
  filters_used: number;
  user_id?: string;
  session_id?: string;
  clicked_result?: string;
  timestamp: Date;
}

/**
 * Log performance metrics
 */
export async function logPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
  try {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:', {
        endpoint: metrics.endpoint,
        method: metrics.method,
        duration: `${metrics.duration}ms`,
        status: metrics.status,
        query_complexity: metrics.query_complexity,
        results_count: metrics.results_count,
        cache_hit: metrics.cache_hit,
        timestamp: metrics.timestamp.toISOString()
      });
    }

    // In production, you might send to monitoring service
    // await sendToMonitoringService(metrics);
    
    // Or store in database for analysis
    // await storeMetricsInDatabase(metrics);
    
  } catch (error) {
    console.error('Error logging performance metrics:', error);
  }
}

/**
 * Log error metrics
 */
export async function logErrorMetrics(error: ErrorMetrics): Promise<void> {
  try {
    console.error('🚨 Error Metrics:', {
      endpoint: error.endpoint,
      method: error.method,
      error_type: error.error_type,
      error_message: error.error_message,
      user_id: error.user_id,
      ip_address: error.ip_address,
      timestamp: error.timestamp.toISOString()
    });

    // In production, send to error tracking service
    // await sendToErrorTrackingService(error);
    
  } catch (logError) {
    console.error('Error logging error metrics:', logError);
  }
}

/**
 * Log search analytics
 */
export async function logSearchAnalytics(analytics: SearchAnalytics): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Search Analytics:', {
        query: analytics.query.substring(0, 50), // Truncate for privacy
        results_count: analytics.results_count,
        search_time: `${analytics.search_time}ms`,
        filters_used: analytics.filters_used,
        user_id: analytics.user_id,
        timestamp: analytics.timestamp.toISOString()
      });
    }

    // Store search analytics for business intelligence
    // await storeSearchAnalytics(analytics);
    
  } catch (error) {
    console.error('Error logging search analytics:', error);
  }
}

/**
 * Create performance monitoring middleware
 */
export function withPerformanceMonitoring<T>(
  endpoint: string,
  method: string,
  handler: (request: Request) => Promise<T>
) {
  return async (request: Request): Promise<T> => {
    const startTime = Date.now();
    let status = 200;
    let error: Error | null = null;

    try {
      const result = await handler(request);
      
      // Extract status from Response object if available
      if (result instanceof Response) {
        status = result.status;
      }
      
      return result;
    } catch (err) {
      error = err as Error;
      status = 500;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      
      // Log performance metrics
      await logPerformanceMetrics({
        endpoint,
        method,
        duration,
        status,
        ip_address: getClientIP(request),
        timestamp: new Date()
      });
      
      // Log error if occurred
      if (error) {
        await logErrorMetrics({
          endpoint,
          method,
          error_type: error.constructor.name,
          error_message: error.message,
          stack_trace: error.stack,
          ip_address: getClientIP(request),
          timestamp: new Date()
        });
      }
    }
  };
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  
  return 'unknown';
}

/**
 * Health check utilities
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    search_api: boolean;
    rate_limiter: boolean;
  };
  response_time: number;
  timestamp: Date;
}

/**
 * Perform system health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const checks = {
    database: false,
    search_api: false,
    rate_limiter: false
  };

  try {
    // Check database connectivity
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('tournaments').select('id').limit(1);
    checks.database = !dbError;

    // Check search API functionality
    try {
      // This would be a simple search test
      checks.search_api = true; // Simplified for now
    } catch {
      checks.search_api = false;
    }

    // Check rate limiter
    checks.rate_limiter = true; // Simplified for now

  } catch (error) {
    console.error('Health check error:', error);
  }

  const responseTime = Date.now() - startTime;
  const healthyChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.values(checks).length;

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyChecks === totalChecks) {
    status = 'healthy';
  } else if (healthyChecks >= totalChecks / 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    checks,
    response_time: responseTime,
    timestamp: new Date()
  };
}

/**
 * API response time tracker
 */
export class ResponseTimeTracker {
  private static instance: ResponseTimeTracker;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): ResponseTimeTracker {
    if (!ResponseTimeTracker.instance) {
      ResponseTimeTracker.instance = new ResponseTimeTracker();
    }
    return ResponseTimeTracker.instance;
  }

  recordResponseTime(endpoint: string, duration: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const times = this.metrics.get(endpoint)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getPercentile(endpoint: string, percentile: number): number {
    const times = this.metrics.get(endpoint);
    if (!times || times.length === 0) return 0;
    
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getAllMetrics(): Record<string, { avg: number; p95: number; p99: number }> {
    const result: Record<string, { avg: number; p95: number; p99: number }> = {};
    
    for (const [endpoint] of this.metrics) {
      result[endpoint] = {
        avg: Math.round(this.getAverageResponseTime(endpoint)),
        p95: Math.round(this.getPercentile(endpoint, 95)),
        p99: Math.round(this.getPercentile(endpoint, 99))
      };
    }
    
    return result;
  }
}