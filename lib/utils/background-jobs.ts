// Background Job System for Tournament Processing
import { createClient } from '@/lib/supabase/client';
import { Tournament } from '@/lib/types/tournament';

export interface ProcessingJob {
  id: string;
  tournament_id: string;
  file_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  result_data?: {
    participants: number;
    matches: number;
    results: number;
    reportUrl: string | null;
  };
  created_by: string;
}

export interface JobProgress {
  jobId: string;
  progress: number;
  status: string;
  message: string;
  data?: {
    participants: number;
    matches: number;
    results: number;
    reportUrl: string | null;
  };
}

class BackgroundJobManager {
  private jobs: Map<string, ProcessingJob> = new Map();
  private progressCallbacks: Map<string, (progress: JobProgress) => void> = new Map();

  // Create a new processing job
  async createJob(
    tournamentId: string,
    fileId: string,
    userId: string,
    options: {
      generateReport?: boolean;
      updateData?: boolean;
    } = {}
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const job: ProcessingJob = {
      id: jobId,
      tournament_id: tournamentId,
      file_id: fileId,
      status: 'pending',
      progress: 0,
      created_by: userId,
    };

    this.jobs.set(jobId, job);

    // Start processing in background
    this.processJobAsync(jobId, options);

    return jobId;
  }

  // Get job status
  getJob(jobId: string): ProcessingJob | null {
    return this.jobs.get(jobId) || null;
  }

  // Subscribe to job progress updates
  onProgress(jobId: string, callback: (progress: JobProgress) => void): void {
    this.progressCallbacks.set(jobId, callback);
  }

  // Unsubscribe from job progress updates
  offProgress(jobId: string): void {
    this.progressCallbacks.delete(jobId);
  }

  // Update job progress
  private updateProgress(jobId: string, progress: number, status: string, message: string, data?: JobProgress['data']): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.progress = progress;
    job.status = status as ProcessingJob['status'];

    const progressUpdate: JobProgress = {
      jobId,
      progress,
      status,
      message,
      data,
    };

