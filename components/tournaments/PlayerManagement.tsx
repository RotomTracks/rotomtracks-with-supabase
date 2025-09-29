'use client';

// React
import React, { useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import { 
  Users, 
  UserX, 
  MoreVertical,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Types
import { TournamentParticipant, ParticipantStatus, UserRole } from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { useTypedTranslation } from '@/lib/i18n/hooks/useTypedTranslation';
import { 
  TournamentStatusManager
} from '@/lib/utils/tournament-status';

interface PlayerManagementProps {
  tournamentId: string;
  participants: TournamentParticipant[];
  onParticipantUpdate: () => void;
  userRole?: UserRole;
  loading?: boolean;
  error?: string | null;
}

export default function PlayerManagement({ 
  tournamentId, 
  participants, 
  onParticipantUpdate,
  userRole = UserRole.ORGANIZER,
  loading = false,
  error: externalError = null
}: PlayerManagementProps) {
  // Hooks
  const { tTournaments } = useTypedTranslation();
  const { formatDate, formatDateTime } = useTournamentFormatting();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<TournamentParticipant | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use external error if provided
  const currentError = externalError || error;

  // Filter participants based on search and status
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (participant.player_id && participant.player_id.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics using enum values
  const stats = {
    total: participants.length,
    registered: participants.filter(p => p.status === ParticipantStatus.REGISTERED).length,
    confirmed: participants.filter(p => p.status === ParticipantStatus.CHECKED_IN).length,
    dropped: participants.filter(p => p.status === ParticipantStatus.DROPPED).length,
  };

  const updateParticipantStatus = async (participantId: string, newStatus: string) => {
    setActionLoading(participantId);
    setError(null);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update participant status');
      }

      onParticipantUpdate();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const removeParticipant = async (participantId: string) => {
    setActionLoading(participantId);
    setError(null);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove participant');
      }

      onParticipantUpdate();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  // Use centralized status management
  const getParticipantStatusBadge = (status: ParticipantStatus) => {
    const config = TournamentStatusManager.getParticipantStatusConfig(status);
    return (
      <Badge className={config.color}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
{tTournaments('management.participants')}
        </CardTitle>
        <CardDescription>
          {tTournaments('management.participantsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="status" aria-label={tTournaments('management.loadingParticipants')}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <span className="sr-only">{tTournaments('management.loadingParticipants')}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return renderLoadingState();

  return (
    <Card className="bg-transparent border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
{tTournaments('management.participants')}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
{tTournaments('management.participantsDescription')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{tTournaments('management.total')}</div>
          </div>
          <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.registered}</div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
              {tTournaments('management.registered')}
            </div>
          </div>
          <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.confirmed}</div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
              {tTournaments('management.confirmed')}
            </div>
          </div>
          <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.dropped}</div>
            <div className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
              {tTournaments('management.dropped')}
            </div>
          </div>
        </div>

        {/* Search, Filter and Participants List */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Search and Filter Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
{tTournaments('management.searchParticipants')}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="search"
                    placeholder={tTournaments('management.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    aria-label={tTournaments('management.searchAriaLabel')}
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
{tTournaments('management.filterByStatus')}
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800" 
                      aria-label={tTournaments('management.filterAriaLabel')}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {statusFilter === 'all' ? tTournaments('management.allStatuses') : 
                       statusFilter === ParticipantStatus.REGISTERED ? tTournaments('management.registered') :
                       statusFilter === ParticipantStatus.CHECKED_IN ? tTournaments('management.confirmed') :
                       statusFilter === ParticipantStatus.DROPPED ? tTournaments('management.dropped') : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
{tTournaments('management.allStatuses')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ParticipantStatus.REGISTERED)}>
{tTournaments('management.registered')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ParticipantStatus.CHECKED_IN)}>
{tTournaments('management.confirmed')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(ParticipantStatus.DROPPED)}>
{tTournaments('management.dropped')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {currentError && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{currentError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Participants List */}
          <div className="p-4">
            <div className="space-y-2" role="list" aria-label={tTournaments('management.participantsList')}>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">{tTournaments('management.noParticipantsFound')}</p>
              {searchTerm && (
                <p className="text-sm text-gray-500 dark:text-gray-500">{tTournaments('management.clearSearch')}</p>
              )}
            </div>
          ) : (
            filteredParticipants.map((participant, index) => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                role="listitem"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-lg">{participant.player_name}</h4>
                      {getParticipantStatusBadge(participant.status as ParticipantStatus)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {participant.player_id && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{tTournaments('management.playerId')}:</span>
                          <span className="font-mono">{participant.player_id}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(participant.registration_date, 'short')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedParticipant(participant)}
                        aria-label={`${tTournaments('management.participantDetails')} - ${participant.player_name}`}
                      >
{tTournaments('management.participantDetails')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{tTournaments('management.participantDetails')}</DialogTitle>
                        <DialogDescription>
                          {tTournaments('management.participantDetails')} - {participant.player_name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedParticipant && (
                        <div className="space-y-4">
                          <div>
                            <Label>{tTournaments('management.playerName')}</Label>
                            <p className="text-sm">{selectedParticipant.player_name}</p>
                          </div>
                          
                          {selectedParticipant.player_id && (
                            <div>
                              <Label>{tTournaments('management.playerIdLabel')}</Label>
                              <p className="text-sm">{selectedParticipant.player_id}</p>
                            </div>
                          )}
                          
                          {selectedParticipant.player_birthdate && (
                            <div>
                              <Label>{tTournaments('management.birthDate')}</Label>
                              <p className="text-sm">
                                {formatDate(selectedParticipant.player_birthdate, 'long')}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <Label>{tTournaments('management.registrationDate')}</Label>
                            <p className="text-sm">
                              {formatDateTime(selectedParticipant.registration_date)}
                            </p>
                          </div>
                          
                          <div>
                            <Label>{tTournaments('management.status')}</Label>
                            <p className="text-sm">
                              {selectedParticipant.status === ParticipantStatus.REGISTERED ? tTournaments('management.registered') :
                               selectedParticipant.status === ParticipantStatus.CHECKED_IN ? tTournaments('management.confirmed') :
                               selectedParticipant.status === ParticipantStatus.DROPPED ? tTournaments('management.dropped') : 
                               selectedParticipant.status}
                            </p>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={actionLoading === participant.id}
                      >
                        {actionLoading === participant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {participant.status === ParticipantStatus.REGISTERED && (
                        <DropdownMenuItem 
                          onClick={() => updateParticipantStatus(participant.id, ParticipantStatus.CHECKED_IN)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
{tTournaments('management.confirmParticipant')}
                        </DropdownMenuItem>
                      )}
                      

                      
                      {participant.status !== ParticipantStatus.DROPPED && (
                        <DropdownMenuItem 
                          onClick={() => updateParticipantStatus(participant.id, ParticipantStatus.DROPPED)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Marcar como Retirado
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => removeParticipant(participant.id)}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
{tTournaments('management.dropParticipant')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}