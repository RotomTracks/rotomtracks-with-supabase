/**
 * Search utility functions for tournament search API
 */

import { createClient } from '@/lib/supabase/server';
import { Tournament } from '@/lib/types/tournament';
import { SearchParams } from '@/lib/validations/search';

// Search suggestion types
export interface SearchSuggestion {
  id: string;
  name: string;
  category: 'tournament' | 'location' | 'type' | 'organizer';
  location?: string;
  type?: string;
  date?: string;
  status?: string;
  registration_open?: boolean;
}

// Search response metadata
export interface SearchMetadata {
  search_time: number;
  results_ranked: boolean;
  total_results: number;
  cache_hit?: boolean;
  query_complexity: 'simple' | 'moderate' | 'complex';
}

// Relevance scoring weights
const RELEVANCE_WEIGHTS = {
  EXACT_NAME_MATCH: 100,
  NAME_STARTS_WITH: 75,
  NAME_CONTAINS: 50,
  CITY_EXACT_MATCH: 40,
  CITY_STARTS_WITH: 25,
  CITY_CONTAINS: 15,
  COUNTRY_EXACT_MATCH: 30,
  COUNTRY_STARTS_WITH: 20,
  COUNTRY_CONTAINS: 10,
  TYPE_MATCH: 35,
  OFFICIAL_ID_MATCH: 60,
  UPCOMING_BOOST: 10,
  REGISTRATION_OPEN_BOOST: 5,
  AVAILABILITY_BOOST_MAX: 8,
  RECENT_TOURNAMENT_BOOST: 3
};

/**
 * Generate search suggestions for autocomplete
 */
export async function generateSearchSuggestions(
  query: string,
  limit: number = 10
): Promise<SearchSuggestion[]> {
  const supabase = await createClient();
  const queryLower = query.toLowerCase();

  try {
    // Search tournaments using full-text search
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('id, name, city, country, tournament_type, start_date, status, registration_open')
      .textSearch('search_vector', query, { type: 'websearch' })
      .in('status', ['upcoming', 'ongoing'])
      .order('start_date', { ascending: true })
      .limit(Math.min(limit, 8));

    // Get unique locations and types for additional suggestions
    const { data: locationData } = await supabase
      .from('tournaments')
      .select('city, country')
      .or(`city.ilike.%${query}%,country.ilike.%${query}%`)
      .in('status', ['upcoming', 'ongoing'])
      .limit(5);

    const { data: typeData } = await supabase
      .from('tournaments')
      .select('tournament_type')
      .ilike('tournament_type', `%${query}%`)
      .in('status', ['upcoming', 'ongoing'])
      .limit(3);

    const suggestions: SearchSuggestion[] = [];

    // Add tournament suggestions
    tournaments?.forEach(tournament => {
      suggestions.push({
        id: tournament.id,
        name: tournament.name,
        category: 'tournament',
        location: `${tournament.city}, ${tournament.country}`,
        type: tournament.tournament_type,
        date: tournament.start_date,
        status: tournament.status,
        registration_open: tournament.registration_open
      });
    });

    // Add unique location suggestions
    const uniqueLocations = new Set<string>();
    locationData?.forEach(item => {
      const location = `${item.city}, ${item.country}`;
      if (!uniqueLocations.has(location) && 
          location.toLowerCase().includes(queryLower)) {
        uniqueLocations.add(location);
        suggestions.push({
          id: `location-${location}`,
          name: location,
          category: 'location'
        });
      }
    });

    // Add tournament type suggestions
    const uniqueTypes = new Set<string>();
    typeData?.forEach(item => {
      if (!uniqueTypes.has(item.tournament_type) &&
          item.tournament_type.toLowerCase().includes(queryLower)) {
        uniqueTypes.add(item.tournament_type);
        suggestions.push({
          id: `type-${item.tournament_type}`,
          name: item.tournament_type,
          category: 'type'
        });
      }
    });

    return suggestions.slice(0, limit);

  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return [];
  }
}

/**
 * Calculate relevance score for a tournament based on search query
 */
export function calculateRelevanceScore(
  tournament: Tournament,
  query: string
): number {
  if (!query) return 0;

  let score = 0;
  const queryLower = query.toLowerCase();
  const nameLower = tournament.name.toLowerCase();
  const cityLower = tournament.city.toLowerCase();
  const countryLower = tournament.country.toLowerCase();
  const typeLower = tournament.tournament_type.toLowerCase();

  // Name matching (highest priority)
  if (nameLower === queryLower) {
    score += RELEVANCE_WEIGHTS.EXACT_NAME_MATCH;
  } else if (nameLower.startsWith(queryLower)) {
    score += RELEVANCE_WEIGHTS.NAME_STARTS_WITH;
  } else if (nameLower.includes(queryLower)) {
    score += RELEVANCE_WEIGHTS.NAME_CONTAINS;
  }

  // City matching
  if (cityLower === queryLower) {
    score += RELEVANCE_WEIGHTS.CITY_EXACT_MATCH;
  } else if (cityLower.startsWith(queryLower)) {
    score += RELEVANCE_WEIGHTS.CITY_STARTS_WITH;
  } else if (cityLower.includes(queryLower)) {
    score += RELEVANCE_WEIGHTS.CITY_CONTAINS;
  }

  // Country matching
  if (countryLower === queryLower) {
    score += RELEVANCE_WEIGHTS.COUNTRY_EXACT_MATCH;
  } else if (countryLower.startsWith(queryLower)) {
    score += RELEVANCE_WEIGHTS.COUNTRY_STARTS_WITH;
  } else if (countryLower.includes(queryLower)) {
    score += RELEVANCE_WEIGHTS.COUNTRY_CONTAINS;
  }

  // Tournament type matching
  if (typeLower.includes(queryLower)) {
    score += RELEVANCE_WEIGHTS.TYPE_MATCH;
  }

  // Official tournament ID matching
  if (tournament.official_tournament_id?.toLowerCase().includes(queryLower)) {
    score += RELEVANCE_WEIGHTS.OFFICIAL_ID_MATCH;
  }

  // Time-based scoring
  const now = new Date();
  const startDate = new Date(tournament.start_date);
  const daysDiff = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Boost upcoming tournaments (within next 30 days)
  if (tournament.status === 'upcoming' && daysDiff <= 30 && daysDiff >= 0) {
    score += RELEVANCE_WEIGHTS.UPCOMING_BOOST;
  }

  // Boost tournaments with open registration
  if (tournament.registration_open) {
    score += RELEVANCE_WEIGHTS.REGISTRATION_OPEN_BOOST;
  }

  // Boost tournaments with available spots
  if (tournament.max_players && tournament.current_players < tournament.max_players) {
    const availabilityRatio = (tournament.max_players - tournament.current_players) / tournament.max_players;
    score += Math.floor(availabilityRatio * RELEVANCE_WEIGHTS.AVAILABILITY_BOOST_MAX);
  }

  // Boost recently created tournaments (within last 7 days)
  const createdDate = new Date(tournament.created_at);
  const daysSinceCreated = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreated <= 7) {
    score += RELEVANCE_WEIGHTS.RECENT_TOURNAMENT_BOOST;
  }

  return score;
}

