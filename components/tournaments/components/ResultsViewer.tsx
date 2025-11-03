'use client';

// React
import { useState, useMemo } from 'react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Trophy, 
  ChevronDown, 
  ChevronRight,
  Medal,
  Award,
  Users,
  Swords,
  ExternalLink,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  BarChart3
} from 'lucide-react';

// Types
import type { 
  Tournament, 
  TournamentParticipant, 
  TournamentResult, 
  TournamentMatch,
  UserRole,
  TournamentStatus
} from '@/lib/types/tournament';
import { MatchOutcome } from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  TournamentStatusManager,
  getStatusColor,
  getStatusText
} from '@/lib/utils/tournament-status';

interface ResultsViewerProps {
  tournamentId: string;
  tournament: Tournament;
  participants: TournamentParticipant[];
  results: TournamentResult[];
  matches: TournamentMatch[];
  htmlReportUrl?: string;
  userRole: UserRole | 'organizer' | 'participant' | 'viewer';
  loading?: boolean;
  error?: string | null;
}

export function ResultsViewer({
  tournamentId,
  tournament,
  participants,
  results,
  matches,
  htmlReportUrl,
  userRole,
  loading = false,
  error = null
}: ResultsViewerProps) {
  // Hooks
  const { formatDate, formatTime, formatDateTime } = useTournamentFormatting();
  
  // State
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([1]));
  const [viewMode, setViewMode] = useState<'standings' | 'rounds'>('standings');

  // Create participant lookup map
  const participantMap = useMemo(() => {
    return participants.reduce((acc, participant) => {
      acc[participant.id] = participant;
      return acc;
    }, {} as Record<string, TournamentParticipant>);
  }, [participants]);

  // Sort results by final standing
  const sortedResults = useMemo(() => {
    return results
      .map(result => ({
        ...result,
        participant: participantMap[result.participant_id],
      }))
      .filter(result => result.participant)
      .sort((a, b) => {
        if (a.final_standing && b.final_standing) {
          return a.final_standing - b.final_standing;
        }
        if (a.final_standing && !b.final_standing) return -1;
        if (!a.final_standing && b.final_standing) return 1;
        if (a.points !== b.points) return b.points - a.points;
        if (a.wins !== b.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      });
  }, [results, participantMap]);

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const grouped = matches.reduce((acc, match) => {
      const round = match.round_number;
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    }, {} as Record<number, TournamentMatch[]>);

    // Sort matches within each round by table number
    Object.keys(grouped).forEach(roundKey => {
      const round = parseInt(roundKey);
      grouped[round].sort((a, b) => {
        const tableA = a.table_number || 999;
        const tableB = b.table_number || 999;
        return tableA - tableB;
      });
    });

    return grouped;
  }, [matches]);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const toggleRound = (round: number) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(round)) {
      newExpanded.delete(round);
    } else {
      newExpanded.add(round);
    }
    setExpandedRounds(newExpanded);
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-500" />;
      default: return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-300 dark:border-yellow-700';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 border-gray-300 dark:border-gray-600';
      case 3: return 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-300 dark:border-orange-700';
      default: return position <= 8 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800';
    }
  };

  const getOutcomeText = (outcome: MatchOutcome | undefined) => {
    if (!outcome) return 'Pendiente';
    switch (outcome) {
      case MatchOutcome.PLAYER1_WINS: return 'Victoria';
      case MatchOutcome.PLAYER2_WINS: return 'Victoria';
      case MatchOutcome.DRAW: return 'Empate';
      case MatchOutcome.BYE: return 'BYE';
      case MatchOutcome.DOUBLE_LOSS: return 'Doble Derrota';
      default: return 'Desconocido';
    }
  };

  const getOutcomeColor = (outcome: MatchOutcome | undefined) => {
    if (!outcome) return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    switch (outcome) {
      case MatchOutcome.PLAYER1_WINS:
      case MatchOutcome.PLAYER2_WINS: return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case MatchOutcome.DRAW: return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case MatchOutcome.BYE: return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      case MatchOutcome.DOUBLE_LOSS: return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  // Render loading state
  const renderLoadingState = () => (
    <Card>
      <CardContent className="text-center py-12" role="status" aria-label="Cargando resultados">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto"></div>
        </div>
        <span className="sr-only">Cargando resultados del torneo...</span>
      </CardContent>
    </Card>
  );

  // Render error state
  const renderErrorState = () => (
    <Card>
      <CardContent className="text-center py-12" role="alert">
        <BarChart3 className="h-16 w-16 mx-auto text-red-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Error al Cargar Resultados
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error || 'No se pudieron cargar los resultados del torneo'}
        </p>
      </CardContent>
    </Card>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Card>
      <CardContent className="text-center py-12">
        <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Resultados No Disponibles
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Los resultados se mostrarán aquí una vez que se procesen los datos del torneo
        </p>
        {htmlReportUrl && (
          <Button
            onClick={() => window.open(htmlReportUrl, '_blank')}
            className="mt-4"
            aria-label="Ver reporte HTML del torneo"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Reporte HTML
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Early returns for different states
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  if (results.length === 0 && matches.length === 0) return renderEmptyState();

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2 flex items-center space-x-2">
                <Trophy className="h-6 w-6" />
                <span>{tournament.name}</span>
              </CardTitle>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{tournament.city}, {tournament.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tournament.start_date, 'long')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{participants.length} jugadores</span>
                </div>
              </div>
            </div>
            {htmlReportUrl && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(htmlReportUrl, '_blank')}
                  aria-label="Ver reporte HTML del torneo"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Reporte HTML
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = htmlReportUrl;
                    link.download = `${tournament.name}-resultados.html`;
                    link.click();
                  }}
                  aria-label="Descargar reporte HTML"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1" role="group" aria-label="Cambiar vista de resultados">
          <Button
            variant={viewMode === 'standings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('standings')}
            aria-pressed={viewMode === 'standings'}
            aria-label="Ver clasificación final"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Clasificación Final
          </Button>
          <Button
            variant={viewMode === 'rounds' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('rounds')}
            aria-pressed={viewMode === 'rounds'}
            aria-label="Ver rondas del torneo"
          >
            <Swords className="h-4 w-4 mr-2" />
            Rondas del Torneo
          </Button>
        </div>
      </div>

      {/* Standings View */}
      {viewMode === 'standings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Clasificación Final</span>
            </CardTitle>
            <CardDescription>
              Resultados finales del torneo ordenados por posición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Pos.</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Jugador</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">ID</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Puntos</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">V</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">D</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">E</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">B</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((result, index) => {
                    const position = result.final_standing || (index + 1);
                    
                    return (
                      <tr 
                        key={result.id} 
                        className={`border-b transition-colors ${getPositionColor(position)}`}
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            {getPositionIcon(position)}
                            <span className="font-bold text-lg">
                              {position}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="font-semibold text-gray-900">
                            {result.participant.player_name}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {result.participant.player_id}
                          </code>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {result.points}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {result.wins}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div className="text-lg font-semibold text-red-600">
                            {result.losses}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div className="text-lg font-semibold text-yellow-600">
                            {result.draws}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div className="text-lg font-semibold text-purple-600">
                            {result.byes}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rounds View */}
      {viewMode === 'rounds' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Swords className="h-5 w-5" />
                <span>Rondas del Torneo</span>
              </CardTitle>
              <CardDescription>
                Resultados detallados de cada ronda del torneo
              </CardDescription>
            </CardHeader>
          </Card>

          {rounds.map(round => {
            const roundMatches = matchesByRound[round];
            const isExpanded = expandedRounds.has(round);

            return (
              <Card key={round}>
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleRound(round)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          Ronda {round}
                        </CardTitle>
                        <CardDescription>
                          {roundMatches.length} partidas
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {isExpanded ? 'Colapsar' : 'Expandir'}
                    </Badge>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-center py-2 px-2 font-medium text-gray-700">Mesa</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-700">Jugador 1</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-700">vs</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-700">Jugador 2</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-700">Resultado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roundMatches.map((match) => {
                            const player1 = participantMap[match.player1_id];
                            const player2 = match.player2_id ? participantMap[match.player2_id] : null;
                            const isPlayer1Winner = match.outcome === MatchOutcome.PLAYER1_WINS;
                            const isPlayer2Winner = match.outcome === MatchOutcome.PLAYER2_WINS;
                            const isBye = match.outcome === MatchOutcome.BYE || !player2;

                            return (
                              <tr key={match.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-2 text-center font-bold">
                                  {match.table_number || '-'}
                                </td>
                                <td className={`py-3 px-2 ${isPlayer1Winner ? 'font-bold text-green-600' : ''}`}>
                                  <div>
                                    <div className="font-medium dark:text-gray-100">
                                      {player1?.player_name || 'Jugador 1'}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {player1?.player_id || 'N/A'}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <Swords className="h-4 w-4 text-gray-400 mx-auto" />
                                </td>
                                <td className={`py-3 px-2 ${isPlayer2Winner ? 'font-bold text-green-600' : ''}`}>
                                  {player2 ? (
                                    <div>
                                      <div className="font-medium dark:text-gray-100">
                                        {player2.player_name}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {player2.player_id}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="font-medium text-purple-600">
                                      BYE
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <Badge className={getOutcomeColor(match.outcome)}>
                                    {getOutcomeText(match.outcome)}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Expand/Collapse All Controls */}
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedRounds(new Set(rounds))}
              aria-label="Expandir todas las rondas"
            >
              Expandir Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedRounds(new Set())}
              aria-label="Colapsar todas las rondas"
            >
              Colapsar Todas
            </Button>
          </div>
        </div>
      )}

      {/* HTML Report Link */}
      {htmlReportUrl && (
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              También está disponible el reporte HTML completo con el estilo original del sistema.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(htmlReportUrl, '_blank')}
              aria-label="Ver reporte HTML completo"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Reporte HTML
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}