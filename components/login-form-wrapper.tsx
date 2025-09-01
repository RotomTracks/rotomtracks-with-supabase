'use client';

import { Suspense } from 'react';
import { LoginForm } from './login-form';

function LoginFormFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-md mx-auto w-full">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-blue-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginFormWrapper() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}