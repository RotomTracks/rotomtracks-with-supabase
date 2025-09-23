import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandling, generateRequestId, handleSupabaseError, validateAuthentication } from '@/lib/utils/api-error-handler';

// GET /api/tournaments/user - Get user's tournaments (both organizing and participating)
export const GET = withErrorHandling(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const supabase = await createClient();

  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  try {
    console.log(`[${requestId}] Fetching tournaments for user: ${user.id}`);
    
    // Get tournaments the user organizes
    const { data: organizingTournaments, error: organizingError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('organizer_id', user.id)
      .order('start_date', { ascending: false });

    if (organizingError) {
      console.error(`[${requestId}] Error fetching organizing tournaments:`, organizingError);
      // If table doesn't exist or has issues, return empty data instead of error
      if (organizingError.code === 'PGRST116' || organizingError.message?.includes('relation') || organizingError.message?.includes('does not exist')) {
        console.log(`[${requestId}] Tournaments table not found, returning empty data`);
        const response = {
          success: true,
          data: {
            tournaments: [],
            organizing: [],
            participating: [],
            total: 0,
            organizing_count: 0,
            participating_count: 0
          },
          message: 'No tournaments found',
          request_id: requestId
        };
        return NextResponse.json(response, { status: 200 });
      }
      return handleSupabaseError(organizingError, 'búsqueda de torneos organizados', requestId);
    }

    console.log(`[${requestId}] Found ${organizingTournaments?.length || 0} organizing tournaments`);

    // Get tournaments the user participates in
    const { data: participatingTournaments, error: participatingError } = await supabase
      .from('tournament_participants')
      .select(`
        tournament:tournaments(*),
        status,
        registration_date
      `)
      .eq('user_id', user.id)
      .order('registration_date', { ascending: false });

    if (participatingError) {
      console.error(`[${requestId}] Error fetching participating tournaments:`, participatingError);
      // If table doesn't exist or has issues, continue with empty data
      if (participatingError.code === 'PGRST116' || participatingError.message?.includes('relation') || participatingError.message?.includes('does not exist')) {
        console.log(`[${requestId}] Tournament participants table not found, using empty data`);
      } else {
        return handleSupabaseError(participatingError, 'búsqueda de torneos participados', requestId);
      }
    }

    console.log(`[${requestId}] Found ${participatingTournaments?.length || 0} participating tournaments`);

    // Transform organizing tournaments
    const transformedOrganizing = (organizingTournaments || []).map(tournament => ({
      ...tournament,
      user_role: 'organizer' as const,
      registration_status: undefined,
      registration_date: undefined
    }));

    // Transform participating tournaments
    const transformedParticipating = (participatingTournaments || [])
      .filter(p => p.tournament) // Filter out null tournaments
      .map(participation => ({
        ...participation.tournament,
        user_role: 'participant' as const,
        registration_status: participation.status,
        registration_date: participation.registration_date
      }));

    // Combine all tournaments
    const allTournaments = [...transformedOrganizing, ...transformedParticipating];

    console.log(`[${requestId}] Returning ${allTournaments.length} total tournaments (${transformedOrganizing.length} organizing, ${transformedParticipating.length} participating)`);

    return NextResponse.json({
      success: true,
      data: {
        tournaments: allTournaments,
        organizing: transformedOrganizing,
        participating: transformedParticipating,
        total: allTournaments.length,
        organizing_count: transformedOrganizing.length,
        participating_count: transformedParticipating.length
      },
      message: 'User tournaments retrieved successfully',
      request_id: requestId
    });

  } catch (error) {
    console.error('Error fetching user tournaments:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to load user tournaments',
      request_id: requestId
    }, { status: 500 });
  }
});
