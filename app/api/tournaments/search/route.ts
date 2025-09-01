import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/tournaments/search - Advanced tournament search with suggestions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const query = searchParams.get('query') || '';
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const tournament_type = searchParams.get('tournament_type');
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const organizer_id = searchParams.get('organizer_id');
    const registration_open = searchParams.get('registration_open');
    const has_spots = searchParams.get('has_spots') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const suggestions = searchParams.get('suggestions') === 'true';

    // If requesting suggestions, return quick results for autocomplete
    if (suggestions && query.length >= 2) {
      // Use a simpler approach for suggestions to avoid type casting issues
      let suggestionsQuery = supabase
        .from('tournaments')
        .select('id, name, city, country, tournament_type, start_date, status, registration_open')
        .in('status', ['upcoming', 'ongoing'])
        .order('start_date', { ascending: true })
        .limit(10);

      // Apply text filters separately to avoid parsing issues
      suggestionsQuery = suggestionsQuery.or(
        `name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%,official_tournament_id.ilike.%${query}%`
      );

      const { data: tournamentSuggestions, error: suggestionsError } = await suggestionsQuery;

      if (suggestionsError) {
        console.error('Error fetching suggestions:', suggestionsError);
        return NextResponse.json({ suggestions: [] });
      }

      // Also search for tournament types that match
      const { data: typeSuggestions } = await supabase
        .from('tournaments')
        .select('tournament_type')
        .ilike('tournament_type', `%${query}%`)
        .in('status', ['upcoming', 'ongoing'])
        .limit(5);

      // Group suggestions by type for better UX
      const suggestions = tournamentSuggestions?.map(t => ({
        id: t.id,
        name: t.name,
        location: `${t.city}, ${t.country}`,
        type: t.tournament_type,
        date: t.start_date,
        status: t.status,
        registration_open: t.registration_open,
        category: 'tournament'
      })) || [];

      // Add location-based suggestions
      const uniqueLocations = [...new Set(tournamentSuggestions?.map(t => `${t.city}, ${t.country}`) || [])];
      const locationSuggestions = uniqueLocations.slice(0, 3).map(location => ({
        id: `location-${location}`,
        name: location,
        category: 'location'
      }));

      // Add tournament type suggestions
      const uniqueTypes = [...new Set([
        ...(tournamentSuggestions?.map(t => t.tournament_type) || []),
        ...(typeSuggestions?.map(t => t.tournament_type) || [])
      ])];
      const typeSuggestionsFormatted = uniqueTypes.slice(0, 3).map(type => ({
        id: `type-${type}`,
        name: type,
        category: 'type'
      }));

      return NextResponse.json({
        suggestions: [
          ...suggestions,
          ...locationSuggestions,
          ...typeSuggestionsFormatted
        ].slice(0, 10)
      });
    }

    // Build main search query
    let searchQuery = supabase
      .from('tournaments')
      .select(`
        *
      `, { count: 'exact' });

    // Apply text search with separate queries to handle tournament_type properly
    if (query.length >= 2) {
      // First, search in name, city, country
      let textQuery = supabase
        .from('tournaments')
        .select('id')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%,official_tournament_id.ilike.%${query}%`);

      // Then search in tournament_type separately
      let typeQuery = supabase
        .from('tournaments')
        .select('id')
        .ilike('tournament_type', `%${query}%`);

      // Get IDs from both queries
      const [textResults, typeResults] = await Promise.all([
        textQuery,
        typeQuery
      ]);

      const textIds = textResults.data?.map(t => t.id) || [];
      const typeIds = typeResults.data?.map(t => t.id) || [];
      const allIds = [...new Set([...textIds, ...typeIds])];

      if (allIds.length > 0) {
        searchQuery = searchQuery.in('id', allIds);
      } else {
        // No matches found, return empty result
        return NextResponse.json({
          tournaments: [],
          total: 0,
          hasMore: false,
          pagination: {
            limit,
            offset,
            page: Math.floor(offset / limit) + 1,
            total_pages: 0
          },
          query: {
            text: query,
            filters: {
              city,
              country,
              tournament_type,
              status,
              date_from,
              date_to,
              organizer_id,
              registration_open,
              has_spots
            }
          },
          metadata: {
            search_time: Date.now(),
            results_ranked: true
          }
        });
      }
    }

    // Apply filters
    if (city) {
      searchQuery = searchQuery.eq('city', city);
    }
    
    if (country) {
      searchQuery = searchQuery.eq('country', country);
    }
    
    if (tournament_type) {
      searchQuery = searchQuery.eq('tournament_type', tournament_type);
    }
    
    if (status) {
      searchQuery = searchQuery.eq('status', status);
    } else {
      // Default to upcoming and ongoing tournaments
      searchQuery = searchQuery.in('status', ['upcoming', 'ongoing']);
    }
    
    if (date_from) {
      searchQuery = searchQuery.gte('start_date', date_from);
    }
    
    if (date_to) {
      searchQuery = searchQuery.lte('start_date', date_to);
    }
    
    if (organizer_id) {
      searchQuery = searchQuery.eq('organizer_id', organizer_id);
    }
    
    if (registration_open !== null) {
      searchQuery = searchQuery.eq('registration_open', registration_open === 'true');
    }
    
    // Filter tournaments with available spots
    if (has_spots) {
      searchQuery = searchQuery.or('max_players.is.null,current_players.lt.max_players');
    }

    // Apply sorting and pagination
    searchQuery = searchQuery
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: tournaments, error, count } = await searchQuery;

    if (error) {
      console.error('Error searching tournaments:', error);
      return NextResponse.json(
        { error: 'Failed to search tournaments', details: error.message },
        { status: 500 }
      );
    }

    // Calculate relevance scores for better ranking
    const rankedTournaments = tournaments?.map(tournament => {
      let relevanceScore = 0;
      
      if (query) {
        const queryLower = query.toLowerCase();
        const nameLower = tournament.name.toLowerCase();
        const cityLower = tournament.city.toLowerCase();
        const countryLower = tournament.country.toLowerCase();
        const typeLower = tournament.tournament_type.toLowerCase();
        
        // Exact matches get highest scores
        if (nameLower === queryLower) relevanceScore += 100;
        else if (nameLower.startsWith(queryLower)) relevanceScore += 75;
        else if (nameLower.includes(queryLower)) relevanceScore += 50;
        
        // Location matches
        if (cityLower === queryLower) relevanceScore += 40;
        else if (cityLower.startsWith(queryLower)) relevanceScore += 25;
        else if (cityLower.includes(queryLower)) relevanceScore += 15;
        
        if (countryLower === queryLower) relevanceScore += 30;
        else if (countryLower.startsWith(queryLower)) relevanceScore += 20;
        else if (countryLower.includes(queryLower)) relevanceScore += 10;
        
        // Tournament type match
        if (typeLower.includes(queryLower)) {
          relevanceScore += 35;
        }
        
        // Official tournament ID match
        if (tournament.official_tournament_id && tournament.official_tournament_id.toLowerCase().includes(queryLower)) {
          relevanceScore += 60;
        }
      }
      
      // Time-based scoring
      const now = new Date();
      const startDate = new Date(tournament.start_date);
      const daysDiff = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Boost upcoming tournaments (within next 30 days)
      if (tournament.status === 'upcoming' && daysDiff <= 30 && daysDiff >= 0) {
        relevanceScore += 10;
      }
      
      // Boost tournaments with open registration
      if (tournament.registration_open) relevanceScore += 5;
      
      // Boost tournaments with available spots
      if (tournament.max_players && tournament.current_players < tournament.max_players) {
        const availabilityRatio = (tournament.max_players - tournament.current_players) / tournament.max_players;
        relevanceScore += Math.floor(availabilityRatio * 8);
      }
      
      return {
        ...tournament,
        relevance_score: relevanceScore
      };
    }) || [];

    // Sort by relevance if there's a query, otherwise keep date order
    if (query) {
      rankedTournaments.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    return NextResponse.json({
      tournaments: rankedTournaments,
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
      pagination: {
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil((count || 0) / limit)
      },
      query: {
        text: query,
        filters: {
          city,
          country,
          tournament_type,
          status,
          date_from,
          date_to,
          organizer_id,
          registration_open,
          has_spots
        }
      },
      metadata: {
        search_time: Date.now(),
        results_ranked: !!query
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/tournaments/search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tournaments/search - Advanced search with complex filters
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      query = '',
      filters = {},
      sort = { field: 'start_date', direction: 'asc' },
      pagination = { page: 1, limit: 20 }
    } = body;

    const limit = Math.min(pagination.limit, 50);
    const offset = (pagination.page - 1) * limit;

    // Build search query
    let searchQuery = supabase
      .from('tournaments')
      .select(`
        *
      `, { count: 'exact' });

    // Apply text search using the same approach as GET
    if (query.length >= 2) {
      // First, search in name, city, country
      let textQuery = supabase
        .from('tournaments')
        .select('id')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%,official_tournament_id.ilike.%${query}%`);

      // Then search in tournament_type separately
      let typeQuery = supabase
        .from('tournaments')
        .select('id')
        .ilike('tournament_type', `%${query}%`);

      // Get IDs from both queries
      const [textResults, typeResults] = await Promise.all([
        textQuery,
        typeQuery
      ]);

      const textIds = textResults.data?.map(t => t.id) || [];
      const typeIds = typeResults.data?.map(t => t.id) || [];
      const allIds = [...new Set([...textIds, ...typeIds])];

      if (allIds.length > 0) {
        searchQuery = searchQuery.in('id', allIds);
      } else {
        // No matches found
        return NextResponse.json({
          tournaments: [],
          total: 0,
          hasMore: false,
          pagination: {
            page: pagination.page,
            limit,
            total_pages: 0
          }
        });
      }
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          searchQuery = searchQuery.in(key, value);
        } else if (key.includes('_from')) {
          const field = key.replace('_from', '');
          searchQuery = searchQuery.gte(field, value);
        } else if (key.includes('_to')) {
          const field = key.replace('_to', '');
          searchQuery = searchQuery.lte(field, value);
        } else {
          searchQuery = searchQuery.eq(key, value);
        }
      }
    });

    // Apply sorting
    const ascending = sort.direction === 'asc';
    searchQuery = searchQuery.order(sort.field, { ascending });

    // Apply pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data: tournaments, error, count } = await searchQuery;

    if (error) {
      console.error('Error in advanced search:', error);
      return NextResponse.json(
        { error: 'Failed to search tournaments', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tournaments: tournaments || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
      pagination: {
        page: pagination.page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/tournaments/search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}