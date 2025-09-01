import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TournamentType } from '@/lib/types/tournament';
import { z } from 'zod';

// Validation schema for tournament updates
const updateTournamentSchema = z.object({
  name: z.string().min(1).optional(),
  tournament_type: z.nativeEnum(TournamentType).optional(),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  state: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  max_players: z.number().positive().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
  registration_open: z.boolean().optional(),
  description: z.string().optional(),
});

// GET /api/tournaments/[id] - Get tournament details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch tournament with related data
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name,
          profile_image_url
        ),
        tournament_participants(
          id,
          user_id,
          player_name,
          player_id,
          registration_date,
          status,
          user_profiles(
            first_name,
            last_name,
            profile_image_url
          )
        ),
        tournament_results(
          id,
          participant_id,
          wins,
          losses,
          draws,
          byes,
          final_standing,
          points,
          tournament_participants(
            player_name,
            player_id
          )
        ),
        tournament_matches(
          id,
          round_number,
          table_number,
          outcome,
          match_status,
          player1:tournament_participants!tournament_matches_player1_id_fkey(
            player_name,
            player_id
          ),
          player2:tournament_participants!tournament_matches_player2_id_fkey(
            player_name,
            player_id
          )
        ),
        tournament_files(
          id,
          file_name,
          file_type,
          file_size,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Tournament not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching tournament:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tournament', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ tournament });

  } catch (error) {
    console.error('Unexpected error in GET /api/tournaments/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tournaments/[id] - Update tournament
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if tournament exists and user is the organizer
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Tournament not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch tournament' },
        { status: 500 }
      );
    }

    // Check if user is the organizer
    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the tournament organizer can update this tournament' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateTournamentSchema.parse(body);

    // Update tournament
    const { data: updatedTournament, error: updateError } = await supabase
      .from('tournaments')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating tournament:', updateError);
      return NextResponse.json(
        { error: 'Failed to update tournament', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tournament: updatedTournament,
      message: 'Tournament updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Unexpected error in PUT /api/tournaments/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tournaments/[id] - Delete tournament
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if tournament exists and user is the organizer
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('organizer_id, status, current_players')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Tournament not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch tournament' },
        { status: 500 }
      );
    }

    // Check if user is the organizer
    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the tournament organizer can delete this tournament' },
        { status: 403 }
      );
    }

    // Check if tournament can be deleted (no participants or not started)
    if (tournament.current_players > 0 && tournament.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Cannot delete tournament with participants that has already started' },
        { status: 400 }
      );
    }

    // Delete tournament (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting tournament:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete tournament', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Tournament deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/tournaments/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}