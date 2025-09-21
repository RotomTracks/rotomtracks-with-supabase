import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TDFParser, TDFUtils } from '@/lib/tdf';
import { TournamentType } from '@/lib/types/tournament';

// POST /api/tournaments/tdf-upload - Create tournament from TDF file
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user is an organizer
    if (profile.user_role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only organizers can upload TDF files' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('tdf') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No TDF file provided' },
        { status: 400 }
      );
    }

    // Validate file
    if (!file.name.toLowerCase().endsWith('.tdf')) {
      return NextResponse.json(
        { error: 'File must have .tdf extension' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File too large (maximum 10MB)' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse and validate TDF
    let parsedTDF;
    try {
      parsedTDF = TDFParser.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid TDF file', 
          details: error instanceof Error ? error.message : 'Unknown parsing error'
        },
        { status: 400 }
      );
    }

    // Check compatibility
    const compatibility = TDFParser.isCompatible(fileContent);
    if (!compatibility.compatible) {
      return NextResponse.json(
        { 
          error: 'TDF file not compatible', 
          details: compatibility.reason 
        },
        { status: 400 }
      );
    }

    const { metadata, players } = parsedTDF;

    // Map tournament type
    let tournamentType: TournamentType;
    try {
      tournamentType = TDFParser.mapTournamentType(metadata.gametype, metadata.mode);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Unsupported tournament type', 
          details: `${metadata.gametype}:${metadata.mode}` 
        },
        { status: 400 }
      );
    }

    // Check for duplicate tournament ID
    const { data: existingTournament } = await supabase
      .from('tournaments')
      .select('id')
      .eq('official_tournament_id', metadata.id)
      .single();

    if (existingTournament) {
      return NextResponse.json(
        { error: 'Tournament with this official ID already exists' },
        { status: 409 }
      );
    }

    // Convert TDF date to ISO format
    let startDate: string;
    try {
      startDate = TDFUtils.convertTDFDateToISO(metadata.startdate);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid start date format in TDF', 
          details: metadata.startdate 
        },
        { status: 400 }
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
      console.error('Error creating tournament:', createError);
      
      // Clean up uploaded file if tournament creation failed
      if (!storageError) {
        await supabase.storage
          .from('tournament-files')
          .remove([filePath]);
      }
      
      return NextResponse.json(
        { error: 'Failed to create tournament', details: createError.message },
        { status: 500 }
      );
    }

    // If TDF has players, create participant records
    if (players.length > 0) {
      const participantData = players.map(player => ({
        tournament_id: tournament.id,
        user_id: null, // TDF players don't have user accounts initially
        player_name: `${player.firstname} ${player.lastname}`.trim(),
        player_id: player.userid,
        player_birthdate: TDFUtils.convertTDFDateToISO(player.birthdate),
        registration_date: TDFUtils.convertTDFDateToISO(player.creationdate),
        registration_source: 'tdf',
        status: player.dropped ? 'dropped' : 'confirmed',
        tdf_userid: player.userid
      }));

      const { error: participantsError } = await supabase
        .from('tournament_participants')
        .insert(participantData);

      if (participantsError) {
        console.error('Error creating participants:', participantsError);
        // Don't fail the tournament creation, just log the error
      }
    }

    return NextResponse.json({
      tournament,
      metadata: {
        original_filename: file.name,
        players_imported: players.length,
        is_empty: players.length === 0,
        tournament_type: tournamentType,
        file_stored: !storageError
      },
      message: 'Tournament created successfully from TDF file'
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in TDF upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}