'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRealTimeUpdatesOptions {
  interval?: number;
  enabled?: boolean;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface TournamentUpdate {
  tournament_id: string;
  current_players: number;
  max_players?: number;
  registration_open: boolean;
  status: string;
  last_updated: string;
  recent_registrations: Array<{
    id: string;
    player_name: string;
    registration_date: string;
    status: string;
  }>;
}

interface NotificationUpdate {
  id: string;
  type: 'registration' | 'capacity_reached' | 'status_change' | 'waitlist_moved';
  tournament_id: string;
  tournament_name: string;
  message: string;
  timestamp: string;
  read: boolean;
}

/**
 * Hook for real-time tournament updates using polling
 */
export function useRealTimeTournamentUpdates(
  tournamentId: string,
  options: UseRealTimeUpdatesOptions = {}
) {
  const {
    interval = 5000, // 5 seconds
    enabled = true,
    onUpdate,
    onError
  } = options;

  const [data, setData] = useState<TournamentUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUpdate = useCallback(async () => {
    if (!enabled || !tournamentId) return;

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/tournaments/${tournamentId}/updates`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch updates: ${response.statusText}`);
      }

      const updateData: TournamentUpdate = await response.json();
      
      setData(prevData => {
        // Only update if data has actually changed
        if (!prevData || JSON.stringify(prevData) !== JSON.stringify(updateData)) {
          onUpdate?.(updateData);
          setLastUpdate(new Date());
          return updateData;
        }
        return prevData;
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }
      
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      setError(errorObj);
      onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId, enabled, onUpdate, onError]);

  // Start/stop polling
  useEffect(() => {
    if (!enabled || !tournamentId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchUpdate();

    // Set up polling
    intervalRef.current = setInterval(fetchUpdate, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUpdate, interval, enabled, tournamentId]);

  const refresh = useCallback(() => {
    fetchUpdate();
  }, [fetchUpdate]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refresh
  };
}

/**
 * Hook for real-time notifications for organizers
 */
export function useRealTimeNotifications(
  options: UseRealTimeUpdatesOptions = {}
) {
  const {
    interval = 10000, // 10 seconds for notifications
    enabled = true,
    onUpdate,
    onError
  } = options;

  const [notifications, setNotifications] = useState<NotificationUpdate[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/tournament-updates', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      const newNotifications: NotificationUpdate[] = data.notifications || [];
      
      setNotifications(prevNotifications => {
        // Only update if notifications have changed
        if (JSON.stringify(prevNotifications) !== JSON.stringify(newNotifications)) {
          onUpdate?.(newNotifications);
          return newNotifications;
        }
        return prevNotifications;
      });

      setUnreadCount(newNotifications.filter(n => !n.read).length);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      setError(errorObj);
      onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, onUpdate, onError]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchNotifications();

    // Set up polling
    intervalRef.current = setInterval(fetchNotifications, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNotifications, interval, enabled]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}

/**
 * Hook for real-time player count updates on tournament pages
 */
export function useRealTimePlayerCount(tournamentId: string, enabled = true) {
  const { data, isLoading, error, refresh } = useRealTimeTournamentUpdates(
    tournamentId,
    { 
      enabled,
      interval: 3000 // More frequent updates for player count
    }
  );

  return {
    currentPlayers: data?.current_players || 0,
    maxPlayers: data?.max_players,
    registrationOpen: data?.registration_open || false,
    tournamentStatus: data?.status || 'unknown',
    recentRegistrations: data?.recent_registrations || [],
    isLoading,
    error,
    refresh
  };
}

/**
 * Hook for tournament timeline/activity feed
 */
export function useTournamentActivity(tournamentId: string, enabled = true) {
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    player_name?: string;
    details?: any;
  }>>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!enabled || !tournamentId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/tournaments/${tournamentId}/activity`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }

      const data = await response.json();
      setActivities(data.activities || []);

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId, enabled]);

  useEffect(() => {
    if (!enabled || !tournamentId) return;

    fetchActivities();
    
    intervalRef.current = setInterval(fetchActivities, 15000); // 15 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchActivities, enabled, tournamentId]);

  return {
    activities,
    isLoading,
    error,
    refresh: fetchActivities
  };
}