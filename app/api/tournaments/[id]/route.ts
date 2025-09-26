import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ErrorCodes } from '@/lib/types/tournament';
import {
  withErrorHandling,
  generateRequestId,
  handleSupabaseError,
  validateAuthentication,
  validateTournamentOwnership,
  createErrorResponse
} from '@/lib/utils/api-error-handler';
import {
  createTournamentResponse,
  createTournamentWithCapacityResponse
} from '@/lib/utils/api-response-formatter';

// GET /api/tournaments/[id] - Get tournament details
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { id } = await params;

  // Validate tournament ID format
  if (!id || id.length === 0) {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'ID de torneo requerido',
      undefined,
      'id',
      requestId
    );
  }

  // Get tournament details
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return handleSupabaseError(error, 'búsqueda de torneo', requestId);
  }

  if (!tournament) {
    return createErrorResponse(
      ErrorCodes.NOT_FOUND,
      'Torneo no encontrado',
      undefined,
      undefined,
      requestId
    );
  }

  // For now, allow anyone to view tournament details
  // In the future, we might want to restrict access to private tournaments
  
  return createTournamentWithCapacityResponse(
    tournament,
    'Torneo obtenido exitosamente',
    200,
    requestId
  );
});

// PUT /api/tournaments/[id] - Update tournament
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { id } = await params;

  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  // Validate tournament ownership
  const ownershipResult = await validateTournamentOwnership(supabase, id, user.id as string, requestId);
  if (ownershipResult instanceof NextResponse) {
    return ownershipResult;
  }

  // Parse and validate request body
  const body = await request.json();
  
  // Remove fields that shouldn't be updated directly
  const { 
    id: _id, 
    organizer_id: _organizer_id, 
    created_at: _created_at, 
    current_players: _current_players, // This should be managed by the system
    ...updateData 
  } = body;
  
  // Add updated timestamp
  const finalUpdateData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  // Update tournament
  const { data: updatedTournament, error: updateError } = await supabase
    .from('tournaments')
    .update(finalUpdateData)
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
    return handleSupabaseError(updateError, 'actualización de torneo', requestId);
  }

  return createTournamentResponse(
    updatedTournament,
    'Torneo actualizado exitosamente',
    200,
    requestId
  );
});

// DELETE /api/tournaments/[id] - Delete tournament
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { id } = await params;

  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  // Get tournament to check ownership and status
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('organizer_id, status, name')
    .eq('id', id)
    .single();

  if (tournamentError) {
    return handleSupabaseError(tournamentError, 'búsqueda de torneo', requestId);
  }

  if (!tournament) {
    return createErrorResponse(
      ErrorCodes.NOT_FOUND,
      'Torneo no encontrado',
      undefined,
      undefined,
      requestId
    );
  }

  // Check if user is the organizer
  if (tournament.organizer_id !== user.id) {
    return createErrorResponse(
      ErrorCodes.FORBIDDEN,
      'Solo el organizador del torneo puede eliminarlo',
      undefined,
      undefined,
      requestId
    );
  }

  // Prevent deletion of ongoing or completed tournaments
  if (tournament.status === 'ongoing' || tournament.status === 'completed') {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'No se pueden eliminar torneos en curso o completados',
      { current_status: tournament.status },
      'status',
      requestId
    );
  }

  // Delete tournament (this will cascade to related records)
  const { error: deleteError } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return handleSupabaseError(deleteError, 'eliminación de torneo', requestId);
  }

  return NextResponse.json({
    data: { deleted: true, tournament_name: tournament.name },
    message: 'Torneo eliminado exitosamente',
    timestamp: new Date().toISOString(),
    request_id: requestId
  });
});