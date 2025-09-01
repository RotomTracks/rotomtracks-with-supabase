import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TournamentType, CreateTournamentRequest } from '@/lib/types/tournament';
import { z } from 'zod';

// Validation schema for tournament creation
const createTournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
  tournament_type: z.nativeEnum(TournamentType),
  official_tournament_id: z.string().min(1, 'Official tournament ID is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  max_players: z.number().positive().optional(),
  description: z.string().optional(),
});

// GET /api/tournaments - List tournaments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = (page - 1) * limit;
    
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const tournament_type = searchParams.get('tournament_type');
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('tournaments')
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name
        )
      `)
      .order('start_date', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,country.ilike.%${search}%`);
    }
    
    if (city) {
      query = query.eq('city', city);
    }
    
    if (country) {
      query = query.eq('country', country);
    }
    
    if (tournament_type) {
      query = query.eq('tournament_type', tournament_type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (date_from) {
      query = query.gte('start_date', date_from);
    }
    
    if (date_to) {
      query = query.lte('start_date', date_to);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tournaments, error, count } = await query;

    if (error) {
      console.error('Error fetching tournaments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tournaments', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tournaments: tournaments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/tournaments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tournaments - Create a new tournament
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user is an organizer
    if (profile.user_role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only organizers can create tournaments' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTournamentSchema.parse(body);

    // Check for duplicate official tournament ID
    const { data: existingTournament, error: duplicateError } = await supabase
      .from('tournaments')
      .select('id')
      .eq('official_tournament_id', validatedData.official_tournament_id)
      .single();

    if (existingTournament) {
      return NextResponse.json(
        { error: 'Tournament with this official ID already exists' },
        { status: 409 }
      );
    }

    // Create tournament
    const tournamentData = {
      ...validatedData,
      organizer_id: user.id,
      status: 'upcoming',
      current_players: 0,
      registration_open: true,
    };

    const { data: tournament, error: createError } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name
        )
      `)
      .single();

    if (createError) {
      console.error('Error creating tournament:', createError);
      return NextResponse.json(
        { error: 'Failed to create tournament', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { tournament, message: 'Tournament created successfully' },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/tournaments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}