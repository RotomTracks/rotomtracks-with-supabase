import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TournamentType, TournamentStatus } from '@/lib/types/tournament';
import {
  withErrorHandling,
  generateRequestId,
  handleSupabaseError
} from '@/lib/utils/api-error-handler';
import {
  createTournamentListResponse,
  validatePaginationParams,
  validateSearchParams
} from '@/lib/utils/api-response-formatter';

// GET /api/tournaments - List tournaments with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  // Validate and format pagination parameters
  const { page, limit, offset } = validatePaginationParams(searchParams);
  
  // Validate and format search parameters
  const searchFilters = validateSearchParams(searchParams);
  
  // Get sort parameter
  const sortOrder = searchParams.get('sort') === 'asc' ? 'asc' : 'desc';

  // Build query with consistent field selection
  let query = supabase
    .from('tournaments')
    .select('*', { count: 'exact' })
    .order('start_date', { ascending: sortOrder === 'asc' });

  // Apply filters with proper validation
  if (searchFilters.query) {
    const searchTerm = searchFilters.query.trim();
    if (searchTerm.length >= 2) {
      query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`);
    }
  }
  
  if (searchFilters.city) {
    query = query.eq('city', searchFilters.city);
  }
  
  if (searchFilters.country) {
    query = query.eq('country', searchFilters.country);
  }
  
  if (searchFilters.tournament_type) {
    query = query.eq('tournament_type', searchFilters.tournament_type);
  }
  
  if (searchFilters.status) {
    query = query.eq('status', searchFilters.status);
  }
  
  if (searchFilters.date_from) {
    query = query.gte('start_date', searchFilters.date_from);
  }
  
  if (searchFilters.date_to) {
    query = query.lte('start_date', searchFilters.date_to);
  }

  if (searchFilters.organizer_id) {
    query = query.eq('organizer_id', searchFilters.organizer_id);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: tournaments, error, count } = await query;

  if (error) {
    return handleSupabaseError(error, 'búsqueda de torneos', requestId);
  }

  return createTournamentListResponse(
    tournaments || [],
    count || 0,
    page,
    limit,
    'Torneos obtenidos exitosamente',
    requestId
  );
});

// POST /api/tournaments - Create a new tournament
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.tournament_type || !body.official_tournament_id || !body.city || !body.country || !body.start_date) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for duplicate official tournament ID
    const { data: existingTournament, error: duplicateError } = await supabase
      .from('tournaments')
      .select('id')
      .eq('official_tournament_id', body.official_tournament_id)
      .single();

    if (duplicateError && duplicateError.code !== 'PGRST116') {
      console.error('Duplicate check error:', duplicateError);
      return NextResponse.json(
        { error: 'Database error', message: duplicateError.message },
        { status: 500 }
      );
    }

    if (existingTournament) {
      return NextResponse.json(
        { error: 'Duplicate tournament ID', message: 'Ya existe un torneo con este ID oficial' },
        { status: 400 }
      );
    }

    // Create tournament data
    const tournamentData = {
      name: body.name,
      tournament_type: body.tournament_type,
      official_tournament_id: body.official_tournament_id,
      city: body.city,
      country: body.country,
      state: body.state || null,
      start_date: body.start_date,
      max_players: body.max_players || null,
      description: body.description || null,
      organizer_id: user.id,
      status: TournamentStatus.UPCOMING,
      current_players: 0,
      registration_open: true
    };

    // Insert tournament
    const { data: tournament, error: createError } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select('*')
      .single();

    if (createError) {
      console.error('Database error:', createError);
      return NextResponse.json(
        { error: 'Database error', message: createError.message },
        { status: 500 }
      );
    }

    // Get organizer information separately
    const { data: organizerProfile, error: organizerError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, organization_name')
      .eq('user_id', tournament.organizer_id)
      .single();

    if (organizerError && organizerError.code !== 'PGRST116') {
      console.warn('Organizer profile not found:', organizerError);
    }

    // Add organizer information to tournament response
    const tournamentWithOrganizer = {
      ...tournament,
      organizer: organizerProfile || {
        first_name: null,
        last_name: null,
        organization_name: null
      }
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Torneo creado exitosamente',
        tournament: tournamentWithOrganizer
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}