'use client';

// React
import { useState } from 'react';

// Translations
import { useTypedTranslation } from '@/lib/i18n/';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Components
import TournamentManagementModal from '@/components/tournaments/TournamentManagementModal';

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
  Award,
  Settings
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
  const [showManagementModal, setShowManagementModal] = useState(false);
  
  // Translations
  const { tTournaments, tCommon } = useTypedTranslation();

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

  const handleTournamentDelete = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tournament');
      }

      // Redirect to tournaments page after successful deletion
      window.location.href = '/tournaments';
      
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Error deleting tournament: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <CardTitle className="text-2xl">{tournament.name}</CardTitle>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
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
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{tournament.tournament_type}</span>
                </div>
                {organizer && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{organizer.full_name || organizer.organization_name || tTournaments('organizer')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Organizer actions */}
            {userRole === 'organizer' && (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setShowManagementModal(true)}
                  className="text-white dark:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Tournament
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Tournament Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="text-xl font-bold text-blue-600">{stats.activeParticipants}</div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 text-center">Participantes Activos</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Target className="h-5 w-5 text-green-600" />
                <div className="text-xl font-bold text-green-600">{stats.completedMatches}</div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 text-center">Partidas Completadas</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Clock className="h-5 w-5 text-purple-600" />
                <div className="text-xl font-bold text-purple-600">{stats.totalRounds}</div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 text-center">Rondas Totales</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Award className="h-5 w-5 text-orange-600" />
                <div className="text-xl font-bold text-orange-600">{results.length}</div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 text-center">Resultados Finales</div>
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
        <TabsList className="grid w-full grid-cols-5 bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-600">Resumen</TabsTrigger>
          <TabsTrigger value="participants" className="data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-600">Participantes</TabsTrigger>
          <TabsTrigger value="standings" className="data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-600">Clasificación</TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-600">Partidas</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-300 dark:data-[state=active]:bg-gray-600">Reportes</TabsTrigger>
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
            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                    {stats.hasResults ? tCommon('yes') : tCommon('no')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {tournament.description && (
            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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

      {/* Tournament Management Modal */}
      {userRole === 'organizer' && showManagementModal && (
        <TournamentManagementModal
          isOpen={showManagementModal}
          onClose={() => setShowManagementModal(false)}
          tournament={tournament as any}
          participants={participants}
          onParticipantUpdate={() => {
            // Refresh data if needed
            window.location.reload();
          }}
          onTournamentUpdate={() => {
            // Refresh data if needed
            window.location.reload();
          }}
          onTournamentDelete={handleTournamentDelete}
        />
      )}
    </div>
  );
}