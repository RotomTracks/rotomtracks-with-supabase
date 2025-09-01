'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import type { 
  Tournament, 
  TournamentParticipant, 
  TournamentResult, 
  TournamentMatch 
} from '@/lib/types/tournament';
import { MatchOutcome } from '@/lib/types/tournament';

interface ResultsViewerProps {
  tournamentId: string;
  tournament: Tournament;
  participants: TournamentParticipant[];
  results: TournamentResult[];
  matches: TournamentMatch[];
  htmlReportUrl?: string;
  userRole: 'organizer' | 'participant' | 'viewer';
}

export function ResultsViewer({
  tournamentId,
  tournament,
  participants,
  results,
  matches,
  htmlReportUrl,
  userRole
}: ResultsViewerProps) {
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
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300';
      case 3: return 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300';
      default: return position <= 8 ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50';
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
    if (!outcome) return 'bg-gray-100 text-gray-800';
    switch (outcome) {
      case MatchOutcome.PLAYER1_WINS:
      case MatchOutcome.PLAYER2_WINS: return 'bg-green-100 text-green-800';
      case MatchOutcome.DRAW: return 'bg-yellow-100 text-yellow-800';
      case MatchOutcome.BYE: return 'bg-purple-100 text-purple-800';
      case MatchOutcome.DOUBLE_LOSS: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (results.length === 0 && matches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Resultados No Disponibles
          </h3>
          <p className="text-gray-500 mb-4">
            Los resultados se mostrarán aquí una vez que se procesen los datos del torneo
          </p>
          {htmlReportUrl && (
            <Button
              onClick={() => window.open(htmlReportUrl, '_blank')}
              className="mt-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Reporte HTML
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

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
                  <span>{formatDate(tournament.start_date)}</span>
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
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'standings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('standings')}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Clasificación Final
          </Button>
          <Button
            variant={viewMode === 'rounds' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('rounds')}
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
                                    <div className="font-medium">
                                      {player1?.player_name || 'Jugador 1'}
                                    </div>
                                    <div className="text-sm text-gray-500">
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
                                      <div className="font-medium">
                                        {player2.player_name}
                                      </div>
                                      <div className="text-sm text-gray-500">
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
            >
              Expandir Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedRounds(new Set())}
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