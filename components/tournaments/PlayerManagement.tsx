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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Player Management
        </CardTitle>
        <CardDescription>
          Manage tournament participants, approve registrations, and update player status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="status" aria-label="Cargando participantes">
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
          <span className="sr-only">Cargando participantes...</span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return renderLoadingState();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestión de Participantes
        </CardTitle>
        <CardDescription>
          Gestiona los participantes del torneo, aprueba registros y actualiza estados
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.total}</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Total</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.registered}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Registrados
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Confirmados
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.dropped}</div>
            <div className="text-sm text-red-700 dark:text-red-300">
              Retirados
            </div>
          </div>
        </div>

        <Separator />

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar Participantes</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nombre o ID de jugador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Buscar participantes"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="status-filter">Filtrar por Estado</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto" aria-label="Filtrar por estado">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === 'all' ? 'Todos los Estados' : 
                   statusFilter === ParticipantStatus.REGISTERED ? 'Registrados' :
                   statusFilter === ParticipantStatus.CHECKED_IN ? 'Confirmados' :
                   statusFilter === ParticipantStatus.DROPPED ? 'Retirados' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  Todos los Estados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(ParticipantStatus.REGISTERED)}>
                  Registrados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(ParticipantStatus.CHECKED_IN)}>
                  Confirmados
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(ParticipantStatus.DROPPED)}>
                  Retirados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Error Display */}
        {currentError && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{currentError}</AlertDescription>
          </Alert>
        )}

        {/* Participants List */}
        <div className="space-y-3" role="list" aria-label="Lista de participantes">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron participantes</p>
              {searchTerm && (
                <p className="text-sm">Intenta ajustar tu búsqueda o criterios de filtro</p>
              )}
            </div>
          ) : (
            filteredParticipants.map((participant, index) => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                role="listitem"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{participant.player_name}</h4>
                      {getParticipantStatusBadge(participant.status as ParticipantStatus)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {participant.player_id && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">ID:</span>
                          <span>{participant.player_id}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
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
                        aria-label={`Ver detalles de ${participant.player_name}`}
                      >
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Detalles del Participante</DialogTitle>
                        <DialogDescription>
                          Información completa de {participant.player_name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedParticipant && (
                        <div className="space-y-4">
                          <div>
                            <Label>Nombre</Label>
                            <p className="text-sm">{selectedParticipant.player_name}</p>
                          </div>
                          
                          {selectedParticipant.player_id && (
                            <div>
                              <Label>ID de Jugador</Label>
                              <p className="text-sm">{selectedParticipant.player_id}</p>
                            </div>
                          )}
                          
                          {selectedParticipant.player_birthdate && (
                            <div>
                              <Label>Fecha de Nacimiento</Label>
                              <p className="text-sm">
                                {formatDate(selectedParticipant.player_birthdate, 'long')}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <Label>Fecha de Registro</Label>
                            <p className="text-sm">
                              {formatDateTime(selectedParticipant.registration_date)}
                            </p>
                          </div>
                          
                          <div>
                            <Label>Estado</Label>
                            <p className="text-sm">
                              {selectedParticipant.status === ParticipantStatus.REGISTERED ? 'Registrado' :
                               selectedParticipant.status === ParticipantStatus.CHECKED_IN ? 'Confirmado' :
                               selectedParticipant.status === ParticipantStatus.DROPPED ? 'Retirado' : 
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
                          Confirmar Registro
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
                        Eliminar Participante
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}