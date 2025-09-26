import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ErrorCodes } from '@/lib/types/tournament';
import {
  handleSupabaseError,
  createErrorResponse
} from '@/lib/utils/api-error-handler';

// Validation schema for player registration - simplified since user data comes from profile
const registrationSchema = z.object({
  tournament_id: z.string().uuid(),
  player_id: z.string().optional() // Optional override for player ID
});

// POST /api/tournaments/[id]/register - Register player for tournament
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId } = await params;

    // Check authentication - registration now requires an account
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Debes tener una cuenta para registrarte en torneos'
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, player_id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Perfil de usuario no encontrado. Completa tu perfil antes de registrarte.'
      );
    }

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError) {
      return handleSupabaseError(tournamentError, 'búsqueda de torneo');
    }

    if (!tournament) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Torneo no encontrado'
      );
    }

    // Check if registration is open
    if (!tournament.registration_open) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Las inscripciones están cerradas para este torneo',
        { tournament_status: tournament.status }
      );
    }

    // Check if tournament is upcoming
    if (tournament.status !== 'upcoming') {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Las inscripciones solo están disponibles para torneos próximos',
        { current_status: tournament.status }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = registrationSchema.parse({
      ...body,
      tournament_id: tournamentId
    });

    // Check if tournament is at capacity
    const isFull = tournament.max_players && tournament.current_players >= tournament.max_players;
    
    // Check for duplicate registration by user
    const { data: existingRegistration } = await supabase
      .from('tournament_participants')
      .select('id, status')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userProfile.id)
      .single();

    if (existingRegistration) {
      return createErrorResponse(
        ErrorCodes.DUPLICATE_REGISTRATION,
        'Ya estás registrado en este torneo',
        { user_id: userProfile.id },
        'user_id'
      );
    }

    // Prepare participant data using user profile information
    const participantData = {
      tournament_id: tournamentId,
      user_id: userProfile.id, // Always use authenticated user
      player_name: `${userProfile.first_name} ${userProfile.last_name}`.trim(),
      player_id: userProfile.player_id || validatedData.player_id, // Required field
      registration_date: new Date().toISOString(),
      status: isFull ? 'waitlist' : 'registered'
    };

    // Insert participant
    const { data: participant, error: insertError } = await supabase
      .from('tournament_participants')
      .insert([participantData])
      .select()
      .single();

    if (insertError) {
      console.error('Error registering participant:', insertError);
      return NextResponse.json(
        { error: 'Failed to register participant', details: insertError.message },
        { status: 500 }
      );
    }

    // Update tournament player count if not waitlisted
    if (!isFull) {
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ 
          current_players: tournament.current_players + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentId);

      if (updateError) {
        console.error('Error updating tournament player count:', updateError);
        // Don't fail the registration, just log the error
      }
    }

    // Send confirmation email
    try {
      const { emailService } = await import('@/lib/services/email');
      await emailService.sendRegistrationConfirmation({
        to: user.email!,
        participantName: participant.player_name || participant.email,
        tournamentName: tournament.name,
        tournamentDate: new Date(tournament.start_date).toLocaleDateString('es-ES'),
        tournamentLocation: tournament.location,
        registrationStatus: isFull ? 'waitlist' : 'registered',
        participantId: participant.id
      });
    } catch (emailError) {
      console.warn('Failed to send registration confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      data: {
        participant,
        status: isFull ? 'waitlist' : 'registered'
      },
      message: isFull 
        ? 'El torneo está lleno. Has sido añadido a la lista de espera.'
        : 'Inscripción exitosa. ¡Bienvenido al torneo!',
      timestamp: new Date().toISOString()
    }, { status: 201 });

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

    console.error('Unexpected error in tournament registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/tournaments/[id]/register - Get registration info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId } = await params;

    // Get tournament with registration info
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        tournament_type,
        city,
        country,
        start_date,
        status,
        current_players,
        max_players,
        registration_open,
        description
      `)
      .eq('id', tournamentId)
      .single();

    if (error || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Get registration statistics
    const { data: registrationStats } = await supabase
      .from('tournament_participants')
      .select('status')
      .eq('tournament_id', tournamentId);

    const stats = {
      total: registrationStats?.length || 0,
      registered: registrationStats?.filter(r => r.status === 'registered').length || 0,
      waitlist: registrationStats?.filter(r => r.status === 'waitlist').length || 0,
      confirmed: registrationStats?.filter(r => r.status === 'confirmed').length || 0
    };

    return NextResponse.json({
      tournament,
      registration_stats: stats,
      can_register: tournament.registration_open && tournament.status === 'upcoming'
    });

  } catch (error) {
    console.error('Error fetching registration info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}