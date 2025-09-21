// API Response Formatting Utilities
// Provides consistent response formatting and data validation for API routes

import { NextResponse } from 'next/server';
import { Tournament, TournamentWithOrganizer, TournamentType, TournamentStatus } from '@/lib/types/tournament';
import { getCapacityInfo } from './tournament';

// Standard API response interfaces
export interface APIResponse<T = unknown> {
  data: T;
  message?: string;
  timestamp: string;
  request_id?: string;
}

export interface PaginatedAPIResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
  message?: string;
  timestamp: string;
  request_id?: string;
}

export interface SearchAPIResponse<T = unknown> {
  data: T[];
  total: number;
  hasMore: boolean;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
  metadata?: {
    search_time: number;
    results_ranked: boolean;
    query_complexity: 'simple' | 'moderate' | 'complex';
  };
  timestamp: string;
  request_id?: string;
}

/**
 * Formats tournament data with consistent field formatting
 */
export function formatTournamentResponse(tournament: Tournament): Tournament {
  return {
    id: tournament.id as string,
    official_tournament_id: tournament.official_tournament_id as string,
    name: tournament.name as string,
    tournament_type: tournament.tournament_type as TournamentType,
    city: tournament.city as string,
    country: tournament.country as string,
    state: tournament.state as string || undefined,
    start_date: tournament.start_date as string,
    end_date: tournament.end_date as string || undefined,
    status: tournament.status as TournamentStatus,
    organizer_id: tournament.organizer_id as string,
    max_players: tournament.max_players as number || undefined,
    current_players: tournament.current_players as number || 0,
    registration_open: tournament.registration_open as boolean || false,
    description: tournament.description as string || undefined,
    created_at: tournament.created_at as string,
    updated_at: tournament.updated_at as string
  };
}

/**
 * Formats tournament with organizer data
 */
export function formatTournamentWithOrganizerResponse(tournament: TournamentWithOrganizer): TournamentWithOrganizer {
  const baseTournament = formatTournamentResponse(tournament);
  
  return {
    ...baseTournament,
    organizer: {
      first_name: tournament.organizer?.first_name || '',
      last_name: tournament.organizer?.last_name || '',
      organization_name: tournament.organizer?.organization_name || undefined
    }
  };
}

/**
 * Formats participant data with consistent field formatting
 */
export function formatParticipantResponse(participant: Record<string, unknown>) {
  return {
    id: participant.id,
    tournament_id: participant.tournament_id,
    user_id: participant.user_id, // Always required now
    player_name: participant.player_name,
    player_id: participant.player_id, // Always required - TDF always provides this
    player_birthdate: participant.player_birthdate, // Always required - TDF always provides this
    email: participant.email || null,
    phone: participant.phone || null,
    emergency_contact: participant.emergency_contact || null,
    emergency_phone: participant.emergency_phone || null,
    registration_date: participant.registration_date,
    registration_source: participant.registration_source || 'web',
    status: participant.status,
    tdf_userid: participant.tdf_userid || null,
    created_at: participant.created_at,
    updated_at: participant.updated_at
  };
}

/**
 * Formats file data with consistent field formatting
 */
export function formatFileResponse(file: Record<string, unknown>) {
  return {
    id: file.id,
    tournament_id: file.tournament_id,
    file_name: file.file_name,
    file_path: file.file_path,
    file_type: file.file_type,
    file_size: file.file_size || null,
    uploaded_by: file.uploaded_by,
    created_at: file.created_at
  };
}

/**
 * Creates a standard success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200,
  requestId?: string
): NextResponse<APIResponse<T>> {
  const response: APIResponse<T> = {
    data,
    timestamp: new Date().toISOString(),
    ...(message && { message }),
    ...(requestId && { request_id: requestId })
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Creates a paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message?: string,
  requestId?: string
): NextResponse<PaginatedAPIResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  const response: PaginatedAPIResponse<T> = {
    data: items,
    pagination: {
      page,
      limit,
      total,
      hasMore,
      totalPages
    },
    timestamp: new Date().toISOString(),
    ...(message && { message }),
    ...(requestId && { request_id: requestId })
  };

  return NextResponse.json(response);
}

/**
 * Creates a search response with metadata
 */
