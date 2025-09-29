'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Trophy,
  Target,
  Award
} from 'lucide-react';
import type { TournamentParticipant, TournamentResult } from '@/lib/types/tournament';
import { ParticipantStatus } from '@/lib/types/tournament';

interface ParticipantsListProps {
  participants: TournamentParticipant[];
  results: TournamentResult[];
  userRole: 'organizer' | 'participant' | 'viewer';
  tournamentStatus: string;
}

export function ParticipantsList({ 
  participants, 
  results, 
  userRole, 
  tournamentStatus 
}: ParticipantsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'dropped'>('all');

  // Create a map of results by participant ID
  const resultsMap = useMemo(() => {
    return results.reduce((acc, result) => {
      acc[result.participant_id] = result;
      return acc;
    }, {} as Record<string, TournamentResult>);
  }, [results]);

  // Filter and search participants
  const filteredParticipants = useMemo(() => {
    return participants
      .filter(participant => {
        // Status filter
        if (statusFilter !== 'all' && participant.status !== statusFilter) {
          return false;
        }

        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            participant.player_name.toLowerCase().includes(searchLower) ||
            participant.player_id.toLowerCase().includes(searchLower)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by final standing if available, then by name
        const resultA = resultsMap[a.id];
        const resultB = resultsMap[b.id];

        if (resultA?.final_standing && resultB?.final_standing) {
          return resultA.final_standing - resultB.final_standing;
        }

        if (resultA?.final_standing && !resultB?.final_standing) {
          return -1;
        }

        if (!resultA?.final_standing && resultB?.final_standing) {
          return 1;
        }

        // Sort by points if no final standing
        if (resultA?.points !== undefined && resultB?.points !== undefined) {
          return resultB.points - resultA.points;
        }

        // Finally sort by name
        return a.player_name.localeCompare(b.player_name);
      });
  }, [participants, resultsMap, searchTerm, statusFilter]);

  const getStatusColor = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.CHECKED_IN: return 'bg-green-100 text-green-800 border-green-200';
      case ParticipantStatus.DROPPED: return 'bg-red-100 text-red-800 border-red-200';
      case ParticipantStatus.REGISTERED: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.CHECKED_IN: return 'Activo';
      case ParticipantStatus.DROPPED: return 'Abandonó';
      case ParticipantStatus.REGISTERED: return 'Registrado';
      default: return 'Desconocido';
    }
  };

  const getStandingColor = (standing?: number) => {
    if (!standing) return '';
    if (standing === 1) return 'text-yellow-600 font-bold';
    if (standing === 2) return 'text-gray-600 font-bold';
    if (standing === 3) return 'text-orange-600 font-bold';
    if (standing <= 8) return 'text-blue-600 font-semibold';
    return '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate statistics
  const stats = {
    total: participants.length,
    active: participants.filter(p => p.status === ParticipantStatus.CHECKED_IN).length,
    dropped: participants.filter(p => p.status === ParticipantStatus.DROPPED).length,
    registered: participants.filter(p => p.status === ParticipantStatus.REGISTERED).length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Activos</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <UserX className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.dropped}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Abandonaron</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{results.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Con Resultados</div>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Lista de Participantes</span>
          </CardTitle>
          <CardDescription>
            {filteredParticipants.length} de {participants.length} participantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o ID de jugador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter !== 'all' ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 'text-white dark:text-white'}
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter !== 'active' ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 'text-white dark:text-white'}
                onClick={() => setStatusFilter('active')}
              >
                Activos
              </Button>
              <Button
                variant={statusFilter === 'dropped' ? 'default' : 'outline'}
                size="sm"
                className={statusFilter !== 'dropped' ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 'text-white dark:text-white'}
                onClick={() => setStatusFilter('dropped')}
              >
                Abandonaron
              </Button>
            </div>
          </div>

          {/* Participants Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Pos.</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Jugador</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Estado</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Registro</th>
                  {results.length > 0 && (
                    <>
                      <th className="text-center py-3 px-2 font-medium text-gray-700">V-D-E</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-700">Puntos</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant, index) => {
                  const result = resultsMap[participant.id];
                  const displayPosition = result?.final_standing || (index + 1);

                  return (
                    <tr key={participant.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className={`font-medium ${getStandingColor(result?.final_standing)}`}>
                          {result?.final_standing ? (
                            <div className="flex items-center space-x-1">
                              {result.final_standing <= 3 && (
                                <Trophy className="h-4 w-4" />
                              )}
                              <span>{result.final_standing}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-gray-900">
                          {participant.player_name}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {participant.player_id}
                        </code>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(participant.status)}>
                          {getStatusText(participant.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {formatDate(participant.registration_date)}
                      </td>
                      {results.length > 0 && (
                        <>
                          <td className="py-3 px-2 text-center">
                            {result ? (
                              <div className="text-sm">
                                <span className="text-green-600 font-medium">{result.wins}</span>
                                <span className="text-gray-400 mx-1">-</span>
                                <span className="text-red-600 font-medium">{result.losses}</span>
                                <span className="text-gray-400 mx-1">-</span>
                                <span className="text-yellow-600 font-medium">{result.draws}</span>
                                {result.byes > 0 && (
                                  <>
                                    <span className="text-gray-400 mx-1">-</span>
                                    <span className="text-purple-600 font-medium">{result.byes}B</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {result ? (
                              <div className="font-bold text-blue-600">
                                {result.points}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredParticipants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron participantes</p>
              {searchTerm && (
                <p className="text-sm mt-1">
                  Intenta con otros términos de búsqueda
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}