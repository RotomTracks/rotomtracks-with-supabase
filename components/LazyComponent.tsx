"use client";

import React, { Suspense, lazy, ComponentType } from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  [key: string]: any;
}

/**
 * Componente para lazy loading agresivo con Intersection Observer
 * Solo carga el componente cuando está visible en el viewport
 */
export function LazyComponent({ 
  component, 
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  threshold = 0.1,
  rootMargin = '50px',
  ...props 
}: LazyComponentProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true, // Solo cargar una vez
  });

  const LazyComponent = lazy(component);

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

/**
 * Hook para lazy loading de componentes con preloading
 */
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  preload = false
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    if (Component || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const moduleImport = await importFn();
      setComponent(() => moduleImport.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [Component, loading, importFn]);

  // Preload si está habilitado
  React.useEffect(() => {
    if (preload) {
      loadComponent();
    }
  }, [preload, loadComponent]);

  return { Component, loading, error, loadComponent };
}

/**
 * Componente para lazy loading de rutas completas
 */
export function LazyRoute({ 
  children, 
  fallback = <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
