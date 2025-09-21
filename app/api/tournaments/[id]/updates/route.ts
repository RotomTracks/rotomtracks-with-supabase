import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tournaments/[id]/updates - Get real-time tournament updates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId } = await params;

    // Get tournament basic info
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        current_players,
        max_players,
        registration_open,
        status,
        updated_at
      `)
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Get recent registrations (last 10)
    const { data: recentRegistrations, error: registrationsError } = await supabase
      .from('tournament_participants')
      .select(`
        id,
        player_name,
        registration_date,
        status
      `)
      .eq('tournament_id', tournamentId)
      .order('registration_date', { ascending: false })
      .limit(10);

    if (registrationsError) {
      console.error('Error fetching recent registrations:', registrationsError);
    }

    // Prepare response data
    const updateData = {
      tournament_id: tournament.id,
      current_players: tournament.current_players,
      max_players: tournament.max_players,
      registration_open: tournament.registration_open,
      status: tournament.status,
      last_updated: tournament.updated_at,
      recent_registrations: recentRegistrations || []
    };

    return NextResponse.json(updateData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error fetching tournament updates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}