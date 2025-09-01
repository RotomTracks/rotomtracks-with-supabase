// Server-side API authentication and authorization utilities
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserRole, UserProfile } from '@/lib/types/tournament';
import { User } from '@supabase/supabase-js';

export interface AuthContext {
  user: User;
  profile: UserProfile;
}

export interface AuthError {
  error: string;
  message: string;
  code: string;
  status: number;
}

/**
 * Authenticates a request and returns user information
 * @param request - The Next.js request object
 * @returns Promise<AuthContext | AuthError>
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext | AuthError> {
  try {
    const supabase = await createClient();
    
    // Get the user from the request
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        error: 'Authentication failed',
        message: 'You must be signed in to access this resource',
        code: 'UNAUTHENTICATED',
        status: 401
      };
    }

    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        error: 'Profile not found',
        message: 'User profile is required to access this resource',
        code: 'PROFILE_REQUIRED',
        status: 403
      };
    }

    return { user, profile };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: 'Authentication error',
      message: 'An error occurred during authentication',
      code: 'AUTH_ERROR',
      status: 500
    };
  }
}

/**
 * Requires authentication for an API route
 * @param request - The Next.js request object
 * @returns Promise<AuthContext | NextResponse>
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext | NextResponse> {
  const auth = await authenticateRequest(request);
  
  if ('error' in auth) {
    return NextResponse.json(
      { error: auth.error, message: auth.message, code: auth.code },
      { status: auth.status }
    );
  }
  
  return auth;
}

/**
 * Requires a specific role for an API route
 * @param request - The Next.js request object
 * @param requiredRole - The role required to access the resource
 * @returns Promise<AuthContext | NextResponse>
 */
export async function requireRole(request: NextRequest, requiredRole: UserRole): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth(request);
  
  if (auth instanceof NextResponse) {
    return auth; // Already an error response
  }
  
  if (auth.profile.user_role !== requiredRole) {
    const roleNames = {
      [UserRole.ORGANIZER]: 'organizer',
      [UserRole.PLAYER]: 'player'
    };
    
    return NextResponse.json(
      {
        error: 'Insufficient permissions',
        message: `This resource requires ${roleNames[requiredRole]} access`,
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    );
  }
  
  return auth;
}

/**
 * Requires organizer role for an API route
 * @param request - The Next.js request object
 * @returns Promise<AuthContext | NextResponse>
 */
export async function requireOrganizer(request: NextRequest): Promise<AuthContext | NextResponse> {
  return requireRole(request, UserRole.ORGANIZER);
}

/**
 * Requires player role for an API route
 * @param request - The Next.js request object
 * @returns Promise<AuthContext | NextResponse>
 */
export async function requirePlayer(request: NextRequest): Promise<AuthContext | NextResponse> {
  return requireRole(request, UserRole.PLAYER);
}

/**
 * Checks if the authenticated user can manage a specific tournament
 * @param request - The Next.js request object
 * @param tournamentId - The tournament ID to check
 * @returns Promise<AuthContext | NextResponse>
 */
export async function requireTournamentManagement(request: NextRequest, tournamentId: string): Promise<AuthContext | NextResponse> {
  const auth = await requireOrganizer(request);
  
  if (auth instanceof NextResponse) {
    return auth; // Already an error response
  }
  
  try {
    const supabase = await createClient();
    
    // Check if the tournament exists and if the user is the organizer
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('organizer_id')
      .eq('id', tournamentId)
      .single();
    
    if (error || !tournament) {
      return NextResponse.json(
        {
          error: 'Tournament not found',
          message: 'The specified tournament does not exist',
          code: 'TOURNAMENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    if (tournament.organizer_id !== auth.user.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You can only manage tournaments that you organize',
          code: 'TOURNAMENT_UNAUTHORIZED'
        },
        { status: 403 }
      );
    }
    
    return auth;
  } catch (error) {
    console.error('Tournament management check error:', error);
    return NextResponse.json(
      {
        error: 'Authorization error',
        message: 'An error occurred while checking tournament permissions',
        code: 'AUTH_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Validates request method
 * @param request - The Next.js request object
 * @param allowedMethods - Array of allowed HTTP methods
 * @returns NextResponse | null (null if method is allowed)
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        error: 'Method not allowed',
        message: `Method ${request.method} is not allowed for this endpoint`,
        code: 'METHOD_NOT_ALLOWED'
      },
      { status: 405 }
    );
  }
  
  return null;
}

/**
 * Creates a standardized error response
 * @param error - Error message
 * @param message - User-friendly message
 * @param code - Error code
 * @param status - HTTP status code
 * @returns NextResponse
 */
export function createErrorResponse(error: string, message: string, code: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { error, message, code },
    { status }
  );
}

/**
 * Creates a standardized success response
 * @param data - Response data
 * @param message - Success message (optional)
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse
 */
export function createSuccessResponse(data: any, message?: string, status: number = 200): NextResponse {
  const response: any = { data };
  if (message) {
    response.message = message;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Wraps an API handler with authentication and error handling
 * @param handler - The API handler function
 * @param options - Configuration options
 * @returns Wrapped handler function
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthContext, ...args: any[]) => Promise<NextResponse>,
  options: {
    requireRole?: UserRole;
    allowedMethods?: string[];
  } = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Validate method if specified
      if (options.allowedMethods) {
        const methodError = validateMethod(request, options.allowedMethods);
        if (methodError) return methodError;
      }
      
      // Authenticate request
      let auth: AuthContext | NextResponse;
      
      if (options.requireRole) {
        auth = await requireRole(request, options.requireRole);
      } else {
        auth = await requireAuth(request);
      }
      
      if (auth instanceof NextResponse) {
        return auth; // Already an error response
      }
      
      // Call the actual handler
      return await handler(request, auth, ...args);
    } catch (error) {
      console.error('API handler error:', error);
      return createErrorResponse(
        'Internal server error',
        'An unexpected error occurred',
        'INTERNAL_ERROR',
        500
      );
    }
  };
}

/**
 * Wraps an API handler with organizer role requirement
 * @param handler - The API handler function
 * @param options - Configuration options
 * @returns Wrapped handler function
 */
export function withOrganizerAuth(
  handler: (request: NextRequest, auth: AuthContext, ...args: any[]) => Promise<NextResponse>,
  options: { allowedMethods?: string[] } = {}
) {
  return withAuth(handler, { ...options, requireRole: UserRole.ORGANIZER });
}

/**
 * Wraps an API handler with player role requirement
 * @param handler - The API handler function
 * @param options - Configuration options
 * @returns Wrapped handler function
 */
export function withPlayerAuth(
  handler: (request: NextRequest, auth: AuthContext, ...args: any[]) => Promise<NextResponse>,
  options: { allowedMethods?: string[] } = {}
) {
  return withAuth(handler, { ...options, requireRole: UserRole.PLAYER });
}