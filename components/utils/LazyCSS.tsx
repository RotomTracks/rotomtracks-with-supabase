'use client';

import { useEffect } from 'react';

interface LazyCSSProps {
  href: string;
  media?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyCSS({ href, media = 'all', onLoad, onError }: LazyCSSProps) {
  useEffect(() => {
    // Verificar si el CSS ya está cargado
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      onLoad?.();
      return;
    }

    // Crear el elemento link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = media;
    
    // Event listeners
    link.onload = () => {
      onLoad?.();
    };
    
    link.onerror = () => {
      console.warn(`Failed to load CSS: ${href}`);
      onError?.();
    };

    // Agregar al head
    document.head.appendChild(link);

    // Cleanup
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [href, media, onLoad, onError]);

  return null;
}

// Hook para cargar CSS de forma lazy
export function useLazyCSS(href: string, media = 'all') {
  useEffect(() => {
    // Verificar si el CSS ya está cargado
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) return;

    // Crear el elemento link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = media;
    
    // Agregar al head
    document.head.appendChild(link);

    // Cleanup
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [href, media]);
}
