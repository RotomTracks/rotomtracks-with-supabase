import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TDFParser, TDFUtils } from '@/lib/tdf';
import { TournamentType, ErrorCodes, TDFImportReport } from '@/lib/types/tournament';
import {
  withErrorHandling,
  generateRequestId,
  handleSupabaseError,
  handleFileUploadError,
  validateAuthentication,
  validateUserRole,
  createErrorResponse
} from '@/lib/utils/api-error-handler';
import {
  createTournamentResponse
} from '@/lib/utils/api-response-formatter';

// POST /api/tournaments/tdf-upload - Create tournament from TDF file
export const POST = withErrorHandling(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  
  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  // Validate user role
  const roleResult = await validateUserRole(supabase, user.id as string, 'organizer', requestId);
  if (roleResult instanceof NextResponse) {
    return roleResult;
  }

  // Parse form data
  const formData = await request.formData();
  const file = formData.get('tdf') as File;

  if (!file) {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'No se proporcionó archivo TDF',
      undefined,
      'file',
      requestId
    );
  }

  // Validate file extension
  if (!file.name.toLowerCase().endsWith('.tdf')) {
    return createErrorResponse(
      ErrorCodes.INVALID_FILE_FORMAT,
      'El archivo debe tener extensión .tdf',
      { provided_extension: file.name.split('.').pop() },
      'file',
      requestId
    );
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return createErrorResponse(
      ErrorCodes.UPLOAD_ERROR,
      'Archivo demasiado grande (máximo 10MB)',
      { file_size: file.size, max_size: 10 * 1024 * 1024 },
      'file',
      requestId
    );
  }

  // Read file content
  const fileContent = await file.text();

  // Parse and validate TDF
  let parsedTDF;
  try {
    parsedTDF = TDFParser.parse(fileContent);
  } catch (error) {
    return createErrorResponse(
      ErrorCodes.INVALID_FILE_FORMAT,
      'Archivo TDF inválido',
      { 
        parsing_error: error instanceof Error ? error.message : 'Error de análisis desconocido',
        file_name: file.name
      },
      'file',
      requestId
    );
  }

  // Check compatibility
  const compatibility = TDFParser.isCompatible(fileContent);
  if (!compatibility.compatible) {
    return createErrorResponse(
      ErrorCodes.INVALID_FILE_FORMAT,
      'Archivo TDF no compatible',
      { 
        reason: compatibility.reason,
        file_name: file.name
      },
      'file',
      requestId
    );
  }

  const { metadata, players } = parsedTDF;

  // Map tournament type
  let tournamentType: TournamentType;
  try {
    tournamentType = TDFParser.mapTournamentType(metadata.gametype, metadata.mode);
  } catch (error) {
    return createErrorResponse(
      ErrorCodes.INVALID_FILE_FORMAT,
      'Tipo de torneo no soportado',
      { 
        gametype: metadata.gametype,
        mode: metadata.mode,
        supported_types: Object.values(TournamentType)
      },
      'tournament_type',
      requestId
    );
  }

  // Check for duplicate tournament ID
  const { data: existingTournament, error: duplicateError } = await supabase
    .from('tournaments')
    .select('id')
    .eq('official_tournament_id', metadata.id)
    .single();

  if (duplicateError && duplicateError.code !== 'PGRST116') {
    return handleSupabaseError(duplicateError, 'verificación de duplicados', requestId);
  }

  if (existingTournament) {
    return createErrorResponse(
      ErrorCodes.DUPLICATE_TOURNAMENT_ID,
      'Ya existe un torneo con este ID oficial',
      { official_tournament_id: metadata.id },
      'official_tournament_id',
      requestId
    );
  }

  // Convert TDF date to ISO format
  let startDate: string;
  try {
    startDate = TDFUtils.convertTDFDateToISO(metadata.startdate);
  } catch (error) {
    return createErrorResponse(
      ErrorCodes.INVALID_FILE_FORMAT,
      'Formato de fecha de inicio inválido en TDF',
      { 
        provided_date: metadata.startdate,
        expected_format: 'MM/DD/YYYY'
      },
      'start_date',
      requestId
    );
  }

    // Store original TDF file in Supabase Storage
    const fileName = `${metadata.id}_original.tdf`;
    const filePath = `tournaments/${metadata.id}/${fileName}`;

    const { error: storageError } = await supabase.storage
      .from('tournament-files')
      .upload(filePath, file, {
        contentType: 'application/xml',
        upsert: false
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      // Continue without storage - we can still create the tournament
    }

    // Create tournament record
    const tournamentData = {
      name: metadata.name,
      tournament_type: tournamentType,
      official_tournament_id: metadata.id,
      city: metadata.city,
      country: metadata.country,
      state: metadata.state || null,
      start_date: startDate,
      organizer_id: user.id,
      status: 'upcoming',
      current_players: players.length,
      registration_open: players.length === 0, // Open registration if no players
      tdf_metadata: {
        original_filename: file.name,
        file_path: storageError ? null : filePath,
        gametype: metadata.gametype,
        mode: metadata.mode,
        roundtime: metadata.roundtime,
        finalsroundtime: metadata.finalsroundtime,
        organizer: metadata.organizer,
        version: metadata.version,
        uploaded_at: new Date().toISOString()
      },
      description: `Torneo creado desde archivo TDF: ${file.name}`
    };

    const { data: tournament, error: createError } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name
        )
      `)
      .single();

    if (createError) {
      // Clean up uploaded file if tournament creation failed
      if (!storageError) {
        await supabase.storage
          .from('tournament-files')
          .remove([filePath]);
      }
      
      return handleSupabaseError(createError, 'creación de torneo desde TDF', requestId);
    }

    // Process TDF players - only import those with existing accounts
    let importReport: TDFImportReport = {
      total_participants: players.length,
      imported_participants: 0,
      skipped_participants: 0,
      skipped_users: [],
      imported_users: []
    };

    if (players.length > 0) {
      // Find existing users by player_id
      const playerIds = players.map(p => p.userid).filter(Boolean);
      
      const { data: existingUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, player_id, first_name, last_name')
        .in('player_id', playerIds);

      if (usersError) {
        console.error('Error fetching existing users:', usersError);
      }

      const userMap = new Map();
      (existingUsers || []).forEach(user => {
        if (user.player_id) {
          userMap.set(user.player_id, user);
        }
      });

      const participantsToImport = [];

      for (const player of players) {
        const playerName = `${player.firstname} ${player.lastname}`.trim();
        
        if (!player.userid) {
          importReport.skipped_users.push({
            player_name: playerName,
            player_id: '', // No player_id available
            player_birthdate: player.birthdate || '',
            reason: 'invalid_data'
          });
          importReport.skipped_participants++;
          continue;
        }

        const existingUser = userMap.get(player.userid);
        
        if (!existingUser) {
          importReport.skipped_users.push({
            player_name: playerName,
            player_id: player.userid,
            player_birthdate: player.birthdate || '',
            reason: 'no_account'
          });
          importReport.skipped_participants++;
          continue;
        }

        // User exists, add to import list
        participantsToImport.push({
          tournament_id: tournament.id,
          user_id: existingUser.id,
          player_name: playerName,
          player_id: player.userid,
          registration_date: TDFUtils.convertTDFDateToISO(player.creationdate),
          status: player.dropped ? 'dropped' : 'registered'
        });

        importReport.imported_users.push({
          player_name: playerName,
          player_id: player.userid,
          player_birthdate: player.birthdate || '',
          user_id: existingUser.id
        });
        importReport.imported_participants++;
      }

      // Insert participants that have accounts
      if (participantsToImport.length > 0) {
        const { error: participantsError } = await supabase
          .from('tournament_participants')
          .insert(participantsToImport);

        if (participantsError) {
          console.error('Error creating participants:', participantsError);
          return handleSupabaseError(participantsError, 'creación de participantes', requestId);
        }

        // Update tournament player count
        await supabase
          .from('tournaments')
          .update({ 
            current_players: participantsToImport.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', tournament.id);
      }
    }

    return NextResponse.json({
      data: {
        tournament,
        import_report: importReport,
        metadata: {
          original_filename: file.name,
          tournament_type: tournamentType,
          file_stored: !storageError
        }
      },
      message: importReport.skipped_participants > 0 
        ? `Torneo creado. Se importaron ${importReport.imported_participants} de ${importReport.total_participants} participantes.`
        : 'Torneo creado exitosamente desde archivo TDF',
      timestamp: new Date().toISOString(),
      request_id: requestId
    }, { status: 201 });
});