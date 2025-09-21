'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface LocalTournament extends Tournament {
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [includeWaitlist, setIncludeWaitlist] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Calculate participant statistics
  const registeredCount = participants.filter(p => p.status === 'registered').length;
  const confirmedCount = participants.filter(p => p.status === 'confirmed').length;
  const waitlistCount = participants.filter(p => p.status === 'waitlist').length;
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
            includeWaitlist,
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          TDF File Generation
        </CardTitle>
        <CardDescription>
          Generate and download TDF files compatible with TOM software for tournament management
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{totalActiveCount}</strong> registered players
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(tournament.start_date).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {tournament.original_tdf_file_path ? (
              <Badge variant="secondary">Has Original TDF</Badge>
            ) : (
              <Badge variant="outline">Generated from Scratch</Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Participant Statistics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Participant Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{registeredCount}</div>
              <div className="text-sm text-green-700">Registered</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{confirmedCount}</div>
              <div className="text-sm text-blue-700">Confirmed</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{waitlistCount}</div>
              <div className="text-sm text-orange-700">Waitlist</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Download Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Download Options
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-waitlist" 
                checked={includeWaitlist}
                onCheckedChange={(checked) => setIncludeWaitlist(checked as boolean)}
              />
              <Label htmlFor="include-waitlist" className="text-sm">
                Include waitlisted players ({waitlistCount} players)
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Download Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleQuickDownload}
              disabled={isDownloading || totalActiveCount === 0}
              className="flex-1"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Quick Download
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleCustomDownload}
              disabled={isDownloading || totalActiveCount === 0}
              className="flex-1"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Download with Options
            </Button>
          </div>

          {totalActiveCount === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No registered players found. TDF file cannot be generated without participants.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Status Messages */}
        {downloadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Download Failed:</strong> {downloadError}
            </AlertDescription>
          </Alert>
        )}

        {downloadSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              TDF file downloaded successfully! The file is compatible with TOM software.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">About TDF Files</h5>
          <p className="text-sm text-blue-800">
            TDF (Tournament Director File) files are XML files compatible with TOM (Tournament Operations Manager) software. 
            The generated file includes all registered players with their information and maintains the original tournament 
            structure and settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}