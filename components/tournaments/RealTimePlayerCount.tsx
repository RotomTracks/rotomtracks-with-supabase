'use client';

// React
import React from 'react';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Hooks
import { useRealTimePlayerCount } from '@/lib/hooks/useRealTimeUpdates';

// Types
import { TournamentStatus, UserRole, ParticipantStatus } from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  TournamentStatusManager,
  getStatusColor,
  getStatusText,
  STATUS_TRANSLATIONS
} from '@/lib/utils/tournament-status';

interface RealTimePlayerCountProps {
  tournamentId: string;
  initialCount?: number;
  initialMax?: number;
  initialRegistrationOpen?: boolean;
  initialStatus?: string;
  showRecentRegistrations?: boolean;
  compact?: boolean;
  className?: string;
  userRole?: UserRole;
  loading?: boolean;
  error?: string | null;
}

export default function RealTimePlayerCount({
  tournamentId,
  initialCount = 0,
  initialMax,
  initialRegistrationOpen = false,
  initialStatus = 'upcoming',
  showRecentRegistrations = false,
  compact = false,
  className = '',
  userRole = UserRole.PLAYER,
  loading: externalLoading = false,
  error: externalError = null
}: RealTimePlayerCountProps) {
  // Hooks
  const { formatDateTime, formatTime } = useTournamentFormatting();
  
  const {
    currentPlayers,
    maxPlayers,
    registrationOpen,
    tournamentStatus,
    recentRegistrations,
    isLoading,
    error
  } = useRealTimePlayerCount(tournamentId, false);
  
  // Use external loading/error states if provided
  const currentLoading = externalLoading || isLoading;
  const currentError = externalError || error;

  // Use real-time data if available, otherwise fall back to initial values
  const playerCount = currentPlayers || initialCount;
  const maxPlayerCount = maxPlayers || initialMax;
  const isRegistrationOpen = registrationOpen !== undefined ? registrationOpen : initialRegistrationOpen;
  const status = tournamentStatus !== 'unknown' ? tournamentStatus : initialStatus;

  const getCapacityColor = (current: number, max?: number) => {
    if (!max) return 'text-blue-600';
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-orange-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCapacityBadgeVariant = (current: number, max?: number) => {
    if (!max) return 'secondary';
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'destructive';
    if (percentage >= 90) return 'outline';
    return 'secondary';
  };

  // Use centralized status management
  const getTournamentStatusBadge = (status: string) => {
    return (
      <Badge className={getStatusColor(status as TournamentStatus)}>
        {getStatusText(status as TournamentStatus)}
      </Badge>
    );
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className={`font-medium ${getCapacityColor(playerCount, maxPlayerCount)}`}>
            {playerCount}
            {maxPlayerCount && `/${maxPlayerCount}`}
          </span>
        </div>
        
        {isRegistrationOpen && status === TournamentStatus.UPCOMING && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <UserPlus className="h-3 w-3 mr-1" />
            Abierto
          </Badge>
        )}
        
        {currentLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Participantes</h3>
              {currentLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {getTournamentStatusBadge(status)}
          </div>

          {/* Player Count */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${getCapacityColor(playerCount, maxPlayerCount)}`}>
                {playerCount}
                {maxPlayerCount && (
                  <span className="text-lg text-muted-foreground">
                    /{maxPlayerCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {playerCount === 1 ? 'participante' : 'participantes'}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              {isRegistrationOpen && status === TournamentStatus.UPCOMING && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Registro Abierto
                </Badge>
              )}
              
              {maxPlayerCount && (
                <Badge variant={getCapacityBadgeVariant(playerCount, maxPlayerCount)}>
                  {playerCount >= maxPlayerCount ? 'Completo' : 
                   playerCount >= maxPlayerCount * 0.9 ? 'Casi Completo' : 
                   'Disponible'}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {maxPlayerCount && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    playerCount >= maxPlayerCount ? 'bg-red-500' :
                    playerCount >= maxPlayerCount * 0.9 ? 'bg-orange-500' :
                    playerCount >= maxPlayerCount * 0.7 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (playerCount / maxPlayerCount) * 100)}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {Math.round((playerCount / maxPlayerCount) * 100)}% de capacidad
              </p>
            </div>
          )}

          {/* Capacity Alert */}
          {maxPlayerCount && playerCount >= maxPlayerCount && (
            <Alert role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El torneo está completo. Los nuevos registros se pondrán en lista de espera.
              </AlertDescription>
            </Alert>
          )}

          {/* Recent Registrations */}
          {showRecentRegistrations && recentRegistrations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Registros Recientes
              </h4>
              <div className="space-y-1">
                {recentRegistrations.slice(0, 3).map((registration) => (
                  <div 
                    key={registration.id}
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{registration.player_name}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={registration.status === 'registered' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {registration.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(registration.registration_date)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {recentRegistrations.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{recentRegistrations.length - 3} registros recientes más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {currentError && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar actualizaciones en tiempo real: {currentError instanceof Error ? currentError.message : currentError}
              </AlertDescription>
            </Alert>
          )}

          {/* Last Update */}
          <p className="text-xs text-muted-foreground text-center">
            Se actualiza cada 3 segundos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}