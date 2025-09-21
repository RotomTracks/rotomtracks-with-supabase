'use client';

// React
import { useState } from 'react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Icons
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Settings, 
  Eye,
  Download,
  Calendar,
  MapPin,
  Users,
  Trophy
} from 'lucide-react';

// Local Components
import { FileUpload } from './FileUpload';
import { SmartFileUpload } from './SmartFileUpload';
import { ProcessingStatus } from './ProcessingStatus';
import { FileWatcher } from './FileWatcher';
import { TournamentStatusManager } from './TournamentStatusManager';

// Types
import { Tournament, TournamentStatus, UserRole } from '@/lib/types/tournament';

// Hooks
import { useTypedTranslation } from '@/lib/i18n';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  getStatusColor,
  getStatusText
} from '@/lib/utils/tournament-status';

interface TournamentFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface TournamentStats {
  participants: number;
  matches: number;
  results: number;
  files: number;
}

interface TournamentManagementProps {
  tournament: Tournament & { tournament_files?: TournamentFile[] };
  files: TournamentFile[];
  stats: TournamentStats;
  userRole?: UserRole;
}

export function TournamentManagement({ 
  tournament, 
  files, 
  stats, 
  userRole = UserRole.ORGANIZER 
}: TournamentManagementProps) {
  // Hooks
  const { tTournaments } = useTypedTranslation();
  const { formatDate, formatDateTime } = useTournamentFormatting();
  
  // State
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Event handlers
  const handleFileUpload = (fileId: string, _fileName: string) => {
    setSelectedFileId(fileId);
    setRefreshKey(prev => prev + 1);
  };

  const handleProcessingComplete = (_result: any) => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStatusUpdate = (_newStatus: string) => {
    setRefreshKey(prev => prev + 1);
  };

  // Utility functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Tournament Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{tournament.name}</CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-2">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{tournament.city}, {tournament.country}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tournament.start_date, 'short')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{tournament.current_players} {tTournaments('management.players')}</span>
                </span>
              </CardDescription>
            </div>
            <Badge className={getStatusColor(tournament.status as TournamentStatus)}>
              {getStatusText(tournament.status as TournamentStatus)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.participants}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{tTournaments('management.participants')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.matches}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{tTournaments('management.matches')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.results}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{tTournaments('management.results')}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{stats.files}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{tTournaments('management.files')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>{tTournaments('management.status')}</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>{tTournaments('management.uploadFiles')}</span>
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>{tTournaments('management.process')}</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{tTournaments('management.files')}</span>
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>{tTournaments('management.monitor')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <TournamentStatusManager
            tournament={tournament}
            participantCount={stats.participants}
            matchesCount={stats.matches}
            completedMatches={stats.matches} // This should be calculated from actual completed matches
            onStatusUpdate={handleStatusUpdate}
            userRole={userRole}
          />
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <SmartFileUpload
            userId={tournament.organizer_id}
            onTournamentCreated={(_id) => {}}
            onTournamentUpdated={(_id) => {}}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>{tTournaments('management.manualUpload')}</CardTitle>
              <CardDescription>
                {tTournaments('management.manualUploadDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                tournamentId={tournament.id}
                onUploadComplete={handleFileUpload}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="space-y-6">
          <ProcessingStatus
            tournamentId={tournament.id}
            fileId={selectedFileId || files[0]?.id}
            onProcessingComplete={handleProcessingComplete}
          />
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Archivos del Torneo</CardTitle>
              <CardDescription>
                Gestiona todos los archivos asociados con este torneo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length > 0 ? (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                        selectedFileId === file.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{file.file_name}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>Subido: {formatDateTime(file.created_at)}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.file_type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedFileId === file.id && (
                          <Badge variant="default" className="text-xs">
                            Seleccionado
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay archivos subidos aún</p>
                  <p className="text-sm">Usa la pestaña &quot;Subir Archivos&quot; para añadir archivos TDF</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitor Tab */}
        <TabsContent value="monitor" className="space-y-6">
          <FileWatcher
            tournamentId={tournament.id}
            onFileUpload={(_file) => {
              // Handle file upload from watcher
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}