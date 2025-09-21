"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole, UserProfile } from '@/lib/types/tournament';
import { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isOrganizer: boolean;
  isPlayer: boolean;
  hasRole: (role: UserRole) => boolean;
  canManageTournament: (organizerId: string) => boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchUserAndProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      setUser(currentUser);

      // If user exists, fetch their profile
      if (currentUser) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is fine for new users
          throw profileError;
        }

        setProfile(userProfile || null);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user and profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    await fetchUserAndProfile();
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  // Helper functions
  const isAuthenticated = !!user;
  const isOrganizer = profile?.user_role === UserRole.ORGANIZER;
  const isPlayer = profile?.user_role === UserRole.PLAYER;
  
  const hasRole = (role: UserRole): boolean => {
    return profile?.user_role === role;
  };

  const canManageTournament = (organizerId: string): boolean => {
    return isAuthenticated && user?.id === organizerId;
  };

  useEffect(() => {
    fetchUserAndProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await fetchUserAndProfile();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    isOrganizer,
    isPlayer,
    hasRole,
    canManageTournament,
    refreshAuth,
    signOut,
  };
}

/**
 * Hook for checking if current user has specific permissions
 */
export function usePermissions() {
  const { user, profile, isAuthenticated, isOrganizer } = useAuth();

  const canCreateTournaments = isAuthenticated && isOrganizer;
  const canManageTournaments = isAuthenticated && isOrganizer;
  const canRegisterForTournaments = isAuthenticated && !!profile;
  const canViewTournaments = true; // Public access
  const canUploadTournamentFiles = isAuthenticated && isOrganizer;
  
  const canManageSpecificTournament = (tournamentOrganizerId: string): boolean => {
    return isAuthenticated && user?.id === tournamentOrganizerId;
  };

  const canEditProfile = isAuthenticated;
  const canViewProfile = isAuthenticated;

  return {
    canCreateTournaments,
    canManageTournaments,
    canRegisterForTournaments,
    canViewTournaments,
    canUploadTournamentFiles,
    canManageSpecificTournament,
    canEditProfile,
    canViewProfile,
  };
}

/**
 * Hook for role-based component rendering
 */
export function useRoleGuard() {
  const { isAuthenticated, isOrganizer, isPlayer, profile, loading } = useAuth();

  const requireAuth = (component: React.ReactNode, fallback?: React.ReactNode) => {
    if (loading) return null;
    return isAuthenticated ? component : (fallback || null);
  };

  const requireOrganizer = (component: React.ReactNode, fallback?: React.ReactNode) => {
    if (loading) return null;
    return isOrganizer ? component : (fallback || null);
  };

  const requirePlayer = (component: React.ReactNode, fallback?: React.ReactNode) => {
    if (loading) return null;
    return isPlayer ? component : (fallback || null);
  };

  const requireRole = (role: UserRole, component: React.ReactNode, fallback?: React.ReactNode) => {
    if (loading) return null;
    return profile?.user_role === role ? component : (fallback || null);
  };

  const requireCompleteProfile = (component: React.ReactNode, fallback?: React.ReactNode) => {
    if (loading) return null;
    const hasCompleteProfile = profile && profile.first_name && profile.last_name && profile.player_id;
    return hasCompleteProfile ? component : (fallback || null);
  };

  return {
    requireAuth,
    requireOrganizer,
    requirePlayer,
    requireRole,
    requireCompleteProfile,
  };
}