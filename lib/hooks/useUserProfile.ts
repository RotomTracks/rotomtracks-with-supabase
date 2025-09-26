"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/lib/types/tournament';
import { User } from '@supabase/supabase-js';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  createProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
}

export function useUserProfile(user: User | null): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Profile doesn't exist yet
          setProfile(null);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);

      const newProfile = {
        user_id: user.id,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        player_id: profileData.player_id || '',
        birth_year: profileData.birth_year,
        user_role: profileData.user_role || UserRole.PLAYER,
        organization_name: profileData.organization_name,
      };

      const { data, error: createError } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error creating user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      return null;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user?.id || !profile?.id) {
      setError('User not authenticated or profile not found');
      return null;
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id, fetchProfile]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refreshProfile,
  };
}