'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Users, 
  Calendar, 
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { TournamentParticipant, Tournament } from '@/lib/types/tournament';
import { useTypedTranslation } from '@/lib/i18n/hooks/useTypedTranslation';

interface LocalTournament extends Omit<Tournament, 'status'> {
  status: string;
  start_date: string;
  original_tdf_file_path?: string;
  tdf_metadata?: any;
}

interface TDFDownloadManagerProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  onDownloadComplete?: () => void;
}

export default function TDFDownloadManager({ 
  tournament, 
  participants, 
  onDownloadComplete 
}: TDFDownloadManagerProps) {
  const { tTournaments } = useTypedTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Calculate participant statistics
  const registeredCount = participants.filter(p => p.status === 'registered').length;
  const confirmedCount = participants.filter(p => p.status === 'checked_in').length;
  const totalActiveCount = registeredCount + confirmedCount;

  const handleDownload = async (useCustomOptions = false) => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      let url = `/api/tournaments/${tournament.id}/tdf-download`;
      let options: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Use POST for custom options
      if (useCustomOptions) {
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customSettings: {},
            playerFilters: {}
          }),
        };
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download TDF file');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${tournament.name.replace(/[^a-zA-Z0-9]/g, '_')}.tdf`;

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(true);
      onDownloadComplete?.();

      // Clear success message after 3 seconds
      setTimeout(() => setDownloadSuccess(false), 3000);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleQuickDownload = () => handleDownload(false);
  const handleCustomDownload = () => handleDownload(true);

  return (
    <Card className="w-full bg-transparent border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
  {tTournaments('management.tdfGeneration')}
          </CardTitle>
          
          {/* Status Indicator */}
          {totalActiveCount === 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
{tTournaments('management.noParticipants')}
              </span>
            </div>
          )}
          
          {downloadError && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">
{tTournaments('management.error')}
              </span>
            </div>
          )}
          
          {downloadSuccess && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
{tTournaments('management.downloaded')}
              </span>
            </div>
          )}
        </div>
        
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {totalActiveCount > 0 
            ? tTournaments('management.tdfDescription')
            : tTournaments('management.registerParticipants')
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tournament Summary */}
        <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
{tTournaments('management.participantsCount', { count: totalActiveCount })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
{tTournaments('management.registered')}: {registeredCount} • {tTournaments('management.confirmed')}: {confirmedCount}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(tournament.start_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
{tTournaments('management.tournamentDate')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {(tournament as LocalTournament).original_tdf_file_path ? (
                <Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
✓ {tTournaments('management.originalTdf')}
                </Badge>
              ) : (
                <Badge variant="outline" className="px-3 py-1 text-xs font-medium border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
📄 {tTournaments('management.toGenerate')}
                </Badge>
              )}
            </div>
          </div>
        </div>


        {/* Download Section */}
        <div className="space-y-6">
          <div className="text-center">

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              {totalActiveCount > 0 
                ? tTournaments('management.generateDescription')
                : tTournaments('management.registerParticipants')
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Button 
                onClick={handleQuickDownload}
                disabled={isDownloading || totalActiveCount === 0}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                size="lg"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
{tTournaments('management.quickDownload')}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleCustomDownload}
                disabled={isDownloading || totalActiveCount === 0}
                className="flex-1 h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                size="lg"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
{tTournaments('management.withOptions')}
              </Button>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}