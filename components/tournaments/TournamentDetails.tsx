'use client';

// React
import { useState } from 'react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Trophy, 
  Users, 
  Calendar, 
  MapPin, 
  User, 
  FileText,
  Download,
  Eye,
  Clock,
  Target,
  Award
} from 'lucide-react';

// Local Components
import { ParticipantsList } from './ParticipantsList';
import { TournamentStandings } from './TournamentStandings';
import { MatchHistory } from './MatchHistory';
import RealTimePlayerCount from './RealTimePlayerCount';
import TournamentActivityFeed from './TournamentActivityFeed';

// Types
import type { 
  Tournament, 
  TournamentParticipant, 
  TournamentResult, 
  TournamentMatch,
  TournamentStatus,
  UserRole
} from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  getStatusColor,
  getStatusText} from '@/lib/utils/tournament-status';

interface TournamentFile {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

interface TournamentReport {
  name: string;
  url: string;
  created_at: string;
}

interface Organizer {
  full_name?: string;
  organization_name?: string;
}

interface TournamentDetailsProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  results: TournamentResult[];
  matches: TournamentMatch[];
  files: TournamentFile[];
  reports: TournamentReport[];
  organizer?: Organizer;
  userRole: UserRole | 'organizer' | 'participant' | 'viewer';
  userId?: string;
}

export function TournamentDetails({
  tournament,
  participants,
  results,
  matches,
  files,
  reports,
  organizer,
  userRole,
  userId
}: TournamentDetailsProps) {
  // State
  const [selectedTab, setSelectedTab] = useState('overview');

  // Use centralized formatting utilities
  const { formatDate, formatDateTime } = useTournamentFormatting();

  // Calculate tournament statistics
  const stats = {
    totalParticipants: participants.length,
    activeParticipants: participants.filter(p => p.status === 'checked_in').length,
    droppedParticipants: participants.filter(p => p.status === 'dropped').length,
    totalMatches: matches.length,
    completedMatches: matches.filter(m => m.match_status === 'completed').length,
    totalRounds: Math.max(...matches.map(m => m.round_number), 0),
    hasResults: results.length > 0,
  };

  // Find user's participation
  const userParticipation = userId ? participants.find(p => p.user_id === userId) : null;
  const userResult = userParticipation ? results.find(r => r.participant_id === userParticipation.id) : null;

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <div>
                  <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {tournament.tournament_type}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
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
                  <span>{stats.totalParticipants} jugadores</span>
                </div>
                {organizer && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{organizer.full_name || organizer.organization_name || 'Organizador'}</span>
                  </div>
                )}
              </div>
            </div>

            <Badge className={getStatusColor(tournament.status as TournamentStatus)}>
              {getStatusText(tournament.status as TournamentStatus)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tournament Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600">{stats.activeParticipants}</div>
              <div className="text-xs text-gray-600">Participantes Activos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600">{stats.completedMatches}</div>
              <div className="text-xs text-gray-600">Partidas Completadas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-600">{stats.totalRounds}</div>
              <div className="text-xs text-gray-600">Rondas Totales</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-600">{results.length}</div>
              <div className="text-xs text-gray-600">Resultados Finales</div>
            </div>
          </div>

          {/* User's Performance (if participant) */}
          {userResult && (
            <Alert className="mt-4">
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                <strong>Tu resultado:</strong> Posición {userResult.final_standing || 'N/A'} • 
                {userResult.wins}V-{userResult.losses}D-{userResult.draws}E • 
                {userResult.points} puntos
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tournament Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="standings">Clasificación</TabsTrigger>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Components */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <RealTimePlayerCount 
              tournamentId={tournament.id}
              initialCount={tournament.current_players}
              initialMax={tournament.max_players}
              initialRegistrationOpen={tournament.registration_open}
              initialStatus={tournament.status}
              compact={false}
            />
            
            <div className="md:col-span-2">
              <TournamentActivityFeed 
                tournamentId={tournament.id}
                maxItems={8}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tournament Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Torneo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID Oficial:</span>
                  <span className="font-mono text-sm">{tournament.official_tournament_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                  <span className="font-medium">{tournament.tournament_type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                  <Badge variant="outline" className={getStatusColor(tournament.status as TournamentStatus)}>
                    {getStatusText(tournament.status as TournamentStatus)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fecha de Inicio:</span>
                  <span className="font-medium">{formatDate(tournament.start_date, 'long')}</span>
                </div>
                {tournament.end_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fecha de Fin:</span>
                    <span className="font-medium">{formatDate(tournament.end_date, 'long')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ubicación:</span>
                  <span className="font-medium">{tournament.city}, {tournament.country}</span>
                </div>
                {tournament.state && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estado/Provincia:</span>
                    <span className="font-medium">{tournament.state}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Participantes:</span>
                  <span className="font-semibold">{stats.totalParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Participantes Activos:</span>
                  <span className="font-semibold text-green-600">{stats.activeParticipants}</span>
                </div>
                {stats.droppedParticipants > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Abandonaron:</span>
                    <span className="font-semibold text-red-600">{stats.droppedParticipants}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Partidas:</span>
                  <span className="font-semibold">{stats.totalMatches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Partidas Completadas:</span>
                  <span className="font-semibold text-blue-600">{stats.completedMatches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rondas Jugadas:</span>
                  <span className="font-semibold">{stats.totalRounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Resultados Disponibles:</span>
                  <span className={`font-semibold ${stats.hasResults ? 'text-green-600' : 'text-gray-400'}`}>
                    {stats.hasResults ? 'Sí' : 'No'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {tournament.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{tournament.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <ParticipantsList
            participants={participants}
            results={results}
            userRole="viewer"
            tournamentStatus={tournament.status}
          />
        </TabsContent>

        {/* Standings Tab */}
        <TabsContent value="standings">
          <TournamentStandings
            participants={participants}
            results={results}
            tournamentStatus={tournament.status}
          />
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches">
          <MatchHistory
            matches={matches}
            participants={participants}
            tournamentStatus={tournament.status}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* HTML Reports */}
          {reports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reportes HTML</CardTitle>
                <CardDescription>
                  Reportes generados automáticamente con los resultados del torneo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Reporte del Torneo</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Generado: {formatDateTime(report.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(report.url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Reporte
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = report.url;
                            link.download = report.name;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tournament Files */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Archivos del Torneo</CardTitle>
                <CardDescription>
                  Archivos originales y documentos relacionados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Badge variant="outline" className="text-xs">
                              {file.file_type.toUpperCase()}
                            </Badge>
                            <span>Subido: {formatDateTime(file.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {userRole === 'organizer' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No reports message */}
          {reports.length === 0 && files.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No hay reportes disponibles aún</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Los reportes se generarán automáticamente cuando se procesen los datos del torneo
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}