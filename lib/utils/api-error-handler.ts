// API Error Handling Utilities
// Provides consistent error response formatting and handling across all API routes

import { NextResponse } from 'next/server';
import { ErrorCodes } from '@/lib/types/tournament';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

// Standard API error response interface
export interface APIErrorResponse {
  error: string;
  message: string;
  code: ErrorCodes;
  details?: Record<string, unknown>;
  field?: string;
  timestamp: string;
  request_id?: string;
}

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// Enhanced error class for API responses
export class APIError extends Error {
  public readonly code: ErrorCodes;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly field?: string;
  public readonly severity: ErrorSeverity;

  constructor(
    code: ErrorCodes,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>,
    field?: string,
    severity: ErrorSeverity = 'error'
  ) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.field = field;
    this.severity = severity;
  }
}

// Predefined error configurations
export const ERROR_CONFIGS: Record<ErrorCodes, { statusCode: number; severity: ErrorSeverity }> = {
  [ErrorCodes.UNAUTHORIZED]: { statusCode: 401, severity: 'warning' },
  [ErrorCodes.FORBIDDEN]: { statusCode: 403, severity: 'warning' },
  [ErrorCodes.NOT_FOUND]: { statusCode: 404, severity: 'info' },
  [ErrorCodes.VALIDATION_ERROR]: { statusCode: 400, severity: 'warning' },
  [ErrorCodes.TOURNAMENT_FULL]: { statusCode: 400, severity: 'info' },
  [ErrorCodes.DUPLICATE_REGISTRATION]: { statusCode: 409, severity: 'warning' },
  [ErrorCodes.DUPLICATE_TOURNAMENT_ID]: { statusCode: 409, severity: 'warning' },
  [ErrorCodes.INVALID_FILE_FORMAT]: { statusCode: 400, severity: 'warning' },
  [ErrorCodes.PROCESSING_ERROR]: { statusCode: 500, severity: 'error' },
  [ErrorCodes.UPLOAD_ERROR]: { statusCode: 500, severity: 'error' }
};

// Standard error messages in Spanish
export const ERROR_MESSAGES: Record<ErrorCodes, string> = {
  [ErrorCodes.UNAUTHORIZED]: 'Autenticación requerida',
  [ErrorCodes.FORBIDDEN]: 'No tienes permisos para realizar esta acción',
  [ErrorCodes.NOT_FOUND]: 'El recurso solicitado no fue encontrado',
  [ErrorCodes.VALIDATION_ERROR]: 'Los datos proporcionados no son válidos',
  [ErrorCodes.TOURNAMENT_FULL]: 'El torneo está lleno',
  [ErrorCodes.DUPLICATE_REGISTRATION]: 'Ya existe una inscripción con estos datos',
  [ErrorCodes.DUPLICATE_TOURNAMENT_ID]: 'Ya existe un torneo con este ID oficial',
  [ErrorCodes.INVALID_FILE_FORMAT]: 'El formato del archivo no es válido',
  [ErrorCodes.PROCESSING_ERROR]: 'Error al procesar la solicitud',
  [ErrorCodes.UPLOAD_ERROR]: 'Error al subir el archivo'
};

/**
 * Creates a standardized API error response
 * 
 * @param code - Error code from ErrorCodes enum
 * @param message - Custom error message (optional, uses default if not provided)
 * @param details - Additional error context
 * @param field - Field that caused the error (for validation errors)
 * @param requestId - Unique request identifier for tracking
 * @returns NextResponse with standardized error format
 * 
 * @example
 * ```typescript
 * return createErrorResponse(
 *   ErrorCodes.NOT_FOUND,
 *   'Torneo no encontrado',
 *   undefined,
 *   undefined,
 *   requestId
 * );
 * ```
 */
export function createErrorResponse(
  code: ErrorCodes,
  message?: string,
  details?: Record<string, unknown>,
  field?: string,
  requestId?: string
): NextResponse<APIErrorResponse> {
  const config = ERROR_CONFIGS[code];
  const standardMessage = ERROR_MESSAGES[code];
  
  const errorResponse: APIErrorResponse = {
    error: code,
    message: message || standardMessage,
    code,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
    ...(field && { field }),
    ...(requestId && { request_id: requestId })
  };

  return NextResponse.json(errorResponse, { status: config.statusCode });
}

/**
 * Creates an error response from an APIError instance
 */
export function createErrorResponseFromAPIError(
  error: APIError,
  requestId?: string
): NextResponse<APIErrorResponse> {
  return createErrorResponse(
    error.code,
    error.message,
    error.details,
    error.field,
    requestId
  );
}

/**
 * Handles Zod validation errors and converts them to API error responses
 */
export function handleValidationError(
  error: z.ZodError,
  requestId?: string
): NextResponse<APIErrorResponse> {
  const firstIssue = error.issues[0];
  const field = firstIssue?.path?.join('.') || undefined;
  const message = firstIssue?.message || 'Error de validación';

  return createErrorResponse(
    ErrorCodes.VALIDATION_ERROR,
    message,
    { issues: error.issues },
    field,
    requestId
  );
}

/**
 * Handles Supabase errors and converts them to appropriate API error responses
 */