/**
 * Build optimized search query with full-text search
 */
export function buildOptimizedSearchQuery(
  params: SearchParams,
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>
) {
  let searchQuery = supabase
    .from('tournaments')
    .select('*', { count: 'exact' });

  // Use full-text search if query is provided
  if (params.query && params.query.length >= 2) {
    // Use the search_vector column for better performance
    searchQuery = searchQuery.textSearch('search_vector', params.query, {
      type: 'websearch'
    });
  }

  // Apply filters efficiently using indexed columns
  if (params.city) {
    searchQuery = searchQuery.eq('city', params.city);
  }

  if (params.country) {
    searchQuery = searchQuery.eq('country', params.country);
  }

  if (params.tournament_type) {
    searchQuery = searchQuery.eq('tournament_type', params.tournament_type);
  }

  if (params.status) {
    searchQuery = searchQuery.eq('status', params.status);
  } else {
    // Default to upcoming and ongoing tournaments (uses index)
    searchQuery = searchQuery.in('status', ['upcoming', 'ongoing']);
  }

  if (params.date_from) {
    searchQuery = searchQuery.gte('start_date', params.date_from);
  }

  if (params.date_to) {
    searchQuery = searchQuery.lte('start_date', params.date_to);
  }

  if (params.organizer_id) {
    searchQuery = searchQuery.eq('organizer_id', params.organizer_id);
  }

  if (params.registration_open !== undefined) {
    searchQuery = searchQuery.eq('registration_open', params.registration_open);
  }

  // Filter tournaments with available spots (uses index)
  if (params.has_spots) {
    searchQuery = searchQuery.or('max_players.is.null,current_players.lt.max_players');
  }

  return searchQuery;
}

/**
 * Determine query complexity for performance monitoring
 */
export function getQueryComplexity(params: SearchParams): 'simple' | 'moderate' | 'complex' {
  let complexity = 0;

  if (params.query) complexity += 2;
  if (params.city) complexity += 1;
  if (params.country) complexity += 1;
  if (params.tournament_type) complexity += 1;
  if (params.status) complexity += 1;
  if (params.date_from || params.date_to) complexity += 2;
  if (params.organizer_id) complexity += 1;
  if (params.registration_open !== undefined) complexity += 1;
  if (params.has_spots) complexity += 2;

  if (complexity <= 3) return 'simple';
  if (complexity <= 7) return 'moderate';
  return 'complex';
}

/**
 * Format search response with metadata
 */
export function formatSearchResponse(
  tournaments: Tournament[],
  count: number,
  params: SearchParams,
  searchTime: number,
  ranked: boolean = false
) {
  const hasMore = (count || 0) > params.offset + params.limit;
  const totalPages = Math.ceil((count || 0) / params.limit);

  return {
    tournaments,
    total: count || 0,
    hasMore,
    pagination: {
      limit: params.limit,
      offset: params.offset,
      page: Math.floor(params.offset / params.limit) + 1,
      total_pages: totalPages
    },
    query: {
      text: params.query || '',
      filters: {
        city: params.city,
        country: params.country,
        tournament_type: params.tournament_type,
        status: params.status,
        date_from: params.date_from,
        date_to: params.date_to,
        organizer_id: params.organizer_id,
        registration_open: params.registration_open,
        has_spots: params.has_spots
      }
    },
    metadata: {
      search_time: searchTime,
      results_ranked: ranked,
      total_results: count || 0,
      query_complexity: getQueryComplexity(params)
    } as SearchMetadata
  };
}

/**
 * Log search analytics for monitoring
 */
export async function logSearchAnalytics(
  query: string,
  resultsCount: number,
  searchTime: number,
  filtersUsed: number,
  userId?: string
) {
  try {
    // In a real implementation, you might send this to an analytics service
    console.log('Search Analytics:', {
      query: query.substring(0, 50), // Truncate for privacy
      results_count: resultsCount,
      search_time: searchTime,
      filters_used: filtersUsed,
      user_id: userId,
      timestamp: new Date().toISOString()
    });

    // You could also store this in a database table for analysis
    // await supabase.from('search_analytics').insert({...});
  } catch (error) {
    console.error('Error logging search analytics:', error);
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}