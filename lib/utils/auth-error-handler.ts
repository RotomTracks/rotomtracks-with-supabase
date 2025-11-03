/**
 * Centralized authentication error handling
 */

export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
}

export function parseAuthError(error: any): AuthError {
  const errorMessage = error?.message || 'Unknown error';
  
  // Common Supabase Auth errors
  if (errorMessage.includes('Invalid login credentials')) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: errorMessage,
      userFriendlyMessage: 'Credenciales incorrectas. Verifica tu email y contraseña.'
    };
  }
  
  if (errorMessage.includes('User already registered')) {
    return {
      code: 'USER_EXISTS',
      message: errorMessage,
      userFriendlyMessage: 'Este email ya está registrado. Intenta iniciar sesión.'
    };
  }
  
  if (errorMessage.includes('Invalid email')) {
    return {
      code: 'INVALID_EMAIL',
      message: errorMessage,
      userFriendlyMessage: 'Por favor, ingresa un email válido.'
    };
  }
  
  if (errorMessage.includes('Password should be at least')) {
    return {
      code: 'WEAK_PASSWORD',
      message: errorMessage,
      userFriendlyMessage: 'La contraseña debe tener al menos 6 caracteres.'
    };
  }
  
  if (errorMessage.includes('rate limit')) {
    return {
      code: 'RATE_LIMIT',
      message: errorMessage,
      userFriendlyMessage: 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.'
    };
  }
  
  if (errorMessage.includes('Email not confirmed')) {
    return {
      code: 'EMAIL_NOT_CONFIRMED',
      message: errorMessage,
      userFriendlyMessage: 'Por favor, verifica tu email antes de iniciar sesión.'
    };
  }
  
  if (errorMessage.includes('Token has expired')) {
    return {
      code: 'TOKEN_EXPIRED',
      message: errorMessage,
      userFriendlyMessage: 'El enlace ha expirado. Solicita uno nuevo.'
    };
  }
  
  if (errorMessage.includes('User not found')) {
    return {
      code: 'USER_NOT_FOUND',
      message: errorMessage,
      userFriendlyMessage: 'No se encontró una cuenta con este email.'
    };
  }
  
  // Network errors
  if (errorMessage.includes('fetch failed') || errorMessage.includes('Network error')) {
    return {
      code: 'NETWORK_ERROR',
      message: errorMessage,
      userFriendlyMessage: 'Error de conexión. Verifica tu internet e intenta de nuevo.'
    };
  }
  
  // Default fallback
  return {
    code: 'UNKNOWN_ERROR',
    message: errorMessage,
    userFriendlyMessage: 'Ha ocurrido un error inesperado. Intenta de nuevo.'
  };
}

export function getAuthErrorMessage(error: any): string {
  const parsedError = parseAuthError(error);
  return parsedError.userFriendlyMessage;
}

export function isRetryableError(error: any): boolean {
  const parsedError = parseAuthError(error);
  return ['NETWORK_ERROR', 'RATE_LIMIT'].includes(parsedError.code);
}
