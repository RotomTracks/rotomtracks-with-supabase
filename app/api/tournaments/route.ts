import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TournamentType, CreateTournamentRequest, ErrorCodes } from '@/lib/types/tournament';
import { z } from 'zod';
import {
  withErrorHandling,
  generateRequestId,
  handleValidationError,
  handleSupabaseError,
  handleAuthError,
  handleForbiddenError,
  createErrorResponse,
  validateAuthentication,
  validateUserRole
} from '@/lib/utils/api-error-handler';
import {
  createTournamentListResponse,
  createTournamentResponse,
  validatePaginationParams,
  validateSearchParams
} from '@/lib/utils/api-response-formatter';

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
export const GET = withErrorHandling(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  // Validate and format pagination parameters
  const { page, limit, offset } = validatePaginationParams(searchParams);
  
  // Validate and format search parameters
  const searchFilters = validateSearchParams(searchParams);

  // Build query with consistent field selection
  let query = supabase
    .from('tournaments')
    .select(`
      *,
      organizer:user_profiles!tournaments_organizer_id_fkey(
        first_name,
        last_name,
        organization_name
      )
    `, { count: 'exact' })
    .order('start_date', { ascending: false });

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
export const POST = withErrorHandling(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  
  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  // Validate user role
  const roleResult = await validateUserRole(supabase, user.id as string, 'organizer', requestId);
  if (roleResult instanceof NextResponse) {
    return roleResult;
  }

  // Parse and validate request body
  const body = await request.json();
  let validatedData: z.infer<typeof createTournamentSchema>;
  
  try {
    validatedData = createTournamentSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, requestId);
    }
    throw error;
  }

  // Check for duplicate official tournament ID
  const { data: existingTournament, error: duplicateError } = await supabase
    .from('tournaments')
    .select('id')
    .eq('official_tournament_id', validatedData.official_tournament_id)
    .single();

  if (duplicateError && duplicateError.code !== 'PGRST116') {
    return handleSupabaseError(duplicateError, 'verificación de duplicados', requestId);
  }

  if (existingTournament) {
    return createErrorResponse(
      ErrorCodes.DUPLICATE_TOURNAMENT_ID,
      'Ya existe un torneo con este ID oficial',
      undefined,
      'official_tournament_id',
      requestId
    );
  }

  // Create tournament with consistent data structure
  const tournamentData = {
    ...validatedData,
    organizer_id: user.id,
    status: 'upcoming',
    current_players: 0,
    registration_open: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    return handleSupabaseError(createError, 'creación de torneo', requestId);
  }

  return createTournamentResponse(
    tournament,
    'Torneo creado exitosamente',
    201,
    requestId
  );
});