export function createSearchResponse<T>(
  items: T[],
  total: number,
  searchParams: {
    page?: number;
    limit?: number;
    query?: string;
  },
  metadata?: {
    search_time: number;
    results_ranked: boolean;
    query_complexity: 'simple' | 'moderate' | 'complex';
  },
  message?: string,
  requestId?: string
): NextResponse<SearchAPIResponse<T>> {
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  const response: SearchAPIResponse<T> = {
    data: items,
    total,
    hasMore,
    timestamp: new Date().toISOString(),
    ...(page && limit && {
      pagination: {
        page,
        limit,
        totalPages
      }
    }),
    ...(metadata && { metadata }),
    ...(message && { message }),
    ...(requestId && { request_id: requestId })
  };

  return NextResponse.json(response);
}

/**
 * Creates a tournament list response with formatted data
 */
export function createTournamentListResponse(
  tournaments: TournamentWithOrganizer[],
  total?: number,
  page?: number,
  limit?: number,
  message?: string,
  requestId?: string
): NextResponse {
  const formattedTournaments = tournaments.map(tournament => {
    if (tournament.organizer) {
      return formatTournamentWithOrganizerResponse(tournament);
    }
    return formatTournamentResponse(tournament);
  });

  if (total !== undefined && page !== undefined && limit !== undefined) {
    return createPaginatedResponse(
      formattedTournaments,
      total,
      page,
      limit,
      message,
      requestId
    );
  }

  return createSuccessResponse(
    formattedTournaments,
    message,
    200,
    requestId
  );
}

/**
 * Creates a single tournament response with formatted data
 */
export function createTournamentResponse(
  tournament: TournamentWithOrganizer,
  message?: string,
  statusCode: number = 200,
  requestId?: string
): NextResponse {
  const formattedTournament = tournament.organizer
    ? formatTournamentWithOrganizerResponse(tournament)
    : formatTournamentResponse(tournament);

  return createSuccessResponse(
    formattedTournament,
    message,
    statusCode,
    requestId
  );
}

/**
 * Creates a participant list response with formatted data
 */
export function createParticipantListResponse(
  participants: Record<string, unknown>[],
  total?: number,
  page?: number,
  limit?: number,
  message?: string,
  requestId?: string
): NextResponse {
  const formattedParticipants = participants.map(formatParticipantResponse);

  if (total !== undefined && page !== undefined && limit !== undefined) {
    return createPaginatedResponse(
      formattedParticipants,
      total,
      page,
      limit,
      message,
      requestId
    );
  }

  return createSuccessResponse(
    formattedParticipants,
    message,
    200,
    requestId
  );
}

/**
 * Creates a single participant response with formatted data
 */
export function createParticipantResponse(
  participant: Record<string, unknown>,
  message?: string,
  statusCode: number = 200,
  requestId?: string
): NextResponse {
  const formattedParticipant = formatParticipantResponse(participant);

  return createSuccessResponse(
    formattedParticipant,
    message,
    statusCode,
    requestId
  );
}

/**
 * Creates a file upload response with formatted data
 */
export function createFileResponse(
  file: Record<string, unknown>,
  message?: string,
  statusCode: number = 200,
  requestId?: string
): NextResponse {
  const formattedFile = formatFileResponse(file);

  return createSuccessResponse(
    formattedFile,
    message,
    statusCode,
    requestId
  );
}

/**
 * Validates and formats query parameters for pagination
 */
export function validatePaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Validates and formats search parameters
 */
export function validateSearchParams(searchParams: URLSearchParams): {
  query?: string;
  city?: string;
  country?: string;
  tournament_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  organizer_id?: string;
} {
  return {
    query: searchParams.get('query') || undefined,
    city: searchParams.get('city') || undefined,
    country: searchParams.get('country') || undefined,
    tournament_type: searchParams.get('tournament_type') || undefined,
    status: searchParams.get('status') || undefined,
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
    organizer_id: searchParams.get('organizer_id') || undefined
  };
}

/**
 * Sanitizes and validates string inputs
 */
export function sanitizeString(input: string | null | undefined, maxLength: number = 255): string | undefined {
  if (!input || typeof input !== 'string') {
    return undefined;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed.substring(0, maxLength);
}

/**
 * Validates UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates date format (ISO 8601)
 */
export function isValidISODate(date: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoDateRegex.test(date)) {
    return false;
  }
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}



/**
 * Creates a response with tournament capacity information
 */
export function createTournamentWithCapacityResponse(
  tournament: TournamentWithOrganizer,
  message?: string,
  statusCode: number = 200,
  requestId?: string
): NextResponse {
  const formattedTournament = tournament.organizer_id
    ? formatTournamentWithOrganizerResponse(tournament)
    : formatTournamentResponse(tournament);

  const capacity = getCapacityInfo(tournament);

  return createSuccessResponse(
    {
      ...formattedTournament,
      capacity
    },
    message,
    statusCode,
    requestId
  );
}