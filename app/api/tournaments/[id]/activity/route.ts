import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tournaments/[id]/activity - Get tournament activity feed
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId } = await params;

    // Check if tournament exists
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Get recent participant activities
    const { data: participantActivities, error: participantError } = await supabase
      .from('tournament_participants')
      .select(`
        id,
        player_name,
        status,
        registration_date
      `)
      .eq('tournament_id', tournamentId)
      .order('registration_date', { ascending: false })
      .limit(50);

    if (participantError) {
      console.error('Error fetching participant activities:', participantError);
    }

    // Transform participant data into activity feed
    const activities = (participantActivities || []).map(participant => {
      // Since we don't have created_at/updated_at, we'll treat all as registrations
      // and use registration_date as the timestamp
      return {
        id: `registration-${participant.id}`,
        type: 'registration',
        description: `${participant.player_name} registered for the tournament`,
        timestamp: participant.registration_date,
        player_name: participant.player_name,
        details: {
          status: participant.status,
          participant_id: participant.id
        }
      };
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      tournament_id: tournamentId,
      tournament_name: tournament.name,
      activities: activities.slice(0, 20) // Limit to 20 most recent activities
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error fetching tournament activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}