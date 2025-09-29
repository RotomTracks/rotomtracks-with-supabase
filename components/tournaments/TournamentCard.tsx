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
  UserMinus,
  Eye,
  Settings,
  Trophy,
  Mail
} from 'lucide-react';

// Hooks
import { useTypedTranslation } from '@/lib/i18n';
import { useTournamentRegistration } from './useTournamentRegistration';

// Next.js
import Link from 'next/link';

// Types
import { 
  TournamentWithOrganizer,
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
  tournament: TournamentWithOrganizer & {
    user_role?: 'participant' | 'organizer';
    registration_status?: ParticipantStatus;
  };
  viewMode?: 'grid' | 'list';
  userRole: UserRole | 'authenticated' | 'guest';
  showActions?: boolean;
  className?: string;
  onViewDetails?: (tournament: TournamentWithOrganizer) => void;
}

export function TournamentCard({ 
  tournament, 
  viewMode = 'grid', 
  userRole, 
  showActions = true,
  className = '',
  onViewDetails
}: TournamentCardProps) {
  
  // Use centralized formatting utilities
  const { formatDate, formatTime } = useTournamentFormatting();
  const { tTournaments } = useTypedTranslation();
  
  // Registration hook
  const { registerForTournament, unregisterFromTournament, isLoading: isRegistering } = useTournamentRegistration({
    tournamentId: tournament.id,
    onSuccess: () => {
      // Refresh the page or update the tournament data
      window.location.reload();
    }
  });

  // Get tournament type icon using centralized utility
  const tournamentIcon = getTournamentTypeIcon(tournament.tournament_type as TournamentType);

  // Utility functions
  const getCapacityColor = (current: number, max?: number) => {
    if (!max) return 'text-gray-600 dark:text-gray-400';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
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

  const getUserRoleBadge = () => {
    if (tournament.user_role === 'organizer') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Settings className="w-3 h-3 mr-1" />
          {tTournaments('dashboard.role.organizing')}
        </Badge>
      );
    } else if (tournament.user_role === 'participant') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Trophy className="w-3 h-3 mr-1" />
          {tTournaments('dashboard.role.participating')}
        </Badge>
      );
    }
    return null;
  };

  // Tournament state checks
  const isUpcoming = tournament.status === TournamentStatus.UPCOMING;
  const canRegister = tournament.registration_open && isUpcoming && !tournament.is_organizer;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{tournamentIcon}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {tournament.name}
                    </h3>
                    <Badge className={getStatusColor(tournament.status as TournamentStatus)}>
                      {getStatusText(tournament.status as TournamentStatus)}
                    </Badge>
                    {getUserRoleBadge()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tournament.tournament_type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tournament.start_date)}</span>
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
              
             <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {tournament.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {canRegister && userRole === 'authenticated' && (
                <Button 
                  size="sm" 
                  className="text-white"
                  onClick={tournament.user_registration_status === 'not_registered' ? registerForTournament : unregisterFromTournament}
                  disabled={isRegistering}
                >
                  {tournament.user_registration_status === 'not_registered' ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      {isRegistering ? tTournaments('actions.registering') : tTournaments('actions.register')}
                    </>
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-1" />
                      {isRegistering ? tTournaments('actions.unregistering') : tTournaments('actions.unregister')}
                    </>
                  )}
                </Button>
              )}
              {onViewDetails ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  onClick={() => onViewDetails(tournament)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {tTournaments('actions.viewDetails')}
                </Button>
              ) : (
                <Link href={`/tournaments/${tournament.id}`}>
                  <Button size="sm" variant="outline" className="bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    <Eye className="h-4 w-4 mr-1" />
                    {tTournaments('actions.viewDetails')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className={`hover:shadow-lg transition-shadow h-full flex flex-col bg-gray-50 dark:bg-gray-800 border-0 ${className}`}
      role="article"
      aria-labelledby={`tournament-title-${tournament.id}`}
      aria-describedby={`tournament-description-${tournament.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-xl">{tournamentIcon}</span>
            <div className="min-w-0 flex-1">
              <CardTitle 
                id={`tournament-title-${tournament.id}`}
                className="text-lg line-clamp-2"
              >
                {tournament.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {tournament.tournament_type}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
              <div className="flex flex-col gap-1">
              <Badge className={getStatusColor(tournament.status as TournamentStatus)}>
                  {getStatusText(tournament.status as TournamentStatus)}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                {canRegister && (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                    <UserPlus className="h-3 w-3 mr-1" />
                    {tTournaments('actions.registrationOpen')}
                  </Badge>
                )}
              {tournament.registration_status && getRegistrationStatusBadge(tournament.registration_status)}
              </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tournament.start_date)} • {formatTime(tournament.start_date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{tournament.city}, {tournament.country}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className={getCapacityColor(tournament.current_players, tournament.max_players)}>
              {tournament.current_players} {tTournaments('actions.participants')}
              {tournament.max_players && (
                <span className="text-gray-500 dark:text-gray-500"> / {tournament.max_players}</span>
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
          
          <p 
            id={`tournament-description-${tournament.id}`}
            className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-1"
          >
            {tournament.description}
          </p>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
            {canRegister && userRole === 'authenticated' && (
              <Button 
                size="sm" 
                className="flex-1 text-white"
                onClick={tournament.user_registration_status === 'not_registered' ? registerForTournament : unregisterFromTournament}
                disabled={isRegistering}
              >
                {tournament.user_registration_status === 'not_registered' ? (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    {isRegistering ? tTournaments('actions.registering') : tTournaments('actions.register')}
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    {isRegistering ? tTournaments('actions.unregistering') : tTournaments('actions.unregister')}
                  </>
                )}
              </Button>
            )}
            
            {tournament.user_role === 'organizer' && (
              <Link href={`/tournaments/${tournament.id}/manage`} className="flex-1">
                <Button size="sm" className="w-full">
                  {tTournaments('actions.manage')}
                </Button>
              </Link>
            )}
            
            {onViewDetails ? (
              <Button 
                size="sm" 
                variant="outline" 
                className={`w-full bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white ${tournament.user_role === 'organizer' ? 'flex-1' : 'flex-1'}`}
                onClick={() => onViewDetails(tournament)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {tTournaments('actions.viewDetails')}
              </Button>
            ) : (
              <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  <Eye className="h-4 w-4 mr-1" />
                  {tTournaments('actions.viewDetails')}
                </Button>
              </Link>
            )}
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}