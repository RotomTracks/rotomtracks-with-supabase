import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TDFParser } from '@/lib/utils/tdf-parser';
import { generateHTMLReport } from '@/lib/utils/html-generator';
import { ParticipantStatus, MatchStatus, MatchOutcome } from '@/lib/types/tournament';

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
        { error: 'Unauthorized', message: 'Debes iniciar sesión para procesar torneos' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;
    
    // Verify tournament exists and user has permission
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, organizer_id, name, status')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Check if user is the organizer
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

    // Get file information
    const { data: fileRecord, error: fileError } = await supabase
      .from('tournament_files')
      .select('*')
      .eq('id', fileId)
      .eq('tournament_id', tournamentId)
      .single();

    if (fileError || !fileRecord) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Archivo no encontrado' },
        { status: 404 }
      );
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('tournament-files')
      .download(fileRecord.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Storage Error', message: 'Error al descargar archivo' },
        { status: 500 }
      );
    }

    // Read file content
    const fileContent = await fileData.text();

    // Process tournament data
    const processingResult = await processTournamentFile(
      supabase,
      tournamentId,
      fileContent,
      { generateReport, updateData }
    );

    if (!processingResult.success) {
      return NextResponse.json(
        { error: 'Processing Error', message: processingResult.error },
        { status: 500 }
      );
    }

    // Update tournament status
    await supabase
      .from('tournaments')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId);

    return NextResponse.json({
      success: true,
      message: 'Torneo procesado exitosamente',
      data: processingResult.data,
    });

  } catch (error) {
    console.error('Tournament processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Get processing status
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
    
    // Get tournament processing status
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        status,
        organizer_id,
        current_players,
        updated_at,
        tournament_participants(count),
        tournament_matches(count),
        tournament_results(count),
        tournament_files(
          id,
          file_name,
          file_type,
          created_at
        )
      `)
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Check if user has access (organizer or participant)
    const isOrganizer = tournament.organizer_id === user.id;
    const { data: participation } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id)
      .single();

    const hasAccess = isOrganizer || !!participation;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'No tienes acceso a este torneo' },
        { status: 403 }
      );
    }

    // Get HTML reports
    const { data: htmlReports } = await supabase.storage
      .from('tournament-files')
      .list(`tournaments/${tournamentId}/reports/`, {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    const reportUrls = htmlReports?.map(report => ({
      name: report.name,
      url: supabase.storage
        .from('tournament-files')
        .getPublicUrl(`tournaments/${tournamentId}/reports/${report.name}`).data.publicUrl,
      created_at: report.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        tournament: {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status,
          current_players: tournament.current_players,
          updated_at: tournament.updated_at,
        },
        stats: {
          participants: tournament.tournament_participants?.[0]?.count || 0,
          matches: tournament.tournament_matches?.[0]?.count || 0,
          results: tournament.tournament_results?.[0]?.count || 0,
          files: tournament.tournament_files?.length || 0,
        },
        files: tournament.tournament_files || [],
        reports: reportUrls,
        isOrganizer,
      },
    });

  } catch (error) {
    console.error('Get processing status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Process tournament file and update database
async function processTournamentFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tournamentId: string,
  fileContent: string,
  options: { generateReport: boolean; updateData: boolean }
): Promise<{ success: boolean; error?: string; data?: { updatedParticipants: number; updatedMatches: number; updatedResults: number; reportUrl?: string; processingTime?: string } }> {
  try {
    // Parse TDF file
    const { players: participants, matches, standings: results } = TDFParser.parse(fileContent);

    let updatedParticipants = 0;
    let updatedMatches = 0;
    let updatedResults = 0;
    let reportUrl = null;

    // Update tournament data if requested
    if (options.updateData) {
      // Update participants (replace existing)
      await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournamentId);

      if (participants.length > 0) {
        const participantsToInsert = participants.map(p => ({
          ...p,
          tournament_id: tournamentId,
        }));

        const { error: participantsError } = await supabase
          .from('tournament_participants')
          .insert(participantsToInsert);

        if (participantsError) {
          throw new Error(`Error al insertar participantes: ${participantsError.message}`);
        }

        updatedParticipants = participants.length;
      }

      // Update matches (replace existing)
      await supabase
        .from('tournament_matches')
        .delete()
        .eq('tournament_id', tournamentId);

      if (matches.length > 0) {
        const matchesToInsert = matches.map(m => ({
          ...m,
          tournament_id: tournamentId,
        }));

        const { error: matchesError } = await supabase
          .from('tournament_matches')
          .insert(matchesToInsert);

        if (matchesError) {
          throw new Error(`Error al insertar matches: ${matchesError.message}`);
        }

        updatedMatches = matches.length;
      }

      // Update results (replace existing)
      await supabase
        .from('tournament_results')
        .delete()
        .eq('tournament_id', tournamentId);

      if (results.length > 0) {
        const resultsToInsert = results.map(r => ({
          ...r,
          tournament_id: tournamentId,
        }));

        const { error: resultsError } = await supabase
          .from('tournament_results')
          .insert(resultsToInsert);

        if (resultsError) {
          throw new Error(`Error al insertar resultados: ${resultsError.message}`);
        }

        updatedResults = results.length;
      }

      // Update tournament player count
      await supabase
        .from('tournaments')
        .update({ current_players: participants.length })
        .eq('id', tournamentId);
    }

    // Generate HTML report if requested
    if (options.generateReport) {
      try {
        // Get full tournament data for report generation
        const { data: fullTournament } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', tournamentId)
          .single();

        if (!fullTournament) {
          throw new Error('No se pudo obtener los datos completos del torneo');
        }

        // Convert TDF data to database format for report generation
        // TODO: Implement report generation with mapped data
        // const mappedParticipants = participants.map((p, index) => ({
        //   id: `temp-${index}`,
        //   tournament_id: tournamentId,
        //   user_id: `temp-user-${index}`,
        //   player_name: p.name,
        //   player_id: p.id,
        //   registration_date: new Date().toISOString(),
        //   status: ParticipantStatus.CHECKED_IN
        // }));

        // Function to map TDF result to MatchOutcome
        // const mapTDFResultToOutcome = (result: string): MatchOutcome => {
        //   switch (result) {
        //     case '1-0':
        //       return MatchOutcome.PLAYER1_WINS;
        //     case '0-1':
        //       return MatchOutcome.PLAYER2_WINS;
        //     case '0.5-0.5':
        //       return MatchOutcome.DRAW;
        //     case 'bye':
        //       return MatchOutcome.BYE;
        //     default:
        //       return MatchOutcome.PLAYER1_WINS; // Default fallback
        //   }
        // };

        // const mappedMatches = matches.map((m, index) => ({
        //   id: `temp-${index}`,
        //   tournament_id: tournamentId,
        //   round_number: m.round,
        //   table_number: m.table,
        //   player1_id: m.player1,
        //   player2_id: m.player2,
        //   outcome: mapTDFResultToOutcome(m.result),
        //   match_status: MatchStatus.COMPLETED,
        //   created_at: new Date().toISOString()
        // }));

        // const mappedResults = results.map((r, index) => ({
        //   id: `temp-${index}`,
        //   tournament_id: tournamentId,
        //   participant_id: r.id,
        //   wins: r.wins,
        //   losses: r.losses,
        //   draws: r.draws,
        //   byes: 0,
        //   final_standing: r.placement,
        //   points: r.points,
        //   created_at: new Date().toISOString()
        // }));

        const htmlContent = await generateHTMLReport({
          tournament: fullTournament,
          participants: participants,
          matches: matches,
          results: results,
        });

        // Upload HTML report to storage
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFileName = `tournament-report-${timestamp}.html`;
        const reportPath = `tournaments/${tournamentId}/reports/${reportFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tournament-files')
          .upload(reportPath, htmlContent, {
            contentType: 'text/html',
            upsert: false,
          });

        if (uploadError) {
          // Report upload failed - not critical for processing
        } else {
          // Get public URL for the report
          const { data: urlData } = supabase.storage
            .from('tournament-files')
            .getPublicUrl(reportPath);

          reportUrl = urlData.publicUrl;

          // Save report record
          await supabase
            .from('tournament_files')
            .insert({
              tournament_id: tournamentId,
              file_name: reportFileName,
              file_path: reportPath,
              file_type: 'html',
              file_size: htmlContent.length,
              uploaded_by: null, // System generated
            });
        }
      } catch {
        // HTML report generation failed - not critical for processing
      }
    }

    return {
      success: true,
      data: {
        updatedParticipants,
        updatedMatches,
        updatedResults,
        reportUrl: reportUrl || undefined,
        processingTime: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('Tournament processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}