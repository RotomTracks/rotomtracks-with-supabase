import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { backgroundJobManager } from '@/lib/utils/background-jobs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Debes iniciar sesión' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;
    
    // Verify tournament exists and user has permission
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, organizer_id, name')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Solo el organizador puede procesar el torneo' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { fileId, generateReport = true, updateData = true } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'ID de archivo requerido' },
        { status: 400 }
      );
    }

    // Verify file exists
    const { data: fileRecord, error: fileError } = await supabase
      .from('tournament_files')
      .select('id, file_name, file_type')
      .eq('id', fileId)
      .eq('tournament_id', tournamentId)
      .single();

    if (fileError || !fileRecord) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Archivo no encontrado' },
        { status: 404 }
      );
    }

    // Create background job
    const jobId = await backgroundJobManager.createJob(
      tournamentId,
      fileId,
      user.id,
      { generateReport, updateData }
    );

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Trabajo de procesamiento iniciado',
      file: {
        id: fileRecord.id,
        name: fileRecord.file_name,
        type: fileRecord.file_type,
      },
    });

  } catch (error) {
    console.error('Background processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Get job status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Debes iniciar sesión' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Get specific job status
      const job = backgroundJobManager.getJob(jobId);
      
      if (!job) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Trabajo no encontrado' },
          { status: 404 }
        );
      }

      if (job.tournament_id !== tournamentId) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Acceso denegado' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        job,
      });
    } else {
      // Get all jobs for tournament
      const jobs = backgroundJobManager.getJobsForTournament(tournamentId);
      
      // Filter jobs by user permission
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('organizer_id')
        .eq('id', tournamentId)
        .single();

      if (!tournament || tournament.organizer_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Acceso denegado' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        jobs,
      });
    }

  } catch (error) {
    console.error('Get job status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Cancel job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Debes iniciar sesión' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'ID de trabajo requerido' },
        { status: 400 }
      );
    }

    // Verify tournament permission
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('organizer_id')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament || tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Cancel job
    const cancelled = backgroundJobManager.cancelJob(jobId);

    if (!cancelled) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No se pudo cancelar el trabajo' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trabajo cancelado exitosamente',
    });

  } catch (error) {
    console.error('Cancel job error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}