export function handleSupabaseError(
  error: unknown,
  context: string = 'operación',
  requestId?: string
): NextResponse<APIErrorResponse> {
  // Handle specific Supabase error codes
  if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
    return createErrorResponse(
      ErrorCodes.NOT_FOUND,
      `El recurso solicitado no fue encontrado`,
      undefined,
      undefined,
      requestId
    );
  }

  if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // Unique constraint violation
    return createErrorResponse(
      ErrorCodes.DUPLICATE_REGISTRATION,
      'Ya existe un registro con estos datos',
      error && typeof error === 'object' && 'message' in error ? { message: error.message as string } : undefined,
      undefined,
      requestId
    );
  }

  if (error && typeof error === 'object' && 'code' in error && error.code === '23503') { // Foreign key constraint violation
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Los datos proporcionados no son válidos',
      error && typeof error === 'object' && 'message' in error ? { message: error.message as string } : undefined,
      undefined,
      requestId
    );
  }

  // Generic database error
  console.error(`Error en ${context}:`, error);
  return createErrorResponse(
    ErrorCodes.PROCESSING_ERROR,
    `Error al realizar la ${context}`,
    process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error ? { message: error.message as string } : undefined,
    undefined,
    requestId
  );
}

/**
 * Handles authentication errors
 */
export function handleAuthError(
  error?: unknown,
  requestId?: string
): NextResponse<APIErrorResponse> {
  return createErrorResponse(
    ErrorCodes.UNAUTHORIZED,
    undefined,
    undefined,
    undefined,
    requestId
  );
}

/**
 * Handles authorization errors (user doesn't have permission)
 */
export function handleForbiddenError(
  message?: string,
  requestId?: string
): NextResponse<APIErrorResponse> {
  return createErrorResponse(
    ErrorCodes.FORBIDDEN,
    message,
    undefined,
    undefined,
    requestId
  );
}

/**
 * Handles file upload errors
 */
export function handleFileUploadError(
  error: unknown,
  context: string = 'archivo',
  requestId?: string
): NextResponse<APIErrorResponse> {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('file size')) {
    return createErrorResponse(
      ErrorCodes.UPLOAD_ERROR,
      'El archivo es demasiado grande',
      error && typeof error === 'object' && 'message' in error ? { message: error.message as string } : undefined,
      'file',
      requestId
    );
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && (error.message.includes('file type') || error.message.includes('format'))) {
    return createErrorResponse(
      ErrorCodes.INVALID_FILE_FORMAT,
      'El formato del archivo no es válido',
      error && typeof error === 'object' && 'message' in error ? { message: error.message as string } : undefined,
      'file',
      requestId
    );
  }

  return createErrorResponse(
    ErrorCodes.UPLOAD_ERROR,
    `Error al subir el ${context}`,
    error && typeof error === 'object' && 'message' in error ? { message: error.message as string } : undefined,
    'file',
    requestId
  );
}

/**
 * Handles unexpected errors with proper logging
 */
export function handleUnexpectedError(
  error: unknown,
  context: string = 'operación',
  requestId?: string
): NextResponse<APIErrorResponse> {
  console.error(`Error inesperado en ${context}:`, error);
  
  return createErrorResponse(
    ErrorCodes.PROCESSING_ERROR,
    'Ha ocurrido un error inesperado',
    process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error ? { message: error.message as string } : undefined,
    undefined,
    requestId
  );
}

/**
 * Generates a unique request ID for error tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware wrapper for consistent error handling
 * 
 * Wraps API route handlers to provide automatic error handling for
 * unhandled exceptions, Zod validation errors, and APIError instances.
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler with error handling
 * 
 * @example
 * ```typescript
 * export const GET = withErrorHandling(async (request: NextRequest) => {
 *   // Your API logic here
 *   // Automatic error handling for unhandled exceptions
 * });
 * ```
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const requestId = generateRequestId();
    
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof APIError) {
        return createErrorResponseFromAPIError(error, requestId);
      }
      
      if (error instanceof z.ZodError) {
        return handleValidationError(error, requestId);
      }
      
      return handleUnexpectedError(error, 'API request', requestId);
    }
  };
}



/**
 * Validates tournament ownership for organizer-only operations
 */
export async function validateTournamentOwnership(
  supabase: SupabaseClient,
  tournamentId: string,
  userId: string,
  requestId?: string
): Promise<{ tournament: Record<string, unknown> } | NextResponse<APIErrorResponse>> {
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('id, organizer_id, name')
    .eq('id', tournamentId)
    .single();

  if (error) {
    return handleSupabaseError(error, 'búsqueda de torneo', requestId);
  }

  if (!tournament) {
    return createErrorResponse(
      ErrorCodes.NOT_FOUND,
      'Torneo no encontrado',
      undefined,
      undefined,
      requestId
    );
  }

  if (tournament.organizer_id !== userId) {
    return handleForbiddenError(
      'Solo el organizador del torneo puede realizar esta acción',
      requestId
    );
  }

  return { tournament };
}

/**
 * Validates user authentication and returns user profile
 */
export async function validateAuthentication(
  supabase: SupabaseClient,
  requestId?: string
): Promise<{ user: Record<string, unknown>; profile?: Record<string, unknown> } | NextResponse<APIErrorResponse>> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return handleAuthError(authError, requestId);
  }

  return { user: user as unknown as Record<string, unknown> };
}

/**
 * Validates user role for role-based operations
 */
export async function validateUserRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: string,
  requestId?: string
): Promise<{ profile: Record<string, unknown> } | NextResponse<APIErrorResponse>> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('user_role, first_name, last_name')
    .eq('id', userId)
    .single();

  if (error) {
    return handleSupabaseError(error, 'búsqueda de perfil', requestId);
  }

  if (!profile) {
    return createErrorResponse(
      ErrorCodes.NOT_FOUND,
      'Perfil de usuario no encontrado',
      undefined,
      undefined,
      requestId
    );
  }

  if (profile.user_role !== requiredRole) {
    return handleForbiddenError(
      `Esta acción requiere rol de ${requiredRole}`,
      requestId
    );
  }

  return { profile };
}