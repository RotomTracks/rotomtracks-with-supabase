// Health check endpoint

import { NextResponse } from 'next/server';
import { performHealthCheck, ResponseTimeTracker } from '@/lib/utils/monitoring';

export async function GET() {
  try {
    const healthCheck = await performHealthCheck();
    const responseTracker = ResponseTimeTracker.getInstance();
    const responseMetrics = responseTracker.getAllMetrics();

    const response = {
      ...healthCheck,
      performance_metrics: responseMetrics,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date(),
      checks: {
        database: false,
        search_api: false,
        rate_limiter: false
      }
    }, { status: 503 });
  }
}