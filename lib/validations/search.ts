/**
 * Validation schemas for tournament search API
 */

import { z } from 'zod';
import { TournamentType, TournamentStatus } from '@/lib/types/tournament';

// Search query parameters validation
export const searchParamsSchema = z.object({
  query: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
  
  city: z.string()
    .min(1, 'City name cannot be empty')
    .max(50, 'City name must be less than 50 characters')
    .optional(),
  
  country: z.string()
    .min(1, 'Country name cannot be empty')
    .max(50, 'Country name must be less than 50 characters')
    .optional(),
  
  tournament_type: z.nativeEnum(TournamentType).optional(),
  
  status: z.nativeEnum(TournamentStatus).optional(),
  
  date_from: z.string()
    .datetime('Invalid date format for date_from')
    .optional(),
  
  date_to: z.string()
    .datetime('Invalid date format for date_to')
    .optional(),
  
  organizer_id: z.string()
    .uuid('Invalid organizer ID format')
    .optional(),
  
  registration_open: z.enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional(),
  
  has_spots: z.enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional(),
  
  limit: z.coerce.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(20),
  
  offset: z.coerce.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .default(0),
  
  suggestions: z.enum(['true', 'false'])
    .transform(val => val === 'true')
    .default(false)
});

// Advanced search body validation (for POST requests)
export const advancedSearchSchema = z.object({
  query: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be less than 100 characters')
    .default(''),
  
  filters: z.object({
    city: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    tournament_type: z.nativeEnum(TournamentType).optional(),
    status: z.nativeEnum(TournamentStatus).optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    organizer_id: z.string().uuid().optional(),
    registration_open: z.boolean().optional(),
    has_spots: z.boolean().optional(),
    max_players_min: z.number().int().min(1).optional(),
    max_players_max: z.number().int().min(1).optional(),
  }).default({}),
  
  sort: z.object({
    field: z.enum(['start_date', 'name', 'city', 'created_at', 'current_players']).default('start_date'),
    direction: z.enum(['asc', 'desc']).default('asc')
  }).default({ field: 'start_date', direction: 'asc' }),
  
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(20)
  }).default({ page: 1, limit: 20 })
});

// Suggestion request validation
export const suggestionParamsSchema = z.object({
  query: z.string()
    .min(2, 'Query must be at least 2 characters for suggestions')
    .max(50, 'Query too long for suggestions'),
  
  limit: z.coerce.number()
    .int()
    .min(1)
    .max(20)
    .default(10),
  
  types: z.array(z.enum(['tournament', 'location', 'type', 'organizer']))
    .default(['tournament', 'location', 'type'])
});

// Search analytics validation
export const searchAnalyticsSchema = z.object({
  query: z.string().max(100),
  results_count: z.number().int().min(0),
  search_time: z.number().min(0),
  filters_used: z.number().int().min(0),
  user_id: z.string().uuid().optional(),
  session_id: z.string().optional(),
  timestamp: z.date().default(() => new Date())
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().ip(),
  endpoint: z.string(),
  timestamp: z.date().default(() => new Date()),
  requests_count: z.number().int().min(1).default(1)
});

// Export types for TypeScript
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type AdvancedSearchRequest = z.infer<typeof advancedSearchSchema>;
export type SuggestionParams = z.infer<typeof suggestionParamsSchema>;
export type SearchAnalytics = z.infer<typeof searchAnalyticsSchema>;
export type RateLimitData = z.infer<typeof rateLimitSchema>;

// Validation helper functions
export function validateSearchParams(params: unknown): SearchParams {
  return searchParamsSchema.parse(params);
}

export function validateAdvancedSearch(body: unknown): AdvancedSearchRequest {
  return advancedSearchSchema.parse(body);
}

export function validateSuggestionParams(params: unknown): SuggestionParams {
  return suggestionParamsSchema.parse(params);
}

// Custom validation errors
export class SearchValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'SearchValidationError';
  }
}

// Date range validation helper
export function validateDateRange(dateFrom?: string, dateTo?: string): void {
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    
    if (from >= to) {
      throw new SearchValidationError(
        'date_from must be before date_to',
        'date_range',
        'INVALID_DATE_RANGE'
      );
    }
    
    // Check if date range is not too large (e.g., more than 2 years)
    const maxRangeMs = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
    if (to.getTime() - from.getTime() > maxRangeMs) {
      throw new SearchValidationError(
        'Date range cannot exceed 2 years',
        'date_range',
        'DATE_RANGE_TOO_LARGE'
      );
    }
  }
}

// Query sanitization helper
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break SQL
    .replace(/\s+/g, ' '); // Normalize whitespace
}