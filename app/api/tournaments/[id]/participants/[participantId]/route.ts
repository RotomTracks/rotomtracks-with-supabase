import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for participant updates
const updateParticipantSchema = z.object({
  status: z.enum(['registered', 'confirmed', 'waitlist', 'dropped']).optional(),
  player_name: z.string().min(2).optional(),
  player_id: z.string().optional(),
  player_birthdate: z.string().datetime().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
});

// PATCH /api/tournaments/[id]/participants/[participantId] - Update participant
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId, participantId } = await params;

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
      .select('id, organizer_id, max_players, current_players')
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
        { error: 'Only tournament organizers can manage participants' },
        { status: 403 }
      );
    }

    // Get current participant
    const { data: participant, error: participantError } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('id', participantId)
      .eq('tournament_id', tournamentId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateParticipantSchema.parse(body);

    // Handle status changes with capacity checks
    if (validatedData.status && validatedData.status !== participant.status) {
      const oldStatus = participant.status;
      const newStatus = validatedData.status;

      // Check capacity when moving from waitlist to registered/confirmed
      if ((oldStatus === 'waitlist') && (newStatus === 'registered' || newStatus === 'confirmed')) {
        if (tournament.max_players && tournament.current_players >= tournament.max_players) {
          return NextResponse.json(
            { error: 'Tournament is at capacity. Cannot move participant from waitlist.' },
            { status: 400 }
          );
        }
      }
    }

    // Update participant
    const { data: updatedParticipant, error: updateError } = await supabase
      .from('tournament_participants')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId)
      .eq('tournament_id', tournamentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating participant:', updateError);
      return NextResponse.json(
        { error: 'Failed to update participant', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      participant: updatedParticipant,
      message: 'Participant updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error in participant update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tournaments/[id]/participants/[participantId] - Remove participant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId, participantId } = await params;

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
      .select('id, organizer_id')
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
        { error: 'Only tournament organizers can remove participants' },
        { status: 403 }
      );
    }

    // Check if participant exists
    const { data: participant, error: participantError } = await supabase
      .from('tournament_participants')
      .select('id, player_name, status')
      .eq('id', participantId)
      .eq('tournament_id', tournamentId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Remove participant
    const { error: deleteError } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('id', participantId)
      .eq('tournament_id', tournamentId);

    if (deleteError) {
      console.error('Error removing participant:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove participant', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Participant ${participant.player_name} removed successfully`
    });

  } catch (error) {
    console.error('Unexpected error in participant removal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/tournaments/[id]/participants/[participantId] - Get participant details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId, participantId } = await params;

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
      .select('id, organizer_id')
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
        { error: 'Only tournament organizers can view participant details' },
        { status: 403 }
      );
    }

    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('id', participantId)
      .eq('tournament_id', tournamentId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ participant });

  } catch (error) {
    console.error('Unexpected error in participant fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}