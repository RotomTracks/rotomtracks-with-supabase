import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;

    // Get participants for the tournament
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select(`
        id,
        user_id,
        player_name,
        player_id,
        player_birthdate,
        registration_date,
        status
      `)
      .eq('tournament_id', tournamentId)
      .order('registration_date', { ascending: true });

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      participants: participants || []
    });

  } catch (error) {
    console.error('Error in participants API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
