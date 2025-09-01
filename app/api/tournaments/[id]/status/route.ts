import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const;
type TournamentStatus = typeof VALID_STATUSES[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Debes iniciar sesión para actualizar el estado' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;
    
    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: `Estado inválido. Estados válidos: ${VALID_STATUSES.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Verify tournament exists and user has permission
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, organizer_id, name, status, current_players')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Check if user is the organizer
    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Solo el organizador puede actualizar el estado del torneo' },
        { status: 403 }
      );
    }

    // Validate status transition
    const currentStatus = tournament.status;
    const newStatus = status as TournamentStatus;

    // Define valid status transitions
    const validTransitions: Record<string, TournamentStatus[]> = {
      'upcoming': ['ongoing', 'cancelled'],
      'ongoing': ['completed', 'cancelled'],
      'completed': [], // Completed tournaments cannot change status
      'cancelled': ['upcoming'] // Cancelled tournaments can be reactivated
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: `No se puede cambiar de "${currentStatus}" a "${newStatus}"` 
        },
        { status: 400 }
      );
    }

    // Additional validations based on status
    if (newStatus === 'ongoing' && tournament.current_players === 0) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'No se puede iniciar un torneo sin participantes' 
        },
        { status: 400 }
      );
    }

    // Update tournament status
    const { data: updatedTournament, error: updateError } = await supabase
      .from('tournaments')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Database Error', message: 'Error al actualizar el estado del torneo' },
        { status: 500 }
      );
    }

    // Log status change
    await supabase
      .from('tournament_status_history')
      .insert({
        tournament_id: tournamentId,
        previous_status: currentStatus,
        new_status: newStatus,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
        notes: `Estado cambiado de ${currentStatus} a ${newStatus}`
      });

    return NextResponse.json({
      success: true,
      message: `Estado del torneo actualizado a "${newStatus}"`,
      data: {
        tournament: updatedTournament,
        previousStatus: currentStatus,
        newStatus: newStatus
      }
    });

  } catch (error) {
    console.error('Tournament status update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Get tournament status and related information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { id: tournamentId } = await params;
    
    // Get tournament with related data
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        status,
        current_players,
        start_date,
        end_date,
        updated_at,
        tournament_participants(count),
        tournament_matches(count),
        tournament_results(count)
      `)
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Torneo no encontrado' },
        { status: 404 }
      );
    }

    // Get status history
    const { data: statusHistory } = await supabase
      .from('tournament_status_history')
      .select(`
        previous_status,
        new_status,
        changed_at,
        notes,
        user_profiles!tournament_status_history_changed_by_fkey(
          first_name,
          last_name
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('changed_at', { ascending: false })
      .limit(10);

    // Calculate tournament progress
    const participantCount = tournament.tournament_participants?.[0]?.count || 0;
    const matchCount = tournament.tournament_matches?.[0]?.count || 0;
    const resultCount = tournament.tournament_results?.[0]?.count || 0;

    let progress = 0;
    if (tournament.status === 'upcoming') {
      progress = participantCount > 0 ? 25 : 0;
    } else if (tournament.status === 'ongoing') {
      progress = 25 + (matchCount > 0 ? 50 : 0);
    } else if (tournament.status === 'completed') {
      progress = 100;
    }

    // Determine next possible actions
    const validTransitions: Record<string, TournamentStatus[]> = {
      'upcoming': ['ongoing', 'cancelled'],
      'ongoing': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': ['upcoming']
    };

    const nextActions = validTransitions[tournament.status] || [];

    return NextResponse.json({
      success: true,
      data: {
        tournament: {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status,
          current_players: tournament.current_players,
          start_date: tournament.start_date,
          end_date: tournament.end_date,
          updated_at: tournament.updated_at,
        },
        stats: {
          participants: participantCount,
          matches: matchCount,
          results: resultCount,
          progress: progress
        },
        statusHistory: statusHistory || [],
        nextActions: nextActions,
        validStatuses: VALID_STATUSES
      }
    });

  } catch (error) {
    console.error('Get tournament status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}