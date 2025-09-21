import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { TDFUtils } from '@/lib/tdf';

// Validation schema for player registration
const registrationSchema = z.object({
  tournament_id: z.string().uuid(),
  player_name: z.string().min(2, 'Player name must be at least 2 characters'),
  player_id: z.string().optional(),
  player_birthdate: z.string().datetime(),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(9, 'Phone number must be at least 9 characters'),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  registration_source: z.string().default('web')
});

// POST /api/tournaments/[id]/register - Register player for tournament
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: tournamentId } = await params;

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Check if registration is open
    if (!tournament.registration_open) {
      return NextResponse.json(
        { error: 'Registration is closed for this tournament' },
        { status: 400 }
      );
    }

    // Check if tournament is upcoming
    if (tournament.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Registration is only available for upcoming tournaments' },
        { status: 400 }
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
    
    // Check for duplicate registration by email
    const { data: existingRegistration } = await supabase
      .from('tournament_participants')
      .select('id, status')
      .eq('tournament_id', tournamentId)
      .eq('email', validatedData.email)
      .single();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Player already registered', details: 'A player with this email is already registered' },
        { status: 409 }
      );
    }

    // Check for duplicate by player name (case insensitive)
    const { data: nameCheck } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('tournament_id', tournamentId)
      .ilike('player_name', validatedData.player_name)
      .single();

    if (nameCheck) {
      return NextResponse.json(
        { error: 'Player already registered', details: 'A player with this name is already registered' },
        { status: 409 }
      );
    }

    // Generate TDF user ID for the player
    const tdfUserId = TDFUtils.generatePlayerID();

    // Prepare participant data
    const participantData = {
      tournament_id: tournamentId,
      user_id: null, // Anonymous registration
      player_name: validatedData.player_name,
      player_id: validatedData.player_id || null,
      player_birthdate: validatedData.player_birthdate,
      email: validatedData.email,
      phone: validatedData.phone,
      emergency_contact: validatedData.emergency_contact || null,
      emergency_phone: validatedData.emergency_phone || null,
      registration_source: validatedData.registration_source,
      tdf_userid: tdfUserId,
      status: isFull ? 'waitlist' : 'registered',
      registration_date: new Date().toISOString()
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

    // Send confirmation email (TODO: implement email service)
    // await sendRegistrationConfirmationEmail(participant, tournament);

    return NextResponse.json({
      participant,
      status: isFull ? 'waitlist' : 'registered',
      message: isFull 
        ? 'Tournament is full. You have been added to the waitlist.'
        : 'Registration successful! You will receive a confirmation email shortly.'
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