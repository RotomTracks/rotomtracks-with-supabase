'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TournamentStatusInfo {
  current: string;
  label: string;
  canTransitionTo: string[];
  progress: {
    percentage: number;
    completedMatches: number;
    totalMatches: number;
  };
  statistics: {
    participants: number;
    matches: number;
    results: number;
  };
  lastUpdated: string;
}

export interface TournamentStatusData {
  tournament: {
    id: string;
    name: string;
    status: string;
    current_players: number;
    start_date: string;
    end_date?: string;
  };
  statusInfo: TournamentStatusInfo;
}

interface UseTournamentStatusOptions {
  tournamentId: string;
  initialStatus?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useTournamentStatus({
  tournamentId,
  initialStatus,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseTournamentStatusOptions) {
  const [data, setData] = useState<TournamentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch tournament status
  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/tournaments/${tournamentId}/status`);
      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.message || 'Error al obtener el estado del torneo');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  // Update tournament status
  const updateStatus = useCallback(async (newStatus: string): Promise<boolean> => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local data
        if (data) {
          setData({
            ...data,
            tournament: {
              ...data.tournament,
              status: newStatus,
            },
            statusInfo: {
              ...data.statusInfo,
              current: newStatus,
              label: getStatusLabel(newStatus),
              canTransitionTo: getValidTransitions(newStatus),
              lastUpdated: new Date().toISOString(),
            },
          });
        }
        return true;
      } else {
        setError(result.message || 'Error al actualizar el estado');
        return false;
      }
    } catch (error) {
      setError('Error de conexión');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [tournamentId, data]);

  // Refresh data
  const refresh = useCallback(() => {
    setLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  // Check if status can be updated
  const canUpdateStatus = useCallback((newStatus: string): boolean => {
    if (!data) return false;
    return data.statusInfo.canTransitionTo.includes(newStatus);
  }, [data]);

  // Get status suggestions based on current state
  const getStatusSuggestions = useCallback((): Array<{
    status: string;
    label: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }> => {
    if (!data) return [];

    const suggestions = [];
    const { statusInfo } = data;

    // Auto-completion suggestion
    if (statusInfo.current === 'ongoing' && 
        statusInfo.progress.percentage === 100 && 
        statusInfo.progress.totalMatches > 0) {
      suggestions.push({
        status: 'completed',
        label: 'Completar Torneo',
        reason: 'Todas las partidas han sido completadas',
        priority: 'high' as const,
      });
    }

    // Start tournament suggestion
    if (statusInfo.current === 'upcoming' && 
        statusInfo.statistics.participants > 0) {
      suggestions.push({
        status: 'ongoing',
        label: 'Iniciar Torneo',
        reason: 'Hay participantes registrados',
        priority: 'medium' as const,
      });
    }

    // Warning about incomplete tournament
    if (statusInfo.current === 'completed' && 
        statusInfo.progress.percentage < 100) {
      suggestions.push({
        status: 'ongoing',
        label: 'Reactivar Torneo',
        reason: 'Hay partidas pendientes',
        priority: 'medium' as const,
      });
    }

    return suggestions;
  }, [data]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStatus]);

  // Set initial status if provided
  useEffect(() => {
    if (initialStatus && data && data.tournament.status !== initialStatus) {
      setData(prev => prev ? {
        ...prev,
        tournament: {
          ...prev.tournament,
          status: initialStatus,
        },
        statusInfo: {
          ...prev.statusInfo,
          current: initialStatus,
          label: getStatusLabel(initialStatus),
        },
      } : null);
    }
  }, [initialStatus, data]);

  return {
    data,
    loading,
    error,
    updating,
    updateStatus,
    refresh,
    canUpdateStatus,
    getStatusSuggestions,
    // Convenience getters
    currentStatus: data?.tournament.status,
    statusLabel: data?.statusInfo.label,
    progress: data?.statusInfo.progress,
    statistics: data?.statusInfo.statistics,
    canTransitionTo: data?.statusInfo.canTransitionTo || [],
  };
}

// Helper functions
function getStatusLabel(status: string): string {
  switch (status) {
    case 'upcoming': return 'Próximo';
    case 'ongoing': return 'En Curso';
    case 'completed': return 'Completado';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
}

function getValidTransitions(currentStatus: string): string[] {
  switch (currentStatus) {
    case 'upcoming':
      return ['ongoing', 'cancelled'];
    case 'ongoing':
      return ['completed', 'cancelled'];
    case 'completed':
      return ['ongoing'];
    case 'cancelled':
      return ['upcoming', 'ongoing'];
    default:
      return [];
  }
}