"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/lib/types/tournament';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Building2, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: UserRole;
  requireCompleteProfile?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  requireRole,
  requireCompleteProfile = false,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { profile, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      const redirect = redirectTo || window.location.pathname;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(redirect)}`);
      return;
    }

    // Check role requirement
    if (requireRole && (!profile || profile.user_role !== requireRole)) {
      const redirect = redirectTo || window.location.pathname;
      const reason = requireRole === UserRole.ORGANIZER ? 'organizer_required' : 'player_required';
      router.push(`/auth/unauthorized?reason=${reason}&redirectTo=${encodeURIComponent(redirect)}`);
      return;
    }

    // Check complete profile requirement
    if (requireCompleteProfile && isAuthenticated && (!profile || !profile.first_name || !profile.last_name || !profile.player_id)) {
      const redirect = redirectTo || window.location.pathname;
      router.push(`/profile/complete?redirectTo=${encodeURIComponent(redirect)}`);
      return;
    }
  }, [loading, isAuthenticated, profile, requireAuth, requireRole, requireCompleteProfile, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to sign in to access this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirement
  if (requireRole && (!profile || profile.user_role !== requireRole)) {
    const roleInfo = requireRole === UserRole.ORGANIZER 
      ? { icon: Building2, name: 'Organizer', color: 'blue' }
      : { icon: Trophy, name: 'Player', color: 'green' };

    return fallback || (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto bg-${roleInfo.color}-100 dark:bg-${roleInfo.color}-900/20 rounded-full flex items-center justify-center mb-4`}>
              <roleInfo.icon className={`w-8 h-8 text-${roleInfo.color}-600 dark:text-${roleInfo.color}-400`} />
            </div>
            <CardTitle>{roleInfo.name} Access Required</CardTitle>
            <CardDescription>
              This feature is only available to {roleInfo.name.toLowerCase()}s
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/profile" className="w-full">
              <Button className="w-full">Update Profile</Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check complete profile requirement
  if (requireCompleteProfile && isAuthenticated && (!profile || !profile.first_name || !profile.last_name || !profile.player_id)) {
    return fallback || (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please complete your profile to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/profile/complete" className="w-full">
              <Button className="w-full">Complete Profile</Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Convenience components for common use cases
export function RequireAuth({ children, fallback, redirectTo }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth fallback={fallback} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireOrganizer({ children, fallback, redirectTo }: Omit<ProtectedRouteProps, 'requireRole'>) {
  return (
    <ProtectedRoute requireAuth requireRole={UserRole.ORGANIZER} fallback={fallback} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

export function RequirePlayer({ children, fallback, redirectTo }: Omit<ProtectedRouteProps, 'requireRole'>) {
  return (
    <ProtectedRoute requireAuth requireRole={UserRole.PLAYER} fallback={fallback} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireCompleteProfile({ children, fallback, redirectTo }: Omit<ProtectedRouteProps, 'requireCompleteProfile'>) {
  return (
    <ProtectedRoute requireAuth requireCompleteProfile fallback={fallback} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}