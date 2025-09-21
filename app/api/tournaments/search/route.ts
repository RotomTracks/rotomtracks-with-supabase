import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ErrorCodes, TournamentType, TournamentStatus } from '@/lib/types/tournament';
import {
  withErrorHandling,
  generateRequestId,
  handleValidationError,
  handleSupabaseError,
  createErrorResponse
} from '@/lib/utils/api-error-handler';
import {
  createSearchResponse,
  validatePaginationParams,
  validateSearchParams
} from '@/lib/utils/api-response-formatter';
import { 
  validateSearchParams as validateAdvancedSearchParams, 
  validateAdvancedSearch,
  validateDateRange,
  sanitizeSearchQuery,
  SearchValidationError 
} from '@/lib/validations/search';
import {
  generateSearchSuggestions,
  calculateRelevanceScore,
  buildOptimizedSearchQuery,
  formatSearchResponse,
  logSearchAnalytics,
  getClientIP
} from '@/lib/utils/search';
import { withRateLimit } from '@/lib/utils/rate-limit';

// GET /api/tournaments/search - Advanced tournament search with suggestions
export async function GET(request: NextRequest) {
  return withRateLimit(request, 'search', async () => {
    const startTime = Date.now();
    
    try {
      const supabase = await createClient();
      const { searchParams } = new URL(request.url);
      
      // Validate and sanitize parameters
      const validatedParams = validateSearchParams(searchParams);
      
      // Sanitize query if provided
      if (validatedParams.query) {
        validatedParams.query = sanitizeSearchQuery(validatedParams.query);
      }
      
      // Validate date range
      validateDateRange(validatedParams.date_from, validatedParams.date_to);
      
      // Handle suggestions request
      if (validatedParams.query && validatedParams.query.length >= 2) {
        const suggestionResults = await generateSearchSuggestions(
          validatedParams.query,
          10 // Default limit
        );
        
        const searchTime = Date.now() - startTime;
        
        // Log analytics for suggestions
        await logSearchAnalytics(
          validatedParams.query,
          suggestionResults.length,
          searchTime,
          0 // No filters for suggestions
        );
        
        return NextResponse.json({
          suggestions: suggestionResults,
          metadata: {
            search_time: searchTime,
            query_complexity: 'simple'
          }
        });
      }

      // Build optimized search query
      const searchQuery = buildOptimizedSearchQuery({
        ...validatedParams,
        tournament_type: validatedParams.tournament_type as TournamentType,
        status: validatedParams.status as TournamentStatus,
        suggestions: false,
        limit: 20,
        offset: 0
      }, supabase);
      
      // Apply sorting and pagination
      const { data: tournaments, error, count } = await searchQuery
        .order('start_date', { ascending: true })
        .range(0, 19);

      if (error) {
        return handleSupabaseError(error, 'búsqueda de torneos');
      }

      // Calculate relevance scores and rank results
      const rankedTournaments = tournaments?.map((tournament: any) => {
        const relevanceScore = calculateRelevanceScore(tournament, validatedParams.query || '');
        return {
          ...tournament,
          relevance_score: relevanceScore
        };
      }) || [];

      // Sort by relevance if there's a query, otherwise keep date order
      if (validatedParams.query) {
        rankedTournaments.sort((a: any, b: any) => b.relevance_score - a.relevance_score);
      }

      const searchTime = Date.now() - startTime;
      const filtersUsed = Object.values(validatedParams).filter(v => v !== undefined && v !== '').length;

      // Log search analytics
      await logSearchAnalytics(
        validatedParams.query || '',
        count || 0,
        searchTime,
        filtersUsed
      );

      // Format and return response
      const response = formatSearchResponse(
        rankedTournaments,
        count || 0,
        { 
          ...validatedParams, 
          tournament_type: validatedParams.tournament_type as any,
          status: validatedParams.status as any,
          suggestions: false, 
          limit: 20, 
          offset: 0 
        },
        searchTime,
        !!validatedParams.query
      );

      return NextResponse.json(response);

    } catch (error) {
      const searchTime = Date.now() - startTime;
      
      if (error instanceof SearchValidationError) {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          error.message,
          { search_time: searchTime },
          error.field
        );
      }
      
      if (error instanceof z.ZodError) {
        return handleValidationError(error);
      }
      
      console.error('Error inesperado en búsqueda de torneos:', error);
      return createErrorResponse(
        ErrorCodes.PROCESSING_ERROR,
        'Ha ocurrido un error inesperado en la búsqueda',
        { search_time: searchTime }
      );
    }
  });
}

// POST /api/tournaments/search - Advanced search with complex filters
export async function POST(request: NextRequest) {
  return withRateLimit(request, 'search', async () => {
    const startTime = Date.now();
    
    try {
      const supabase = await createClient();
      const body = await request.json();
      
      // Validate request body
      const validatedRequest = validateAdvancedSearch(body);
      
      // Sanitize query
      if (validatedRequest.query) {
        validatedRequest.query = sanitizeSearchQuery(validatedRequest.query);
      }
      
      // Validate date range in filters
      validateDateRange(
        validatedRequest.filters.date_from,
        validatedRequest.filters.date_to
      );

      const { query, filters, sort, pagination } = validatedRequest;
      const limit = pagination.limit;
      const offset = (pagination.page - 1) * limit;

      // Convert to search params format for reusing existing logic
      const searchParams = {
        query,
        ...filters,
        limit,
        offset
      };

      // Build optimized search query
      const searchQuery = buildOptimizedSearchQuery({
        ...searchParams,
        suggestions: false
      }, supabase);

      // Apply sorting
      const ascending = sort.direction === 'asc';
      const finalQuery = searchQuery
        .order(sort.field, { ascending })
        .range(offset, offset + limit - 1);

      const { data: tournaments, error, count } = await finalQuery;

      if (error) {
        return handleSupabaseError(error, 'búsqueda avanzada de torneos');
      }

      // Calculate relevance scores if there's a query
      let rankedTournaments = tournaments || [];
      if (query) {
        rankedTournaments = tournaments?.map((tournament: any) => {
          const relevanceScore = calculateRelevanceScore(tournament, query);
          return {
            ...tournament,
            relevance_score: relevanceScore
          };
        }) || [];
        
        // Sort by relevance for text queries
        if (sort.field === 'start_date' && query) {
          rankedTournaments.sort((a: any, b: any) => b.relevance_score - a.relevance_score);
        }
      }

      const searchTime = Date.now() - startTime;
      const filtersUsed = Object.values(filters).filter(v => v !== undefined && v !== '').length;

      // Log search analytics
      await logSearchAnalytics(
        query,
        count || 0,
        searchTime,
        filtersUsed
      );

      return NextResponse.json({
        tournaments: rankedTournaments,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
        pagination: {
          page: pagination.page,
          limit,
          total_pages: Math.ceil((count || 0) / limit)
        },
        metadata: {
          search_time: searchTime,
          results_ranked: !!query,
          query_complexity: query ? 'complex' : 'moderate'
        }
      });

    } catch (error) {
      const searchTime = Date.now() - startTime;
      
      if (error instanceof SearchValidationError) {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          error.message,
          { search_time: searchTime },
          error.field
        );
      }
      
      if (error instanceof z.ZodError) {
        return handleValidationError(error);
      }
      
      console.error('Error inesperado en búsqueda avanzada de torneos:', error);
      return createErrorResponse(
        ErrorCodes.PROCESSING_ERROR,
        'Ha ocurrido un error inesperado en la búsqueda avanzada',
        { search_time: searchTime }
      );
    }
  });
}