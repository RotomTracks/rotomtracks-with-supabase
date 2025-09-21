'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRealTimePlayerCount } from '@/lib/hooks/useRealTimeUpdates';
import { 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface RealTimePlayerCountProps {
  tournamentId: string;
  initialCount?: number;
  initialMax?: number;
  initialRegistrationOpen?: boolean;
  initialStatus?: string;
  showRecentRegistrations?: boolean;
  compact?: boolean;
  className?: string;
}

export default function RealTimePlayerCount({
  tournamentId,
  initialCount = 0,
  initialMax,
  initialRegistrationOpen = false,
  initialStatus = 'upcoming',
  showRecentRegistrations = false,
  compact = false,
  className = ''
}: RealTimePlayerCountProps) {
  const {
    currentPlayers,
    maxPlayers,
    registrationOpen,
    tournamentStatus,
    recentRegistrations,
    isLoading,
    error
  } = useRealTimePlayerCount(tournamentId, true);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
        
        {isRegistrationOpen && status === 'upcoming' && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <UserPlus className="h-3 w-3 mr-1" />
            Open
          </Badge>
        )}
        
        {isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Participants</h3>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            <Badge className={getStatusColor(status)}>
              {status}
            </Badge>
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
                {playerCount === 1 ? 'participant' : 'participants'}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              {isRegistrationOpen && status === 'upcoming' && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Registration Open
                </Badge>
              )}
              
              {maxPlayerCount && (
                <Badge variant={getCapacityBadgeVariant(playerCount, maxPlayerCount)}>
                  {playerCount >= maxPlayerCount ? 'Full' : 
                   playerCount >= maxPlayerCount * 0.9 ? 'Nearly Full' : 
                   'Available'}
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
                {Math.round((playerCount / maxPlayerCount) * 100)}% capacity
              </p>
            </div>
          )}

          {/* Capacity Alert */}
          {maxPlayerCount && playerCount >= maxPlayerCount && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tournament is at full capacity. New registrations will be waitlisted.
              </AlertDescription>
            </Alert>
          )}

          {/* Recent Registrations */}
          {showRecentRegistrations && recentRegistrations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Registrations
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
                        {new Date(registration.registration_date).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {recentRegistrations.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{recentRegistrations.length - 3} more recent registrations
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load real-time updates: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Last Update */}
          <p className="text-xs text-muted-foreground text-center">
            Updates every 3 seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}