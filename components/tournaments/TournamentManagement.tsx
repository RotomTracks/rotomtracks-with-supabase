'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { FileUpload } from './FileUpload';
import { SmartFileUpload } from './SmartFileUpload';
import { ProcessingStatus } from './ProcessingStatus';
import { FileWatcher } from './FileWatcher';
import { TournamentStatusManager } from './TournamentStatusManager';
import type { Tournament } from '@/lib/types/tournament';
import { useTypedTranslation } from '@/lib/i18n';

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
}

export function TournamentManagement({ tournament, files, stats }: TournamentManagementProps) {
  const { tTournaments } = useTypedTranslation();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileUpload = (fileId: string, fileName: string) => {
    setSelectedFileId(fileId);
    setRefreshKey(prev => prev + 1);
  };

  const handleProcessingComplete = (result: any) => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStatusUpdate = (newStatus: string) => {
    setRefreshKey(prev => prev + 1);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTournamentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                  <span>{new Date(tournament.start_date).toLocaleDateString('es-ES')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{tournament.current_players} {tTournaments('management.players')}</span>
                </span>
              </CardDescription>
            </div>
            <Badge className={getTournamentStatusColor(tournament.status)}>
              {tournament.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.participants}</div>
              <div className="text-sm text-gray-600">{tTournaments('management.participants')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.matches}</div>
              <div className="text-sm text-gray-600">{tTournaments('management.matches')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.results}</div>
              <div className="text-sm text-gray-600">{tTournaments('management.results')}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{stats.files}</div>
              <div className="text-sm text-gray-600">{tTournaments('management.files')}</div>
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
            userRole="organizer"
          />
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <SmartFileUpload
            userId={tournament.organizer_id}
            onTournamentCreated={(id) => {}}
            onTournamentUpdated={(id) => {}}
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
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                        selectedFileId === file.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{file.file_name}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>Subido: {formatDate(file.created_at)}</span>
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
                <div className="text-center py-8 text-gray-500">
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
            onFileUpload={(file) => {
              // Handle file upload from watcher
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}