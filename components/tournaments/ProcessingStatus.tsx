'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { backgroundJobManager, type ProcessingJob, type JobProgress } from '@/lib/utils/background-jobs';
import { useTypedTranslation } from '@/lib/i18n';

interface ProcessingStatusProps {
  tournamentId: string;
  fileId?: string;
  onProcessingComplete?: (result: any) => void;
}

export function ProcessingStatus({ 
  tournamentId, 
  fileId, 
  onProcessingComplete 
}: ProcessingStatusProps) {
  const { tCommon, tTournaments } = useTypedTranslation();
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [activeJob, setActiveJob] = useState<ProcessingJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing jobs
  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/process/background`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
        
        // Find active job
        const active = data.jobs.find((job: ProcessingJob) => 
          job.status === 'processing' || job.status === 'pending'
        );
        setActiveJob(active || null);
        setIsProcessing(!!active);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }, [tournamentId]);

  // Start processing
  const startProcessing = useCallback(async (options: {
    generateReport?: boolean;
    updateData?: boolean;
  } = {}) => {
    if (!fileId) {
      setError(tTournaments('processing.noFileSelected'));
      return;
    }

    try {
      setError(null);
      setIsProcessing(true);

      const response = await fetch(`/api/tournaments/${tournamentId}/process/background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          generateReport: options.generateReport !== false,
          updateData: options.updateData !== false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const jobId = data.jobId;
        
        // Subscribe to progress updates
        backgroundJobManager.onProgress(jobId, (progress: JobProgress) => {
          // Update active job with progress
          setActiveJob(prev => prev ? {
            ...prev,
            progress: progress.progress,
            status: progress.status as any,
          } : null);

          // If completed, trigger callback
          if (progress.status === 'completed' && progress.data) {
            onProcessingComplete?.(progress.data);
            setIsProcessing(false);
            loadJobs(); // Reload jobs list
          } else if (progress.status === 'failed') {
            setError(progress.message);
            setIsProcessing(false);
            loadJobs();
          }
        });

        // Create initial job object
        const newJob: ProcessingJob = {
          id: jobId,
          tournament_id: tournamentId,
          file_id: fileId,
          status: 'pending',
          progress: 0,
          created_by: '', // Will be filled by server
        };

        setActiveJob(newJob);
        
      } else {
        setError(data.message || tTournaments('processing.startProcessingError'));
        setIsProcessing(false);
      }
    } catch (error) {
      setError(tTournaments('processing.connectionError'));
      setIsProcessing(false);
    }
  }, [tournamentId, fileId, onProcessingComplete, loadJobs]);

  // Cancel processing
  const cancelProcessing = useCallback(async () => {
    if (!activeJob) return;

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/process/background?jobId=${activeJob.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        setActiveJob(null);
        setIsProcessing(false);
        loadJobs();
      } else {
        setError(data.message || tTournaments('processing.cancelProcessingError'));
      }
    } catch (error) {
      setError(tTournaments('processing.connectionError'));
    }
  }, [activeJob, tournamentId, loadJobs]);

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>{tTournaments('processing.title')}</span>
          </CardTitle>
          <CardDescription>
            {tTournaments('processing.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Active Job Progress */}
          {activeJob && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(activeJob.status)}
                  <span className={`font-medium ${getStatusColor(activeJob.status)}`}>
                    {tTournaments(`processing.status.${activeJob.status}`)}
                  </span>
                </div>
                
                {activeJob.status === 'processing' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelProcessing}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {tCommon('buttons.cancel')}
                  </Button>
                )}
              </div>

              {activeJob.status === 'processing' && (
                <div className="space-y-2">
                  <Progress value={activeJob.progress} className="h-3" />
                  <p className="text-sm text-gray-600">
                    {tTournaments('processing.progress', { progress: activeJob.progress })}
                  </p>
                </div>
              )}

              {activeJob.error_message && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{activeJob.error_message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Start Processing Button */}
          {!isProcessing && fileId && (
            <div className="flex items-center space-x-2">
              <Button onClick={() => startProcessing()} disabled={!fileId}>
                <Play className="h-4 w-4 mr-2" />
                Procesar Torneo
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => startProcessing({ generateReport: true, updateData: false })}
                disabled={!fileId}
              >
                Solo Generar Reporte
              </Button>
            </div>
          )}

          {!fileId && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selecciona un archivo TDF para procesar
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Job History */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Historial de Procesamiento</span>
              <Button size="sm" variant="outline" onClick={loadJobs}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'failed' ? 'destructive' :
                            job.status === 'processing' ? 'secondary' : 'outline'
                          }
                        >
                          {job.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {formatDate(job.started_at)}
                        </span>
                      </div>
                      
                      {job.result_data && (
                        <div className="text-xs text-gray-500 mt-1">
                          {job.result_data.participants} participantes, {' '}
                          {job.result_data.matches} partidas, {' '}
                          {job.result_data.results} resultados
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {job.status === 'processing' && (
                      <div className="text-sm text-blue-600">
                        {job.progress}%
                      </div>
                    )}
                    
                    {job.result_data?.reportUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(job.result_data.reportUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Reporte
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}