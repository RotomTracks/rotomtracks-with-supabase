import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TDFGenerator, TournamentParticipant, mapTournamentTypeToTDF, generateOrganizerPOPID } from '@/lib/tdf';

// GET /api/tournaments/[id]/tdf-test - Test TDF generation without downloading
export async function GET(
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

    // Get tournament details
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

    // Check if user is the organizer
    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only tournament organizers can test TDF generation' },
        { status: 403 }
      );
    }

    // Get participants
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
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // Convert to TDF format
    const tdfParticipants: TournamentParticipant[] = (participants || []).map(p => ({
      id: p.id,
      player_name: p.player_name,
      player_id: p.player_id,
      player_birthdate: p.player_birthdate,
      registration_date: p.registration_date,
      tdf_userid: p.tdf_userid
    }));

    // Generate TDF
    const tdfType = mapTournamentTypeToTDF(tournament.tournament_type);
    const organizerName = tournament.organizer_name || 'Tournament Organizer';
    const organizerPopid = tournament.organizer_popid || generateOrganizerPOPID();

    const tournamentData = {
      name: tournament.name,
      id: tournament.official_tournament_id || tournament.id.substring(0, 8),
      city: tournament.city,
      state: tournament.state,
      country: tournament.country,
      startDate: tournament.start_date,
      organizer: {
        name: organizerName,
        popid: organizerPopid
      },
      tournamentType: tdfType.gametype,
      mode: tdfType.mode
    };

    const generatedTDF = TDFGenerator.generateFromScratch(tournamentData, tdfParticipants);

    // Validate generated TDF
    const validation = TDFGenerator.validateGeneratedTDF(generatedTDF.xmlContent);

    // Return test results
    return NextResponse.json({
      success: true,
      tournament: {
        name: tournament.name,
        id: tournament.id,
        type: tournament.tournament_type,
        participantCount: tdfParticipants.length
      },
      tdf: {
        playerCount: generatedTDF.playerCount,
        generatedAt: generatedTDF.generatedAt,
        metadata: generatedTDF.metadata,
        validation: validation,
        xmlPreview: generatedTDF.xmlContent.substring(0, 500) + '...'
      },
      participants: tdfParticipants.map(p => ({
        name: p.player_name,
        tdf_userid: p.tdf_userid,
        registration_date: p.registration_date
      }))
    });

  } catch (error) {
    console.error('TDF test error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}