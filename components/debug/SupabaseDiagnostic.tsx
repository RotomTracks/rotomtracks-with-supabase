'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function SupabaseDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    try {
      const url = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_CLIENT_AUTH || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
      
      if (!url || !key) {
        diagnostics.push({
          test: 'Environment Variables',
          status: 'error',
          message: 'Missing required environment variables',
          details: `URL: ${url ? '✓' : '✗'}, Key: ${key ? '✓' : '✗'}`
        });
      } else {
        diagnostics.push({
          test: 'Environment Variables',
          status: 'success',
          message: 'All required environment variables are set',
          details: `URL: ${url.substring(0, 30)}..., Key: ${key.substring(0, 20)}...`
        });
      }
    } catch (error) {
      diagnostics.push({
        test: 'Environment Variables',
        status: 'error',
        message: 'Error checking environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Client Creation
    try {
      const supabase = createClient();
      diagnostics.push({
        test: 'Client Creation',
        status: 'success',
        message: 'Supabase client created successfully'
      });

      // Test 3: Basic Connection
      try {
        const { data, error } = await supabase.from('tournaments').select('count').limit(1);
        
        if (error) {
          diagnostics.push({
            test: 'Database Connection',
            status: 'error',
            message: 'Failed to connect to database',
            details: error.message
          });
        } else {
          diagnostics.push({
            test: 'Database Connection',
            status: 'success',
            message: 'Successfully connected to database'
          });
        }
      } catch (error) {
        diagnostics.push({
          test: 'Database Connection',
          status: 'error',
          message: 'Network error connecting to database',
          details: error instanceof Error ? error.message : 'Unknown network error'
        });
      }

      // Test 4: Auth Status
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          diagnostics.push({
            test: 'Authentication',
            status: 'warning',
            message: 'Auth error (expected if not logged in)',
            details: error.message
          });
        } else if (user) {
          diagnostics.push({
            test: 'Authentication',
            status: 'success',
            message: 'User is authenticated',
            details: `User ID: ${user.id}`
          });
        } else {
          diagnostics.push({
            test: 'Authentication',
            status: 'warning',
            message: 'No authenticated user (this is normal)',
          });
        }
      } catch (error) {
        diagnostics.push({
          test: 'Authentication',
          status: 'error',
          message: 'Failed to check auth status',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    } catch (error) {
      diagnostics.push({
        test: 'Client Creation',
        status: 'error',
        message: 'Failed to create Supabase client',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Diagnostic
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={isRunning}
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Refresh'}
          </Button>
        </CardTitle>
        <CardDescription>
          Check the status of your Supabase connection and configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{result.test}</h4>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.message}
                </p>
                {result.details && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">
                    {result.details}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {results.length === 0 && isRunning && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Running diagnostics...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}