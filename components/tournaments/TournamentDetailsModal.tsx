'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icons
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  UserPlus,
  Eye,
  Settings,
  Trophy,
  Share2,
  ExternalLink
} from 'lucide-react';

// Hooks
import { useTypedTranslation } from '@/lib/i18n';
import { useTournamentRegistration } from './useTournamentRegistration';

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

interface TournamentDetailsModalProps {
  tournament: (Tournament & {
    user_role?: 'participant' | 'organizer';
    registration_status?: ParticipantStatus;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole | 'authenticated' | 'guest';
}

export function TournamentDetailsModal({ 
  tournament, 
  isOpen, 
  onClose, 
  userRole 
}: TournamentDetailsModalProps) {
  const { tTournaments } = useTypedTranslation();
  const { formatDate, formatTime } = useTournamentFormatting();
  
  // Registration hook - must be called before any conditional returns
  const { registerForTournament, isLoading: isRegistering } = useTournamentRegistration({
    tournamentId: tournament?.id || '',
    onSuccess: () => {
      // Close modal and refresh
      onClose();
      window.location.reload();
    }
  });

  if (!tournament) return null;

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
  const canRegister = tournament.registration_open && isUpcoming;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tournament.name,
        text: tournament.description,
        url: window.location.origin + `/tournaments/${tournament.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/tournaments/${tournament.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 bg-white dark:bg-gray-900">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{tournamentIcon}</span>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {tournament.name}
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {tournament.tournament_type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getUserRoleBadge()}
              {tournament.registration_status && getRegistrationStatusBadge(tournament.registration_status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Details and Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-gray-800 dark:bg-gray-700 border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5" />
                  <span>{tTournaments('details.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-200">
                    <Calendar className="h-4 w-4 text-gray-300" />
                    <span className="font-medium">{tTournaments('date')}:</span>
                    <span>{formatDate(tournament.start_date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-200">
                    <Clock className="h-4 w-4 text-gray-300" />
                    <span className="font-medium">{tTournaments('time')}:</span>
                    <span>{formatTime(tournament.start_date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-200">
                    <MapPin className="h-4 w-4 text-gray-300" />
                    <span className="font-medium">{tTournaments('location')}:</span>
                    <span>{tournament.city}, {tournament.country}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-200">
                    <Users className="h-4 w-4 text-gray-300" />
                    <span className="font-medium">{tTournaments('actions.participants')}:</span>
                    <span className={getCapacityColor(tournament.current_players, tournament.max_players)}>
                      {tournament.current_players}
                      {tournament.max_players && ` / ${tournament.max_players}`}
                    </span>
                  </div>
                </div>

                {tournament.max_players && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-200">
                      <span>{tTournaments('management.participants')}</span>
                      <span>{Math.round((tournament.current_players / tournament.max_players) * 100)}%</span>
                    </div>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Format Information */}
            <Card className="bg-gray-800 dark:bg-gray-700 border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2 text-white">
                  <Trophy className="h-5 w-5" />
                  <span>{tTournaments('details.format')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium">{tTournaments('name')}:</span>
                    <span>{tournament.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tipo:</span>
                    <span>{tournament.tournament_type}</span>
                  </div>
                  {tournament.official_tournament_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">ID Oficial:</span>
                      <span className="font-mono text-xs">{tournament.official_tournament_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">{tTournaments('management.status')}:</span>
                    <Badge className={getStatusColor(tournament.status as TournamentStatus)}>
                      {getStatusText(tournament.status as TournamentStatus)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="bg-gray-800 dark:bg-gray-700 border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2 text-white">
                <Eye className="h-5 w-5" />
                <span>{tTournaments('description')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-200 leading-relaxed">
                {tournament.description}
              </p>
            </CardContent>
          </Card>

          {/* Actions - Aligned to the right on PC */}
          <div className="flex justify-end">
            <div className="flex flex-wrap gap-3">
              {canRegister && userRole === 'authenticated' && !tournament.registration_status && (
                <Button 
                  className="text-white"
                  onClick={registerForTournament}
                  disabled={isRegistering}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isRegistering ? tTournaments('actions.registering') : tTournaments('actions.register')}
                </Button>
              )}
              
              {tournament.user_role === 'organizer' && (
                <Link href={`/tournaments/${tournament.id}/manage`}>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    {tTournaments('actions.manage')}
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {tTournaments('details.share')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
