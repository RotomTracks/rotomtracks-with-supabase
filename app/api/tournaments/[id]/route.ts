import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tournaments/[id] - Get tournament details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get tournament details with organizer information
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name
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

    // Check if user has permission to view this tournament
    const { data: { user } } = await supabase.auth.getUser();
    
    // For now, allow anyone to view tournament details
    // In the future, we might want to restrict access to private tournaments
    
    return NextResponse.json({
      tournament,
      message: 'Tournament retrieved successfully'
    });

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

    // Get tournament to check ownership
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (tournamentError) {
      if (tournamentError.code === 'PGRST116') {
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
    
    // Remove fields that shouldn't be updated directly
    const { id: _, organizer_id, created_at, ...updateData } = body;
    
    // Update tournament
    const { data: updatedTournament, error: updateError } = await supabase
      .from('tournaments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
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

    // Get tournament to check ownership
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('organizer_id, status')
      .eq('id', id)
      .single();

    if (tournamentError) {
      if (tournamentError.code === 'PGRST116') {
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

    // Prevent deletion of ongoing or completed tournaments
    if (tournament.status === 'ongoing' || tournament.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete ongoing or completed tournaments' },
        { status: 400 }
      );
    }

    // Delete tournament (this will cascade to related records)
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