    const callback = this.progressCallbacks.get(jobId);
    if (callback) {
      callback(progressUpdate);
    }
  }

  // Process job asynchronously
  private async processJobAsync(
    jobId: string,
    options: { generateReport?: boolean; updateData?: boolean }
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      job.started_at = new Date().toISOString();
      
      this.updateProgress(jobId, 10, 'processing', 'Iniciando procesamiento...');

      const supabase = createClient();

      // Get file information
      this.updateProgress(jobId, 20, 'processing', 'Obteniendo información del archivo...');
      
      const { data: fileRecord, error: fileError } = await supabase
        .from('tournament_files')
        .select('*')
        .eq('id', job.file_id)
        .eq('tournament_id', job.tournament_id)
        .single();

      if (fileError || !fileRecord) {
        throw new Error('Archivo no encontrado');
      }

      // Download file from storage
      this.updateProgress(jobId, 30, 'processing', 'Descargando archivo...');
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('tournament-files')
        .download(fileRecord.file_path);

      if (downloadError || !fileData) {
        throw new Error('Error al descargar archivo');
      }

      // Read file content
      this.updateProgress(jobId, 40, 'processing', 'Leyendo contenido del archivo...');
      const fileContent = await fileData.text();

      // Parse TDF file
      this.updateProgress(jobId, 50, 'processing', 'Analizando archivo TDF...');
      
      const { TDFParser } = await import('./tdf-parser');
      const { tournament, players: participants, matches, standings: results } = TDFParser.parse(fileContent);

      const processedData = {
        participants: 0,
        matches: 0,
        results: 0,
        reportUrl: null as string | null,
      };

      // Update tournament data if requested
      if (options.updateData !== false) {
        this.updateProgress(jobId, 60, 'processing', 'Actualizando participantes...');
        
        // Update participants
        await supabase
          .from('tournament_participants')
          .delete()
          .eq('tournament_id', job.tournament_id);

        if (participants.length > 0) {
          const participantsToInsert = participants.map(p => ({
            ...p,
            tournament_id: job.tournament_id,
          }));

          await supabase
            .from('tournament_participants')
            .insert(participantsToInsert);

          processedData.participants = participants.length;
        }

        this.updateProgress(jobId, 70, 'processing', 'Actualizando partidas...');
        
        // Update matches
        await supabase
          .from('tournament_matches')
          .delete()
          .eq('tournament_id', job.tournament_id);

        if (matches.length > 0) {
          const matchesToInsert = matches.map(m => ({
            ...m,
            tournament_id: job.tournament_id,
          }));

          await supabase
            .from('tournament_matches')
            .insert(matchesToInsert);

          processedData.matches = matches.length;
        }

        this.updateProgress(jobId, 80, 'processing', 'Actualizando resultados...');
        
        // Update results
        await supabase
          .from('tournament_results')
          .delete()
          .eq('tournament_id', job.tournament_id);

        if (results.length > 0) {
          const resultsToInsert = results.map(r => ({
            ...r,
            tournament_id: job.tournament_id,
          }));

          await supabase
            .from('tournament_results')
            .insert(resultsToInsert);

          processedData.results = results.length;
        }

        // Update tournament player count
        await supabase
          .from('tournaments')
          .update({ 
            current_players: participants.length,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', job.tournament_id);
      }

      // Generate HTML report if requested
      if (options.generateReport !== false) {
        this.updateProgress(jobId, 90, 'processing', 'Generando reporte HTML...');
        
        const { generateHTMLReport } = await import('./html-generator');
        const htmlContent = await generateHTMLReport({
          tournament: tournament as unknown as Tournament,
          participants,
          matches,
          results,
        });

        // Upload HTML report
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFileName = `tournament-report-${timestamp}.html`;
        const reportPath = `tournaments/${job.tournament_id}/reports/${reportFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tournament-files')
          .upload(reportPath, htmlContent, {
            contentType: 'text/html',
            upsert: false,
          });

        if (!uploadError && uploadData) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('tournament-files')
            .getPublicUrl(reportPath);

          processedData.reportUrl = urlData.publicUrl;

          // Save report record
          await supabase
            .from('tournament_files')
            .insert({
              tournament_id: job.tournament_id,
              file_name: reportFileName,
              file_path: reportPath,
              file_type: 'html',
              file_size: htmlContent.length,
              uploaded_by: null, // System generated
            });
        }
      }

      // Complete job
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
      job.result_data = processedData;

      this.updateProgress(jobId, 100, 'completed', 'Procesamiento completado exitosamente', processedData);

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      
      job.status = 'failed';
      job.completed_at = new Date().toISOString();
      job.error_message = error instanceof Error ? error.message : 'Error desconocido';

      this.updateProgress(jobId, 0, 'failed', job.error_message);
    }
  }

  // Clean up old jobs (call periodically)
  cleanupOldJobs(maxAgeHours: number = 24): void {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    for (const [jobId, job] of this.jobs.entries()) {
      const jobTime = job.completed_at ? new Date(job.completed_at).getTime() : Date.now();
      
      if (jobTime < cutoffTime && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(jobId);
        this.progressCallbacks.delete(jobId);
      }
    }
  }

  // Get all jobs for a tournament
  getJobsForTournament(tournamentId: string): ProcessingJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.tournament_id === tournamentId)
      .sort((a, b) => {
        const aTime = new Date(a.started_at || '').getTime();
        const bTime = new Date(b.started_at || '').getTime();
        return bTime - aTime; // Most recent first
      });
  }

  // Cancel a job (if still pending)
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending') {
      return false;
    }

    job.status = 'failed';
    job.error_message = 'Cancelado por el usuario';
    job.completed_at = new Date().toISOString();

    this.updateProgress(jobId, 0, 'failed', 'Trabajo cancelado');
    return true;
  }
}

// Singleton instance
export const backgroundJobManager = new BackgroundJobManager();

// Cleanup old jobs every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    backgroundJobManager.cleanupOldJobs();
  }, 60 * 60 * 1000); // 1 hour
}

export { BackgroundJobManager };