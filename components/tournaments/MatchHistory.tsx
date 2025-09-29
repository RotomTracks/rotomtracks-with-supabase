'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Swords, 
  ChevronDown, 
  ChevronRight,
  Trophy,
  Users,
  Clock,
  Target
} from 'lucide-react';
import type { TournamentMatch, TournamentParticipant } from '@/lib/types/tournament';
import { MatchOutcome } from '@/lib/types/tournament';

interface MatchHistoryProps {
  matches: TournamentMatch[];
  participants: TournamentParticipant[];
  tournamentStatus: string;
}

export function MatchHistory({ 
  matches, 
  participants, 
  tournamentStatus 
}: MatchHistoryProps) {
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([1]));

  // Create participant lookup map
  const participantMap = useMemo(() => {
    return participants.reduce((acc, participant) => {
      acc[participant.id] = participant;
      return acc;
    }, {} as Record<string, TournamentParticipant>);
  }, [participants]);

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

  const getOutcomeText = (outcome: MatchOutcome | undefined) => {
    if (!outcome) return 'Pendiente';
    switch (outcome) {
      case MatchOutcome.PLAYER1_WINS: return 'Victoria J1';
      case MatchOutcome.PLAYER2_WINS: return 'Victoria J2';
      case MatchOutcome.DRAW: return 'Empate';
      case MatchOutcome.BYE: return 'BYE';
      case MatchOutcome.DOUBLE_LOSS: return 'Doble Derrota';
      default: return 'Desconocido';
    }
  };

  const getOutcomeColor = (outcome: MatchOutcome | undefined) => {
    if (!outcome) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (outcome) {
      case MatchOutcome.PLAYER1_WINS: return 'bg-green-100 text-green-800 border-green-200';
      case MatchOutcome.PLAYER2_WINS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case MatchOutcome.DRAW: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case MatchOutcome.BYE: return 'bg-purple-100 text-purple-800 border-purple-200';
      case MatchOutcome.DOUBLE_LOSS: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate statistics
  const stats = {
    totalMatches: matches.length,
    completedMatches: matches.filter(m => m.match_status === 'completed').length,
    totalRounds: rounds.length,
    averageMatchesPerRound: rounds.length > 0 ? Math.round(matches.length / rounds.length) : 0,
  };

  if (matches.length === 0) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="text-center py-12">
          <Swords className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay partidas registradas
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Las partidas aparecerán aquí una vez que se procesen los datos del torneo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Swords className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.totalMatches}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Partidas</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.completedMatches}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Completadas</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.totalRounds}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Rondas</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.averageMatchesPerRound}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Partidas/Ronda</div>
          </CardContent>
        </Card>
      </div>

      {/* Rounds */}
      <div className="space-y-4">
        {rounds.map(round => {
          const roundMatches = matchesByRound[round];
          const isExpanded = expandedRounds.has(round);
          const completedInRound = roundMatches.filter(m => m.match_status === 'completed').length;

          return (
            <Card key={round} className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                        {roundMatches.length} partidas • {completedInRound} completadas
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {Math.round((completedInRound / roundMatches.length) * 100)}% completado
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="space-y-3">
                    {roundMatches.map((match, index) => {
                      const player1 = participantMap[match.player1_id];
                      const player2 = match.player2_id ? participantMap[match.player2_id] : null;
                      const isBye = match.outcome === MatchOutcome.BYE || !player2;
                      const isPlayer1Winner = match.outcome === MatchOutcome.PLAYER1_WINS;
                      const isPlayer2Winner = match.outcome === MatchOutcome.PLAYER2_WINS;

                      return (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            {/* Table Number */}
                            <div className="text-center min-w-[60px]">
                              <div className="text-sm text-gray-500">Mesa</div>
                              <div className="font-bold text-lg">
                                {match.table_number || '-'}
                              </div>
                            </div>

                            {/* Players */}
                            <div className="flex items-center space-x-4 min-w-[400px]">
                              <div className={`text-right flex-1 ${isPlayer1Winner ? 'font-bold text-green-600' : ''}`}>
                                <div className="font-medium">
                                  {player1?.player_name || 'Jugador 1'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {player1?.player_id || 'N/A'}
                                </div>
                              </div>

                              <div className="text-center px-4">
                                <Swords className="h-5 w-5 text-gray-400" />
                              </div>

                              <div className={`text-left flex-1 ${isPlayer2Winner ? 'font-bold text-green-600' : ''}`}>
                                {player2 ? (
                                  <>
                                    <div className="font-medium">
                                      {player2.player_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {player2.player_id}
                                    </div>
                                  </>
                                ) : (
                                  <div className="font-medium text-purple-600">
                                    BYE
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {/* Match Status */}
                            <Badge className={getMatchStatusColor(match.match_status)}>
                              {match.match_status === 'completed' ? 'Completada' :
                               match.match_status === 'ongoing' ? 'En Curso' :
                               match.match_status === 'pending' ? 'Pendiente' : match.match_status}
                            </Badge>

                            {/* Outcome */}
                            <Badge className={getOutcomeColor(match.outcome)}>
                              {getOutcomeText(match.outcome)}
                            </Badge>

                            {/* Time */}
                            <div className="text-sm text-gray-500 min-w-[80px] text-right">
                              {formatDateTime(match.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Expand/Collapse All */}
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
  );
}