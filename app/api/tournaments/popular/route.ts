import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { withRateLimit } from '@/lib/utils/rate-limit';

// Validation schema for popular suggestions request
const popularRequestSchema = z.object({
  userLocation: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  maxPerCategory: z.number().min(1).max(10).default(4),
  categories: z.array(z.enum(['tournament_type', 'location', 'trending'])).optional(),
});

interface PopularSuggestion {
  id: string;
  name: string;
  category: 'tournament_type' | 'location' | 'trending';
  count?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
  searchQuery?: string;
  priority?: number;
}

// POST /api/tournaments/popular - Get popular tournament suggestions
export async function POST(request: NextRequest) {
  return withRateLimit(request, 'suggestions', async () => {
    try {
      const supabase = await createClient();
      const body = await request.json();
      
      // Validate request body
      const { userLocation, maxPerCategory, categories } = popularRequestSchema.parse(body);
      
      const suggestions: PopularSuggestion[] = [];
      const requestedCategories = categories || ['tournament_type', 'location', 'trending'];

      // Get tournament type suggestions
      if (requestedCategories.includes('tournament_type')) {
        const typesSuggestions = await getTournamentTypeSuggestions(supabase, maxPerCategory);
        suggestions.push(...typesSuggestions);
      }

      // Get location suggestions
      if (requestedCategories.includes('location')) {
        const locationSuggestions = await getLocationSuggestions(supabase, maxPerCategory, userLocation);
        suggestions.push(...locationSuggestions);
      }

      // Get trending suggestions
      if (requestedCategories.includes('trending')) {
        const trendingSuggestions = await getTrendingSuggestions(supabase, maxPerCategory);
        suggestions.push(...trendingSuggestions);
      }

      return NextResponse.json(suggestions);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: error.issues
          },
          { status: 400 }
        );
      }

      console.error('Error in POST /api/tournaments/popular:', error);
      return NextResponse.json(
        { 
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch popular suggestions'
        },
        { status: 500 }
      );
    }
  });
}

// GET /api/tournaments/popular - Get popular suggestions (simple version)
export async function GET(request: NextRequest) {
  return withRateLimit(request, 'suggestions', async () => {
    try {
      const supabase = await createClient();
      const { searchParams } = new URL(request.url);
      
      const maxPerCategory = Math.min(parseInt(searchParams.get('limit') || '4'), 10);
      const userCity = searchParams.get('city');
      const userCountry = searchParams.get('country');
      
      const userLocation = (userCity || userCountry) ? {
        city: userCity || undefined,
        country: userCountry || undefined
      } : undefined;

      const suggestions: PopularSuggestion[] = [];

      // Get all suggestion types
      const [typesSuggestions, locationSuggestions, trendingSuggestions] = await Promise.all([
        getTournamentTypeSuggestions(supabase, maxPerCategory),
        getLocationSuggestions(supabase, maxPerCategory, userLocation),
        getTrendingSuggestions(supabase, maxPerCategory)
      ]);

      suggestions.push(...typesSuggestions, ...locationSuggestions, ...trendingSuggestions);

      return NextResponse.json(suggestions);

    } catch (error) {
      console.error('Error in GET /api/tournaments/popular:', error);
      return NextResponse.json(
        { 
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch popular suggestions'
        },
        { status: 500 }
      );
    }
  });
}

