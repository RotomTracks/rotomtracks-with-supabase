'use client';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  UserPlus,
  Eye
} from 'lucide-react';

// Next.js
import Link from 'next/link';

// Types
import { 
  Tournament, 
  TournamentStatus, 
  ParticipantStatus,
  TournamentType,
  UserRole 
} from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  TournamentStatusManager,
  getStatusColor,
  getStatusText,
  getTournamentTypeIcon
} from '@/lib/utils/tournament-status';

interface TournamentCardProps {
  tournament: Tournament & {
    user_role?: 'participant' | 'organizer';
    registration_status?: ParticipantStatus;
  };
  viewMode?: 'grid' | 'list';
  userRole: UserRole | 'authenticated' | 'guest';
  showActions?: boolean;
  className?: string;
}

export function TournamentCard({ 
  tournament, 
  viewMode = 'grid', 
  userRole, 
  showActions = true,
  className = ''
}: TournamentCardProps) {
  // Use centralized formatting utilities
  const { formatShortDate, formatTime } = useTournamentFormatting();

  // Get tournament type icon using centralized utility
  const tournamentIcon = getTournamentTypeIcon(tournament.tournament_type as TournamentType);

  // Utility functions
  const getCapacityColor = (current: number, max?: number) => {
    if (!max) return 'text-gray-600';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRegistrationStatusBadge = (status?: ParticipantStatus) => {
    if (!status) return null;
    
    const config = TournamentStatusManager.getParticipantStatusConfig(status);
    return (
      <Badge variant="outline" className={config.color}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  // Tournament state checks
  const isUpcoming = tournament.status === TournamentStatus.UPCOMING;
  const isOngoing = tournament.status === TournamentStatus.ONGOING;
  const canRegister = tournament.registration_open && isUpcoming;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{tournamentIcon}</span>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {tournament.name}
                    </h3>
                    <Badge className={getStatusColor(tournament.status as TournamentStatus)}>
                      {getStatusText(tournament.status as TournamentStatus)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tournament.tournament_type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatShortDate(tournament.start_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(tournament.start_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{tournament.city}, {tournament.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className={getCapacityColor(tournament.current_players, tournament.max_players)}>
                    {tournament.current_players}
                    {tournament.max_players && `/${tournament.max_players}`}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {tournament.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {canRegister && userRole === 'authenticated' && (
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Registrarse
                </Button>
              )}
              <Link href={`/tournaments/${tournament.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalles
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }



  // Grid view
  return (
    <Card className={`hover:shadow-lg transition-shadow h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-xl">{tournamentIcon}</span>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg line-clamp-2">
                {tournament.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {tournament.tournament_type}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getStatusColor(tournament.status as TournamentStatus)}>
              {getStatusText(tournament.status as TournamentStatus)}
            </Badge>
            {tournament.registration_status && getRegistrationStatusBadge(tournament.registration_status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatShortDate(tournament.start_date)} • {formatTime(tournament.start_date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{tournament.city}, {tournament.country}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-gray-600" />
            <span className={getCapacityColor(tournament.current_players, tournament.max_players)}>
              {tournament.current_players} participantes
              {tournament.max_players && (
                <span className="text-gray-500"> / {tournament.max_players}</span>
              )}
            </span>
          </div>
          
          {tournament.max_players && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  (tournament.current_players / tournament.max_players) >= 0.9 ? 'bg-red-500' :
                  (tournament.current_players / tournament.max_players) >= 0.7 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (tournament.current_players / tournament.max_players) * 100)}%` 
                }}
              />
            </div>
          )}
          
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">
            {tournament.description}
          </p>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
            {canRegister && (userRole === 'authenticated' || userRole === 'participant') && !tournament.registration_status && (
              <Button size="sm" className="flex-1">
                <UserPlus className="h-4 w-4 mr-1" />
                Registrarse
              </Button>
            )}
            
            {tournament.user_role === 'organizer' && (
              <Link href={`/tournaments/${tournament.id}/manage`} className="flex-1">
                <Button size="sm" className="w-full">
                  Gestionar
                </Button>
              </Link>
            )}
            
            <Link href={`/tournaments/${tournament.id}`} className={tournament.user_role === 'organizer' ? '' : 'flex-1'}>
              <Button size="sm" variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                Ver Detalles
              </Button>
            </Link>
          </div>
        )}
        
        {canRegister && (
          <div className="mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <UserPlus className="h-3 w-3 mr-1" />
              Registro Abierto
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}