"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminRoute({ children, fallback }: AdminRouteProps) {
  const { isAdmin, loading, user } = useAuth();
  const router = useRouter();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!user) {
    router.push('/auth/login?redirect=/admin/dashboard');
    return null;
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso Restringido
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta área está reservada para administradores del sistema. 
            No tienes los permisos necesarios para acceder a esta sección.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Volver al Inicio
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
            >
              Ir al Dashboard
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Panel de Administración</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}