// Helper function to get tournament type suggestions
async function getTournamentTypeSuggestions(
  supabase: any, 
  limit: number
): Promise<PopularSuggestion[]> {
  try {
    // Get tournament type counts from the database
    const { data: typeCounts, error } = await supabase
      .from('tournaments')
      .select('tournament_type')
      .gte('start_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
      .in('status', ['upcoming', 'ongoing']);

    if (error) {
      return getFallbackTypeSuggestions(limit);
    }

    // Count occurrences
    const counts = typeCounts?.reduce((acc: Record<string, number>, tournament: any) => {
      acc[tournament.tournament_type] = (acc[tournament.tournament_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Convert to suggestions format
    const typeMapping: Record<string, { name: string; icon: string }> = {
      'TCG League Cup': { name: 'TCG League Cup', icon: '🃏' },
      'VGC Premier Event': { name: 'VGC Premier Event', icon: '🎮' },
      'GO Premier Event': { name: 'Pokémon GO', icon: '📱' },
      'TCG Prerelease': { name: 'Prerelease', icon: '📦' },
      'TCG League Challenge': { name: 'TCG League Challenge', icon: '⚔️' },
    };

    const suggestions = Object.entries(counts)
      .map(([type, count], index) => ({
        id: `type-${type.toLowerCase().replace(/\s+/g, '-')}`,
        name: typeMapping[type]?.name || type,
        category: 'tournament_type' as const,
        count: count as number,
        trend: (count as number) > 5 ? 'up' as const : 'stable' as const,
        icon: typeMapping[type]?.icon || '🏆',
        searchQuery: type,
        priority: index + 1
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);

    return suggestions.length > 0 ? suggestions : getFallbackTypeSuggestions(limit);

  } catch (error) {
    console.warn('Error fetching tournament type suggestions:', error);
    return getFallbackTypeSuggestions(limit);
  }
}

// Helper function to get location suggestions
async function getLocationSuggestions(
  supabase: any, 
  limit: number, 
  userLocation?: { city?: string; country?: string }
): Promise<PopularSuggestion[]> {
  try {
    // Get location counts from the database
    const { data: locationCounts, error } = await supabase
      .from('tournaments')
      .select('city, country')
      .gte('start_date', new Date().toISOString()) // Upcoming tournaments only
      .in('status', ['upcoming', 'ongoing']);

    if (error) {
      return getFallbackLocationSuggestions(limit, userLocation);
    }

    // Count city occurrences
    const cityCounts = locationCounts?.reduce((acc: Record<string, { count: number; country: string }>, tournament: any) => {
      const key = tournament.city;
      if (!acc[key]) {
        acc[key] = { count: 0, country: tournament.country };
      }
      acc[key].count++;
      return acc;
    }, {}) || {};

    // City icons mapping
    const cityIcons: Record<string, string> = {
      'Madrid': '🏛️',
      'Barcelona': '🏖️',
      'Valencia': '🍊',
      'Sevilla': '🌞',
      'Bilbao': '🏔️',
      'Zaragoza': '🏰',
      'Málaga': '🌴',
      'Murcia': '🌶️',
      'Palma': '🏝️',
      'Las Palmas': '🌺',
    };

    let suggestions = Object.entries(cityCounts)
      .map(([city, data], index) => {
        const cityData = data as { count: number; country: string };
        return {
          id: `location-${city.toLowerCase().replace(/\s+/g, '-')}`,
          name: city,
          category: 'location' as const,
          count: cityData.count,
          trend: cityData.count > 3 ? 'up' as const : 'stable' as const,
          icon: cityIcons[city] || '🏙️',
          searchQuery: city,
          priority: index + 1
        };
      })
      .sort((a, b) => (b.count || 0) - (a.count || 0));

    // Prioritize user's location if available
    if (userLocation?.city) {
      const userCityIndex = suggestions.findIndex(s => 
        s.name.toLowerCase() === userLocation.city?.toLowerCase()
      );
      if (userCityIndex > 0) {
        const userCity = suggestions.splice(userCityIndex, 1)[0];
        userCity.priority = 0;
        suggestions.unshift(userCity);
      }
    }

    suggestions = suggestions.slice(0, limit);

    return suggestions.length > 0 ? suggestions : getFallbackLocationSuggestions(limit, userLocation);

  } catch (error) {
    console.warn('Error fetching location suggestions:', error);
    return getFallbackLocationSuggestions(limit, userLocation);
  }
}

// Helper function to get trending suggestions
async function getTrendingSuggestions(
  supabase: any, 
  limit: number
): Promise<PopularSuggestion[]> {
  try {
    // Get recent popular tournaments
    const { data: recentTournaments, error } = await supabase
      .from('tournaments')
      .select('name, tournament_type, current_players')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('current_players', { ascending: false })
      .limit(20);

    if (error) {
      return getFallbackTrendingSuggestions(limit);
    }

    // Extract trending terms
    const trendingTerms = new Map<string, number>();
    
    recentTournaments?.forEach((tournament: any) => {
      // Extract keywords from tournament names
      const words = tournament.name.toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 3 && !['tournament', 'torneo', 'event', 'evento', 'league', 'cup'].includes(word)) {
          trendingTerms.set(word, (trendingTerms.get(word) || 0) + (tournament.current_players || 1));
        }
      });
      
      // Add tournament types
      if (tournament.tournament_type.includes('Regional')) {
        trendingTerms.set('Regional Championship', (trendingTerms.get('Regional Championship') || 0) + 10);
      }
      if (tournament.tournament_type.includes('Premier')) {
        trendingTerms.set('Premier Event', (trendingTerms.get('Premier Event') || 0) + 5);
      }
    });

    const suggestions = Array.from(trendingTerms.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([term, count], index) => ({
        id: `trending-${term.replace(/\s+/g, '-')}`,
        name: term.charAt(0).toUpperCase() + term.slice(1),
        category: 'trending' as const,
        count,
        trend: 'up' as const,
        searchQuery: term,
        priority: index + 1
      }));

    return suggestions.length > 0 ? suggestions : getFallbackTrendingSuggestions(limit);

  } catch (error) {
    console.warn('Error fetching trending suggestions:', error);
    return getFallbackTrendingSuggestions(limit);
  }
}

// Fallback functions for when database queries fail
function getFallbackTypeSuggestions(limit: number): PopularSuggestion[] {
  const fallbackTypes = [
    { id: 'type-tcg-cup', name: 'TCG League Cup', count: 45, icon: '🃏' },
    { id: 'type-vgc', name: 'VGC Premier Event', count: 32, icon: '🎮' },
    { id: 'type-go', name: 'Pokémon GO', count: 28, icon: '📱' },
    { id: 'type-prerelease', name: 'Prerelease', count: 15, icon: '📦' },
  ];

  return fallbackTypes.slice(0, limit).map((type, index) => ({
    ...type,
    category: 'tournament_type' as const,
    trend: 'stable' as const,
    searchQuery: type.name,
    priority: index + 1
  }));
}

function getFallbackLocationSuggestions(
  limit: number, 
  userLocation?: { city?: string; country?: string }
): PopularSuggestion[] {
  let fallbackLocations = [
    { id: 'location-madrid', name: 'Madrid', count: 38, icon: '🏛️' },
    { id: 'location-barcelona', name: 'Barcelona', count: 29, icon: '🏖️' },
    { id: 'location-valencia', name: 'Valencia', count: 18, icon: '🍊' },
    { id: 'location-sevilla', name: 'Sevilla', count: 12, icon: '🌞' },
  ];

  // Prioritize user's location
  if (userLocation?.city) {
    const userCityIndex = fallbackLocations.findIndex(loc => 
      loc.name.toLowerCase() === userLocation.city?.toLowerCase()
    );
    if (userCityIndex > 0) {
      const userCity = fallbackLocations.splice(userCityIndex, 1)[0];
      fallbackLocations.unshift(userCity);
    }
  }

  return fallbackLocations.slice(0, limit).map((location, index) => ({
    ...location,
    category: 'location' as const,
    trend: 'stable' as const,
    searchQuery: location.name,
    priority: index + 1
  }));
}

function getFallbackTrendingSuggestions(limit: number): PopularSuggestion[] {
  const fallbackTrending = [
    { id: 'trending-regional', name: 'Regional Championship', count: 156 },
    { id: 'trending-spring', name: 'Spring Tournament', count: 89 },
    { id: 'trending-premier', name: 'Premier Event', count: 67 },
    { id: 'trending-league', name: 'League Cup', count: 45 },
  ];

  return fallbackTrending.slice(0, limit).map((trending, index) => ({
    ...trending,
    category: 'trending' as const,
    trend: 'up' as const,
    searchQuery: trending.name,
    priority: index + 1
  }));
}