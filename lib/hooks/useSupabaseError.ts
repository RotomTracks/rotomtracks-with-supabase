import { useCallback } from 'react';
import { AuthError } from '@supabase/supabase-js';

export interface SupabaseErrorHandler {
  handleError: (error: unknown) => string;
  isAuthError: (error: unknown) => error is AuthError;
  isNetworkError: (error: unknown) => boolean;
}

export function useSupabaseError(): SupabaseErrorHandler {
  const isAuthError = useCallback((error: unknown): error is AuthError => {
    return error instanceof Error && 'status' in error && '__isAuthError' in error;
  }, []);

  const isNetworkError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('fetch failed') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.name === 'TypeError' ||
        (isAuthError(error) && error.status === 0)
      );
    }
    return false;
  }, [isAuthError]);

  const handleError = useCallback((error: unknown): string => {
    console.error('Supabase error:', error);

    if (isNetworkError(error)) {
      return 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
    }

    if (isAuthError(error)) {
      const authError = error as AuthError;
      
      switch (authError.message) {
        case 'Invalid login credentials':
          return 'Credenciales incorrectas. Verifica tu email y contraseña.';
        case 'Email not confirmed':
          return 'Debes confirmar tu email antes de iniciar sesión.';
        case 'Too many requests':
          return 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.';
        case 'User not found':
          return 'No se encontró una cuenta con este email.';
        case 'Signup not allowed for this instance':
          return 'El registro no está permitido en este momento.';
        default:
          return authError.message || 'Error de autenticación.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }, [isAuthError, isNetworkError]);

  return {
    handleError,
    isAuthError,
    isNetworkError,
  };
}