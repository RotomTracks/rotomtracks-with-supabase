// Role-based access control utilities
import { createClient } from '@/lib/supabase/server';
import { UserRole, UserProfile } from '@/lib/types/tournament';
import { User } from '@supabase/supabase-js';

/**
 * Gets the user profile with role information
 * @param userId - The user ID to fetch profile for
 * @returns UserProfile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Gets the user role for a given user ID
 * @param userId - The user ID to check role for
 * @returns UserRole or null if not found
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const profile = await getUserProfile(userId);
  return profile?.user_role || null;
}

/**
 * Checks if a user has a specific role
 * @param userId - The user ID to check
 * @param requiredRole - The role to check for
 * @returns boolean indicating if user has the required role
 */
export async function hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole === requiredRole;
}

/**
 * Checks if a user is an organizer
 * @param userId - The user ID to check
 * @returns boolean indicating if user is an organizer
 */
export async function isOrganizer(userId: string): Promise<boolean> {
  return await hasRole(userId, UserRole.ORGANIZER);
}

/**
 * Checks if a user is a player
 * @param userId - The user ID to check
 * @returns boolean indicating if user is a player
 */
export async function isPlayer(userId: string): Promise<boolean> {
  return await hasRole(userId, UserRole.PLAYER);
}

/**
 * Checks if a user is an admin
 * @param userId - The user ID to check
 * @returns boolean indicating if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return await hasRole(userId, UserRole.ADMIN);
}

/**
 * Gets the current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Gets the current user's profile
 * @returns UserProfile or null if not found
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return await getUserProfile(user.id);
}

/**
 * Gets the current user's role
 * @returns UserRole or null if not found
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return await getUserRole(user.id);
}

/**
 * Checks if the current user has a specific role
 * @param requiredRole - The role to check for
 * @returns boolean indicating if current user has the required role
 */
export async function currentUserHasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return await hasRole(user.id, requiredRole);
}

/**
 * Checks if the current user is an organizer
 * @returns boolean indicating if current user is an organizer
 */
export async function currentUserIsOrganizer(): Promise<boolean> {
  return await currentUserHasRole(UserRole.ORGANIZER);
}

/**
 * Checks if the current user is a player
 * @returns boolean indicating if current user is a player
 */
export async function currentUserIsPlayer(): Promise<boolean> {
  return await currentUserHasRole(UserRole.PLAYER);
}

/**
 * Checks if the current user is an admin
 * @returns boolean indicating if current user is an admin
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  return await currentUserHasRole(UserRole.ADMIN);
}

/**
 * Checks if a user can manage a specific tournament
 * @param userId - The user ID to check
 * @param tournamentOrganizerId - The organizer ID of the tournament
 * @returns boolean indicating if user can manage the tournament
 */
export async function canManageTournament(userId: string, tournamentOrganizerId: string): Promise<boolean> {
  // User can manage tournament if they are the organizer
  if (userId === tournamentOrganizerId) {
    return true;
  }
  
  // Admins can manage any tournament
  if (await isAdmin(userId)) {
    return true;
  }
  
  return false;
}

/**
 * Checks if a user has admin privileges (can perform admin actions)
 * @param userId - The user ID to check
 * @returns boolean indicating if user has admin privileges
 */
export async function hasAdminPrivileges(userId: string): Promise<boolean> {
  return await isAdmin(userId);
}

/**
 * Checks if the current user has admin privileges
 * @returns boolean indicating if current user has admin privileges
 */
export async function currentUserHasAdminPrivileges(): Promise<boolean> {
  return await currentUserIsAdmin();
}

/**
 * Checks if the current user can manage a specific tournament
 * @param tournamentOrganizerId - The organizer ID of the tournament
 * @returns boolean indicating if current user can manage the tournament
 */
export async function currentUserCanManageTournament(tournamentOrganizerId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return await canManageTournament(user.id, tournamentOrganizerId);
}

/**
 * Role-based route protection configuration
 */
export const PROTECTED_ROUTES = {
  // Routes that require authentication
  AUTHENTICATED: [
    '/protected',
    '/tournaments/create',
    '/tournaments/manage',
    '/profile',
  ],
  
  // Routes that require organizer role
  ORGANIZER_ONLY: [
    '/tournaments/create',
    '/tournaments/manage',
    '/tournaments/upload',
  ],
  
  // Routes that require player role (if any specific to players)
  PLAYER_ONLY: [
    // Add player-specific routes here if needed
  ],
  
  // Routes that require admin role
  ADMIN_ONLY: [
    '/admin',
    '/admin/dashboard',
    '/admin/organizer-requests',
    '/admin/settings',
  ],
  
  // Public routes that don't require authentication
  PUBLIC: [
    '/',
    '/auth/login',
    '/auth/sign-up',
    '/auth/sign-up-success',
    '/auth/confirm',
    '/auth/reset-password',
    '/auth/error',
    '/tournaments/search',
    '/tournaments/[id]', // Tournament details are public
  ],
} as const;

/**
 * Checks if a route requires authentication
 * @param pathname - The route pathname to check
 * @returns boolean indicating if route requires authentication
 */
export function requiresAuthentication(pathname: string): boolean {
  return PROTECTED_ROUTES.AUTHENTICATED.some(route => 
    pathname.startsWith(route) || pathname === route
  );
}

/**
 * Checks if a route requires organizer role
 * @param pathname - The route pathname to check
 * @returns boolean indicating if route requires organizer role
 */
export function requiresOrganizerRole(pathname: string): boolean {
  return PROTECTED_ROUTES.ORGANIZER_ONLY.some(route => 
    pathname.startsWith(route) || pathname === route
  );
}

/**
 * Checks if a route requires player role
 * @param pathname - The route pathname to check
 * @returns boolean indicating if route requires player role
 */
export function requiresPlayerRole(pathname: string): boolean {
  return PROTECTED_ROUTES.PLAYER_ONLY.some(route => 
    pathname.startsWith(route) || pathname === route
  );
}

/**
 * Checks if a route requires admin role
 * @param pathname - The route pathname to check
 * @returns boolean indicating if route requires admin role
 */
export function requiresAdminRole(pathname: string): boolean {
  return PROTECTED_ROUTES.ADMIN_ONLY.some(route => 
    pathname.startsWith(route) || pathname === route
  );
}

/**
 * Checks if a route is public (doesn't require authentication)
 * @param pathname - The route pathname to check
 * @returns boolean indicating if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.PUBLIC.some(route => {
    // Handle dynamic routes like /tournaments/[id]
    if (route.includes('[id]')) {
      const routePattern = route.replace('[id]', '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(pathname);
    }
    return pathname.startsWith(route) || pathname === route;
  });
}