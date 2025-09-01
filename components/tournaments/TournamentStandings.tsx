"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Target, TrendingUp } from "lucide-react";
import type {
  TournamentParticipant,
  TournamentResult,
} from "@/lib/types/tournament";

interface TournamentStandingsProps {
  participants: TournamentParticipant[];
  results: TournamentResult[];
  tournamentStatus: string;
}

export function TournamentStandings({
  participants,
  results,
  tournamentStatus,
}: TournamentStandingsProps) {
  // Create participant lookup map
  const participantMap = useMemo(() => {
    return participants.reduce((acc, participant) => {
      acc[participant.id] = participant;
      return acc;
    }, {} as Record<string, TournamentParticipant>);
  }, [participants]);

  // Sort results by final standing, then by points
  const sortedResults = useMemo(() => {
    return results
      .map((result) => ({
        ...result,
        participant: participantMap[result.participant_id],
      }))
      .filter((result) => result.participant) // Only include results with valid participants
      .sort((a, b) => {
        // First sort by final standing if available
        if (a.final_standing && b.final_standing) {
          return a.final_standing - b.final_standing;
        }

        // If one has final standing and other doesn't, prioritize the one with standing
        if (a.final_standing && !b.final_standing) return -1;
        if (!a.final_standing && b.final_standing) return 1;

        // Sort by points (descending)
        if (a.points !== b.points) {
          return b.points - a.points;
        }

        // Sort by wins (descending)
        if (a.wins !== b.wins) {
          return b.wins - a.wins;
        }

        // Sort by losses (ascending)
        if (a.losses !== b.losses) {
          return a.losses - b.losses;
        }

        // Finally sort by name
        return a.participant.player_name.localeCompare(
          b.participant.player_name
        );
      });
  }, [results, participantMap]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200";
      case 3:
      case 4:
        return "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200";
      case 5:
      case 6:
      case 7:
      case 8:
        return "bg-gradient-to-r from-blue-50 to-blue-25 border-blue-200";
      default:
        return position <= 16 ? "bg-gray-50 border-gray-100" : "";
    }
  };

  const calculateWinRate = (wins: number, losses: number, draws: number) => {
    const totalGames = wins + losses + draws;
    if (totalGames === 0) return 0;
    return Math.round((wins / totalGames) * 100);
  };

  const getPerformanceBadge = (winRate: number) => {
    if (winRate >= 80)
      return { text: "Excelente", color: "bg-green-100 text-green-800" };
    if (winRate >= 65)
      return { text: "Muy Bueno", color: "bg-blue-100 text-blue-800" };
    if (winRate >= 50)
      return { text: "Bueno", color: "bg-yellow-100 text-yellow-800" };
    if (winRate >= 35)
      return { text: "Regular", color: "bg-orange-100 text-orange-800" };
    return { text: "Necesita Mejorar", color: "bg-red-100 text-red-800" };
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Clasificación No Disponible
          </h3>
          <p className="text-gray-500">
            Los resultados se mostrarán aquí una vez que se procesen los datos
            del torneo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 8 */}
      {sortedResults.length >= 8 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Top 8</span>
            </CardTitle>
            <CardDescription>
              Los 8 mejores jugadores del torneo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Top 3 Podium - Destacado */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {sortedResults.slice(0, 3).map((result, index) => {
                const position = result.final_standing || index + 1;
                const winRate = calculateWinRate(
                  result.wins,
                  result.losses,
                  result.draws
                );

                return (
                  <div
                    key={result.id}
                    className={`p-6 rounded-lg border-2 text-center ${getPositionColor(
                      position
                    )}`}
                  >
                    <div className="flex justify-center mb-3">
                      {getPositionIcon(position)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      #{position}
                    </div>
                    <div className="font-semibold text-lg text-gray-800 mb-2">
                      {result.participant.player_name}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      ID: {result.participant.player_id}
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.points} pts
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.wins}V - {result.losses}D - {result.draws}E
                        {result.byes > 0 && ` - ${result.byes}B`}
                      </div>
                      <Badge className={getPerformanceBadge(winRate).color}>
                        {winRate}% victorias
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Positions 4-8 - Compact Grid */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Posiciones 4-8
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {sortedResults.slice(3, 8).map((result, index) => {
                  const position = result.final_standing || index + 4;
                  const winRate = calculateWinRate(
                    result.wins,
                    result.losses,
                    result.draws
                  );

                  return (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border text-center ${getPositionColor(
                        position
                      )}`}
                    >
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        #{position}
                      </div>
                      <div className="font-medium text-gray-800 mb-1 text-sm">
                        {result.participant.player_name}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {result.participant.player_id}
                      </div>
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        {result.points}
                      </div>
                      <div className="text-xs text-gray-600">
                        {result.wins}-{result.losses}-{result.draws}
                        {result.byes > 0 && `-${result.byes}B`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {winRate}% vict.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium (fallback for tournaments with less than 8 players) */}
      {sortedResults.length >= 3 && sortedResults.length < 8 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Podio</span>
            </CardTitle>
            <CardDescription>
              Los 3 mejores jugadores del torneo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {sortedResults.slice(0, 3).map((result, index) => {
                const position = result.final_standing || index + 1;
                const winRate = calculateWinRate(
                  result.wins,
                  result.losses,
                  result.draws
                );

                return (
                  <div
                    key={result.id}
                    className={`p-6 rounded-lg border-2 text-center ${getPositionColor(
                      position
                    )}`}
                  >
                    <div className="flex justify-center mb-3">
                      {getPositionIcon(position)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      #{position}
                    </div>
                    <div className="font-semibold text-lg text-gray-800 mb-2">
                      {result.participant.player_name}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      ID: {result.participant.player_id}
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.points} pts
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.wins}V - {result.losses}D - {result.draws}E
                        {result.byes > 0 && ` - ${result.byes}B`}
                      </div>
                      <Badge className={getPerformanceBadge(winRate).color}>
                        {winRate}% victorias
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Standings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Clasificación Completa</span>
          </CardTitle>
          <CardDescription>
            Clasificación final de todos los participantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Pos.
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Jugador
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    Puntos
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    V
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    D
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    E
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    B
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    % Vict.
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    Rendimiento
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, index) => {
                  const position = result.final_standing || index + 1;
                  const winRate = calculateWinRate(
                    result.wins,
                    result.losses,
                    result.draws
                  );
                  const performance = getPerformanceBadge(winRate);

                  return (
                    <tr
                      key={result.id}
                      className={`border-b hover:bg-gray-50 ${getPositionColor(
                        position
                      )}`}
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          {getPositionIcon(position)}
                          <span className="font-bold text-lg">{position}</span>
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
                      <td className="py-4 px-2 text-center">
                        <div className="font-semibold">{winRate}%</div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge className={performance.color}>
                          {performance.text}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Estadísticas del Torneo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {sortedResults.length}
              </div>
              <div className="text-sm text-gray-600">
                Jugadores Clasificados
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  (sortedResults.reduce((sum, r) => sum + r.wins, 0) /
                    sortedResults.length) *
                    10
                ) / 10}
              </div>
              <div className="text-sm text-gray-600">Victorias Promedio</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (sortedResults.reduce((sum, r) => sum + r.points, 0) /
                    sortedResults.length) *
                    10
                ) / 10}
              </div>
              <div className="text-sm text-gray-600">Puntos Promedio</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  sortedResults.reduce(
                    (sum, r) =>
                      sum + calculateWinRate(r.wins, r.losses, r.draws),
                    0
                  ) / sortedResults.length
                )}
                %
              </div>
              <div className="text-sm text-gray-600">% Victorias Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
