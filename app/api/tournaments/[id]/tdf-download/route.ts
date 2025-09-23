import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TDFGenerator, mapTournamentTypeToTDF, generateOrganizerPOPID } from '@/lib/tdf';
import { formatTDFDate, formatTDFTimestamp } from '@/lib/tdf/utils';

/**
 * Generate a unique TDF user ID for players
 */
function generateTDFUserID(playerId: string): string {
  // Generate a 7-digit user ID based on player ID or random number
  if (playerId && playerId.length >= 7) {
    return playerId.substring(0, 7);
  }
  
  // Generate random 7-digit number
  const randomId = Math.floor(1000000 + Math.random() * 9000000);
  return randomId.toString();
}

// GET /api/tournaments/[id]/tdf-download - Generate and download TDF file with registered players
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId } = await params;

    // Check if user is authenticated and has permission
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          message: 'You must be logged in to download TDF files'
        },
        { status: 401 }
      );
    }

    // Get tournament details with organizer check
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { 
          error: 'Tournament not found',
          code: 'TOURNAMENT_NOT_FOUND',
          message: 'The requested tournament does not exist'
        },
        { status: 404 }
      );
    }

    // Check if user is the organizer
    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { 
          error: 'Access denied',
          code: 'ACCESS_DENIED',
          message: 'Only tournament organizers can download TDF files'
        },
        { status: 403 }
      );
    }

    // Get all registered participants (not waitlisted)
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select(`
        id,
        player_name,
        player_id,
        player_birthdate,
        registration_date,
        tdf_userid,
        status
      `)
      .eq('tournament_id', tournamentId)
      .in('status', ['registered', 'confirmed'])
      .order('registration_date', { ascending: true });

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return NextResponse.json(
        { error: 'Failed to fetch tournament participants' },
        { status: 500 }
      );
    }

    const mappedParticipants = participants.map((p: any) => {
      // Generate TDF user ID if not exists
      const tdfUserid = p.tdf_userid || generateTDFUserID(p.player_id || p.id);
      
      // Convert birthdate to TDF format (MM/DD/YYYY)
      const birthdate = p.player_birthdate 
        ? formatTDFDate(p.player_birthdate)
        : '01/01/2000';
      
      // Convert registration date to TDF format
        const creationDate = formatTDFTimestamp(p.registration_date || new Date().toISOString());
      
      return {
        id: p.id,
        tournament_id: tournamentId,
        user_id: p.user_id || p.id || 'unknown',
        player_name: p.player_name,
        player_id: p.player_id || '',
        player_birthdate: birthdate,
        registration_date: p.registration_date,
        status: p.status || 'registered',
        tdf_userid: tdfUserid,
        creation_date: creationDate,
        last_modified_date: creationDate
      };
    });

    let generatedTDF;

    // Check if tournament has original TDF file
    if (tournament.original_tdf_file_path && tournament.tdf_metadata) {
      try {
        // Download original TDF file from Supabase Storage
        const { data: originalTDFData, error: downloadError } = await supabase.storage
          .from('tournament-files')
          .download(tournament.original_tdf_file_path);

        if (downloadError) {
          console.error('Error downloading original TDF:', downloadError);
          throw new Error('Failed to download original TDF file');
        }

        // Convert blob to text
        const originalXMLContent = await originalTDFData.text();

        // Update TDF with registered players
        generatedTDF = TDFGenerator.updateTDFWithPlayers(originalXMLContent, mappedParticipants);
      } catch (error) {
        console.error('Error processing original TDF:', error);
        // Fall back to generating from scratch
        generatedTDF = generateTDFFromScratch(tournament, mappedParticipants);
      }
    } else {
      // Generate TDF from scratch
      generatedTDF = generateTDFFromScratch(tournament, mappedParticipants);
    }

    // Validate generated TDF
    const validation = TDFGenerator.validateGeneratedTDF(generatedTDF.xmlContent);
    if (!validation.isValid) {
      console.error('Generated TDF validation failed:', validation.errors);
      return NextResponse.json(
        { error: 'Failed to generate valid TDF file', details: validation.errors },
        { status: 500 }
      );
    }

    // Generate filename
    const filename = TDFGenerator.generateFilename(generatedTDF.metadata);

    // Return TDF file as download
    return new NextResponse(generatedTDF.xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Player-Count': generatedTDF.playerCount.toString(),
        'X-Generated-At': generatedTDF.generatedAt
      }
    });

  } catch (error) {
    console.error('Unexpected error in TDF download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate TDF from scratch when no original TDF file exists
 */
function generateTDFFromScratch(tournament: any, participants: any[]) {
  // Extract tournament type and mode from metadata or use utility function
  let gametype = 'TRADING_CARD_GAME';
  let mode = 'LEAGUECHALLENGE';

  if (tournament.tdf_metadata) {
    gametype = tournament.tdf_metadata.gametype || gametype;
    mode = tournament.tdf_metadata.mode || mode;
  } else {
    // Use utility function to map tournament type
    const tdfType = mapTournamentTypeToTDF(tournament.tournament_type);
    gametype = tdfType.gametype;
    mode = tdfType.mode;
  }

  // Get organizer info from user profile or use defaults
  const organizerName = tournament.organizer_name || 'Tournament Organizer';
  const organizerPopid = tournament.organizer_popid || generateOrganizerPOPID();

  // Convert start date to TDF format (MM/DD/YYYY)
  const startDate = formatTDFDate(tournament.start_date);

  const tournamentData = {
    name: tournament.name,
    id: tournament.official_tournament_id || tournament.id.substring(0, 8),
    city: tournament.city,
    state: tournament.state || '',
    country: tournament.country,
    startDate: startDate,
    organizer: {
      name: organizerName,
      popid: organizerPopid
    },
    tournamentType: gametype,
    mode: mode
  };

  return TDFGenerator.generateFromScratch(tournamentData, participants);
}

// POST /api/tournaments/[id]/tdf-download - Generate TDF with custom options
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get tournament and verify organizer
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only tournament organizers can generate TDF files' },
        { status: 403 }
      );
    }

    // Parse request body for custom options
    const body = await request.json();
    const {
      includeWaitlist = false,
      customSettings = {},
      playerFilters = {}
    } = body;

    // Build participant query based on filters
    let participantQuery = supabase
      .from('tournament_participants')
      .select(`
        id,
        player_name,
        player_id,
        player_birthdate,
        registration_date,
        tdf_userid,
        status
      `)
      .eq('tournament_id', tournamentId);

    // Apply status filter
    const allowedStatuses = ['registered', 'confirmed'];
    if (includeWaitlist) {
      allowedStatuses.push('waitlist');
    }
    participantQuery = participantQuery.in('status', allowedStatuses);

    // Apply additional filters if provided
    if (playerFilters.registrationDateFrom) {
      participantQuery = participantQuery.gte('registration_date', playerFilters.registrationDateFrom);
    }
    if (playerFilters.registrationDateTo) {
      participantQuery = participantQuery.lte('registration_date', playerFilters.registrationDateTo);
    }

    const { data: participants, error: participantsError } = await participantQuery
      .order('registration_date', { ascending: true });

    if (participantsError) {
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    const tdfParticipants = participants.map((p: any) => {
      // Generate TDF user ID if not exists
      const tdfUserid = p.tdf_userid || generateTDFUserID(p.player_id || p.id);
      
      // Convert birthdate to TDF format (MM/DD/YYYY)
      const birthdate = p.player_birthdate 
        ? formatTDFDate(p.player_birthdate)
        : '01/01/2000';
      
      // Convert registration date to TDF format
        const creationDate = formatTDFTimestamp(p.registration_date || new Date().toISOString());
      
      return {
        id: p.id,
        tournament_id: tournamentId,
        user_id: p.user_id || p.id || 'unknown',
        player_name: p.player_name,
        player_id: p.player_id || '',
        player_birthdate: birthdate,
        registration_date: p.registration_date,
        status: p.status || 'registered',
        tdf_userid: tdfUserid,
        creation_date: creationDate,
        last_modified_date: creationDate
      };
    });

    // Generate TDF with custom settings
    let generatedTDF;
    
    if (tournament.original_tdf_file_path && !customSettings.forceFromScratch) {
      try {
        const { data: originalTDFData } = await supabase.storage
          .from('tournament-files')
          .download(tournament.original_tdf_file_path);

        const originalXMLContent = await originalTDFData!.text();
        generatedTDF = TDFGenerator.updateTDFWithPlayers(originalXMLContent, tdfParticipants);
      } catch (error) {
        generatedTDF = generateTDFFromScratch(tournament, tdfParticipants);
      }
    } else {
      generatedTDF = generateTDFFromScratch(tournament, tdfParticipants);
    }

    // Apply custom settings if provided
    if (Object.keys(customSettings).length > 0) {
      try {
        // For now, we'll apply custom settings by modifying the XML content directly
        // This is a simplified approach - in a full implementation, you'd want to parse the XML properly
        
        let modifiedXML = generatedTDF.xmlContent;
        
        // Apply custom tournament name if provided
        if (customSettings.tournamentName) {
          modifiedXML = modifiedXML.replace(
            /<name>.*?<\/name>/,
            `<name>${customSettings.tournamentName}</name>`
          );
        }
        
        // Apply custom location if provided
        if (customSettings.location) {
          modifiedXML = modifiedXML.replace(
            /<city>.*?<\/city>/,
            `<city>${customSettings.location}</city>`
          );
        }
        
        // Apply custom date if provided
        if (customSettings.date) {
          modifiedXML = modifiedXML.replace(
            /<startdate>.*?<\/startdate>/,
            `<startdate>${customSettings.date}</startdate>`
          );
        }
        
        // Apply custom round time if provided
        if (customSettings.roundTime) {
          modifiedXML = modifiedXML.replace(
            /<roundtime>.*?<\/roundtime>/,
            `<roundtime>${customSettings.roundTime}</roundtime>`
          );
        }
        
        // Update the generated TDF with modified XML
        generatedTDF = {
          ...generatedTDF,
          xmlContent: modifiedXML
        };
        
        console.log('Custom settings applied successfully');
      } catch (error) {
        console.warn('Failed to apply custom settings, using original TDF:', error);
        // Continue with original TDF if custom settings application fails
      }
    }

    const validation = TDFGenerator.validateGeneratedTDF(generatedTDF.xmlContent);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Generated TDF validation failed', details: validation.errors },
        { status: 500 }
      );
    }

    const filename = TDFGenerator.generateFilename(generatedTDF.metadata);

    return new NextResponse(generatedTDF.xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Player-Count': generatedTDF.playerCount.toString(),
        'X-Generated-At': generatedTDF.generatedAt,
        'X-Include-Waitlist': includeWaitlist.toString()
      }
    });

  } catch (error) {
    console.error('Error in custom TDF generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}