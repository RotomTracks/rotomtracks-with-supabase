'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { useTournamentStatus } from '@/lib/hooks/use-tournament-status';

interface TournamentStatusIndicatorProps {
  tournamentId: string;
  initialStatus?: string;
  showProgress?: boolean;
  showSuggestions?: boolean;
  showActions?: boolean;
  userRole?: 'organizer' | 'participant' | 'viewer';
  onStatusUpdate?: (newStatus: string) => void;
  compact?: boolean;
}

export function TournamentStatusIndicator({
  tournamentId,
  initialStatus,
  showProgress = true,
  showSuggestions = true,
  showActions = false,
  userRole = 'viewer',
  onStatusUpdate,
  compact = false
}: TournamentStatusIndicatorProps) {
  const {
    data,
    loading,
    error,
    updating,
    updateStatus,
    getStatusSuggestions,
    progress,
    statistics
  } = useTournamentStatus({
    tournamentId,
    initialStatus,
    autoRefresh: true,
    refreshInterval: 30000
  });

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
        <span className="text-sm text-gray-500">Cargando estado...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    const success = await updateStatus(newStatus);
    if (success) {
      onStatusUpdate?.(newStatus);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Calendar className="h-3 w-3" />;
      case 'ongoing': return <Play className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const suggestions = getStatusSuggestions();
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(data.tournament.status)}>
          {getStatusIcon(data.tournament.status)}
          <span className="ml-1">{data.statusInfo.label}</span>
        </Badge>
        
        {showProgress && progress && progress.totalMatches > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Target className="h-3 w-3" />
            <span>{progress.percentage}%</span>
          </div>
        )}

        {highPrioritySuggestions.length > 0 && userRole === 'organizer' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate(highPrioritySuggestions[0].status)}
            disabled={updating}
            className="text-xs px-2 py-1 h-6"
          >
            {highPrioritySuggestions[0].label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center space-x-3">
        <Badge className={`${getStatusColor(data.tournament.status)} px-3 py-1`}>
          {getStatusIcon(data.tournament.status)}
          <span className="ml-2 font-medium">{data.statusInfo.label}</span>
        </Badge>

        {updating && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
            <span>Actualizando...</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && progress && progress.totalMatches > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Progreso del torneo</span>
            <span>{progress.completedMatches} de {progress.totalMatches} partidas</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.percentage === 100 ? 'bg-green-500' : 
                progress.percentage > 50 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && !compact && (
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{statistics.participants} participantes</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-3 w-3" />
            <span>{statistics.matches} partidas</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>{statistics.results} resultados</span>
          </div>
        </div>
      )}

      {/* High Priority Suggestions */}
      {showSuggestions && highPrioritySuggestions.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>{highPrioritySuggestions[0].reason}</strong>
              {userRole === 'organizer' && (
                <p className="text-sm mt-1">
                  Se recomienda {highPrioritySuggestions[0].label.toLowerCase()}.
                </p>
              )}
            </div>
            {userRole === 'organizer' && showActions && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(highPrioritySuggestions[0].status)}
                disabled={updating}
              >
                {highPrioritySuggestions[0].label}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      {showActions && userRole === 'organizer' && data.statusInfo.canTransitionTo.length > 0 && (
        <div className="flex items-center space-x-2">
          {data.statusInfo.canTransitionTo.map(status => {
            const actionLabels: Record<string, string> = {
              upcoming: 'Marcar como Próximo',
              ongoing: 'Iniciar Torneo',
              completed: 'Completar Torneo',
              cancelled: 'Cancelar Torneo'
            };

            const actionVariants: Record<string, 'default' | 'outline' | 'destructive'> = {
              upcoming: 'outline',
              ongoing: 'default',
              completed: 'default',
              cancelled: 'destructive'
            };

            return (
              <Button
                key={status}
                size="sm"
                variant={actionVariants[status] || 'outline'}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating}
              >
                {getStatusIcon(status)}
                <span className="ml-1">{actionLabels[status] || status}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}