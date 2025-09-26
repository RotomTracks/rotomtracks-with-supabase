import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TournamentMatcher } from '@/lib/utils/tournament-matcher';
import { TDFParser } from '@/lib/utils/tdf-parser';
import { FILE_UPLOAD_CONFIG } from '@/lib/constants/tournament';

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;
    const tournamentId = formData.get('tournamentId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file
    const fileExtensionPart = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtensionPart) {
      return NextResponse.json(
        { 
          error: 'Invalid File Type', 
          message: 'El archivo debe tener una extensión válida' 
        },
        { status: 400 }
      );
    }
    
    const fileExtension = '.' + fileExtensionPart;
    
    if (!FILE_UPLOAD_CONFIG.allowedExtensions.includes(fileExtension as any)) {
      return NextResponse.json(
        { 
          error: 'Invalid File Type', 
          message: `Tipo de archivo no válido. Solo se permiten: ${FILE_UPLOAD_CONFIG.allowedExtensions.join(', ')}` 
        },
        { status: 400 }
      );
    }

    if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
      const maxSizeMB = Math.round(FILE_UPLOAD_CONFIG.maxSize / (1024 * 1024));
      return NextResponse.json(
        { 
          error: 'File Too Large', 
          message: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB` 
        },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    if (action === 'create_new') {
      return await handleCreateNewTournament(supabase, user.id, file, fileContent);
    } else if (action === 'update_existing') {
      if (!tournamentId) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Tournament ID requerido para actualización' },
          { status: 400 }
        );
      }
      return await handleUpdateExistingTournament(supabase, user.id, tournamentId, file, fileContent);
    } else {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Acción no válida' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Smart upload endpoint error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

async function handleCreateNewTournament(
  supabase: any,
  userId: string,
  file: File,
  fileContent: string
) {
  try {
    // Parse TDF file
    const { tournament, players: participants, matches, standings: results } = TDFParser.parse(fileContent);
    
    // Create tournament in database
    const { data: newTournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        official_tournament_id: tournament.id,
        name: tournament.name,
        tournament_type: tournament.format || 'TCG Tournament',
        city: tournament.city,
        country: tournament.country,
        state: null, // Not available in TDF
        start_date: tournament.date,
        end_date: tournament.date, // Assume single day tournament
        status: tournament.status,
        organizer_id: userId,
        current_players: participants.length,
        registration_open: false, // TDF tournaments are completed
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('Tournament creation error:', tournamentError);
      return NextResponse.json(
        { error: 'Database Error', message: 'Error al crear torneo en la base de datos' },
        { status: 500 }
      );
    }

    // Upload file to storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `tournaments/${newTournament.id}/uploads/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-files')
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Don't fail the tournament creation, just log the error
    }

    // Save file record if upload succeeded
    if (uploadData) {
      await supabase
        .from('tournament_files')
        .insert({
          tournament_id: newTournament.id,
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.name.split('.').pop()?.toLowerCase() || 'tdf',
          file_size: file.size,
          uploaded_by: userId,
        });
    }

    // Insert participants
    if (participants.length > 0) {
      const participantsToInsert = participants.map(p => ({
        ...p,
        tournament_id: newTournament.id,
      }));

      await supabase
        .from('tournament_participants')
        .insert(participantsToInsert);
    }

    // Insert matches
    if (matches.length > 0) {
      const matchesToInsert = matches.map(m => ({
        ...m,
        tournament_id: newTournament.id,
      }));

      await supabase
        .from('tournament_matches')
        .insert(matchesToInsert);
    }

    // Insert results
    if (results.length > 0) {
      const resultsToInsert = results.map(r => ({
        ...r,
        tournament_id: newTournament.id,
      }));

      await supabase
        .from('tournament_results')
        .insert(resultsToInsert);
    }

    return NextResponse.json({
      success: true,
      tournamentId: newTournament.id,
      message: 'Torneo creado exitosamente',
      tournament: newTournament,
      stats: {
        participants: participants.length,
        matches: matches.length,
        results: results.length,
      },
    });

  } catch (error) {
    console.error('Create tournament error:', error);
    return NextResponse.json(
      { error: 'Processing Error', message: 'Error al procesar el archivo TDF' },
      { status: 500 }
    );
  }
}

async function handleUpdateExistingTournament(
  supabase: any,
  userId: string,
  tournamentId: string,
  file: File,
  fileContent: string
) {
  try {
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

    if (tournament.organizer_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'No tienes permisos para actualizar este torneo' },
        { status: 403 }
      );
    }

    // Use tournament matcher to update
    const updateResult = await TournamentMatcher.updateExisting(tournamentId, fileContent, userId);
    
    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Update Error', message: updateResult.message },
        { status: 400 }
      );
    }

    // Upload new file version
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `tournaments/${tournamentId}/uploads/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-files')
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
    }

    // Save file record
    if (uploadData) {
      await supabase
        .from('tournament_files')
        .insert({
          tournament_id: tournamentId,
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.name.split('.').pop()?.toLowerCase() || 'tdf',
          file_size: file.size,
          uploaded_by: userId,
        });
    }

    // Re-process tournament data
    const { players: participants, matches, standings: results } = TDFParser.parse(fileContent);

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

      await supabase
        .from('tournament_participants')
        .insert(participantsToInsert);
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

      await supabase
        .from('tournament_matches')
        .insert(matchesToInsert);
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

      await supabase
        .from('tournament_results')
        .insert(resultsToInsert);
    }

    return NextResponse.json({
      success: true,
      tournamentId,
      message: 'Torneo actualizado exitosamente',
      stats: {
        participants: participants.length,
        matches: matches.length,
        results: results.length,
      },
    });

  } catch (error) {
    console.error('Update tournament error:', error);
    return NextResponse.json(
      { error: 'Processing Error', message: 'Error al actualizar el torneo' },
      { status: 500 }
    );
  }
}