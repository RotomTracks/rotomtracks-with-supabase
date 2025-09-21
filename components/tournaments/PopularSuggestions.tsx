'use client';

/**
 * Popular suggestions component for when search input is empty
 * Shows trending tournaments, popular locations, and tournament types
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, MapPin, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

interface PopularSuggestion {
  id: string;
  name: string;
  category: 'tournament_type' | 'location' | 'trending';
  count?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
  searchQuery?: string; // What to search for when clicked
  priority?: number; // For sorting suggestions
}

interface PopularSuggestionsProps {
  onSuggestionClick: (suggestion: PopularSuggestion) => void;
  className?: string;
  userLocation?: { city?: string; country?: string }; // For location-based suggestions
  maxSuggestions?: number; // Limit suggestions per category
}

interface SuggestionsCache {
  data: PopularSuggestion[];
  timestamp: number;
  userLocation?: string;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export function PopularSuggestions({ 
  onSuggestionClick, 
  className = '', 
  userLocation,
  maxSuggestions = 4 
}: PopularSuggestionsProps) {
  const { t } = useTranslation();
  const [popularSuggestions, setPopularSuggestions] = useState<PopularSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Cache management
  const getCacheKey = useCallback(() => {
    return `popular-suggestions-${userLocation?.city || 'global'}-${userLocation?.country || 'global'}`;
  }, [userLocation]);

  const getCachedSuggestions = useCallback((): SuggestionsCache | null => {
    try {
      const cached = localStorage.getItem(getCacheKey());
      if (!cached) return null;
      
      const parsedCache: SuggestionsCache = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(getCacheKey());
        return null;
      }
      
      return parsedCache;
    } catch {
      return null;
    }
  }, [getCacheKey]);

  const setCachedSuggestions = useCallback((suggestions: PopularSuggestion[]) => {
    try {
      const cache: SuggestionsCache = {
        data: suggestions,
        timestamp: Date.now(),
        userLocation: userLocation ? `${userLocation.city}, ${userLocation.country}` : undefined
      };
      localStorage.setItem(getCacheKey(), JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache suggestions:', error);
    }
  }, [getCacheKey, userLocation]);

  const fetchPopularSuggestions = useCallback(async () => {
    try {
      setError(null);
      
      // Check cache first
      const cached = getCachedSuggestions();
      if (cached) {
        setPopularSuggestions(cached.data);
        setLoading(false);
        return;
      }

      // Try to fetch from API
      try {
        const response = await fetch('/api/tournaments/popular', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userLocation,
            maxPerCategory: maxSuggestions 
          })
        });

        if (response.ok) {
          const apiSuggestions = await response.json();
          setPopularSuggestions(apiSuggestions);
          setCachedSuggestions(apiSuggestions);
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, using fallback data:', apiError);
      }

      // Fallback to enhanced static data
      const fallbackSuggestions = getFallbackSuggestions();
      setPopularSuggestions(fallbackSuggestions);
      setCachedSuggestions(fallbackSuggestions);
      
    } catch (error) {
      console.error('Error fetching popular suggestions:', error);
      setError(t('tournament.search.suggestionsError') || 'Error loading suggestions');
      
      // Use minimal fallback
      setPopularSuggestions(getMinimalFallback());
    } finally {
      setLoading(false);
    }
  }, [userLocation, maxSuggestions, getCachedSuggestions, setCachedSuggestions, t]);

  const getFallbackSuggestions = useCallback((): PopularSuggestion[] => {
    const baseTypes = [
      { 
        id: 'type-tcg-cup', 
        name: t('tournament.types.tcgLeagueCup') || 'TCG League Cup', 
        category: 'tournament_type' as const, 
        count: 45, 
        trend: 'up' as const, 
        icon: '🃏',
        searchQuery: 'TCG League Cup',
        priority: 1
      },
      { 
        id: 'type-vgc', 
        name: t('tournament.types.vgcPremier') || 'VGC Premier Event', 
        category: 'tournament_type' as const, 
        count: 32, 
        trend: 'up' as const, 
        icon: '🎮',
        searchQuery: 'VGC Premier',
        priority: 2
      },
      { 
        id: 'type-go', 
        name: t('tournament.types.pokemonGo') || 'Pokémon GO', 
        category: 'tournament_type' as const, 
        count: 28, 
        trend: 'stable' as const, 
        icon: '📱',
        searchQuery: 'Pokémon GO',
        priority: 3
      },
      { 
        id: 'type-prerelease', 
        name: t('tournament.types.prerelease') || 'Prerelease', 
        category: 'tournament_type' as const, 
        count: 15, 
        trend: 'down' as const, 
        icon: '📦',
        searchQuery: 'Prerelease',
        priority: 4
      }
    ];

    const baseLocations = [
      { 
        id: 'location-madrid', 
        name: 'Madrid', 
        category: 'location' as const, 
        count: 38, 
        trend: 'up' as const, 
        icon: '🏛️',
        searchQuery: 'Madrid',
        priority: 1
      },
      { 
        id: 'location-barcelona', 
        name: 'Barcelona', 
        category: 'location' as const, 
        count: 29, 
        trend: 'stable' as const, 
        icon: '🏖️',
        searchQuery: 'Barcelona',
        priority: 2
      },
      { 
        id: 'location-valencia', 
        name: 'Valencia', 
        category: 'location' as const, 
        count: 18, 
        trend: 'up' as const, 
        icon: '🍊',
        searchQuery: 'Valencia',
        priority: 3
      },
      { 
        id: 'location-sevilla', 
        name: 'Sevilla', 
        category: 'location' as const, 
        count: 12, 
        trend: 'stable' as const, 
        icon: '🌞',
        searchQuery: 'Sevilla',
        priority: 4
      }
    ];

    const baseTrending = [
      { 
        id: 'trending-regional', 
        name: t('tournament.trending.regional') || 'Regional Championship', 
        category: 'trending' as const, 
        count: 156, 
        trend: 'up' as const,
        searchQuery: 'Regional Championship',
        priority: 1
      },
      { 
        id: 'trending-spring', 
        name: t('tournament.trending.spring') || 'Spring Tournament', 
        category: 'trending' as const, 
        count: 89, 
        trend: 'up' as const,
        searchQuery: 'Spring Tournament',
        priority: 2
      }
    ];

    // Prioritize user's location if available
    let locations = [...baseLocations];
    if (userLocation?.city) {
      const userCityLower = userLocation.city.toLowerCase();
      const userLocationIndex = locations.findIndex(loc => 
        loc.name.toLowerCase() === userCityLower
      );
      
      if (userLocationIndex > 0) {
        // Move user's city to the top
        const userCity = locations.splice(userLocationIndex, 1)[0];
        userCity.priority = 0;
        locations.unshift(userCity);
      }
    }

    return [...baseTypes, ...locations, ...baseTrending];
  }, [userLocation, t]);

  const getMinimalFallback = (): PopularSuggestion[] => [
    { 
      id: 'fallback-tcg', 
      name: 'TCG', 
      category: 'tournament_type', 
      icon: '🃏',
      searchQuery: 'TCG',
      priority: 1
    },
    { 
      id: 'fallback-vgc', 
      name: 'VGC', 
      category: 'tournament_type', 
      icon: '🎮',
      searchQuery: 'VGC',
      priority: 2
    }
  ];

  useEffect(() => {
    fetchPopularSuggestions();
  }, [fetchPopularSuggestions]);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case 'tournament_type': return <Trophy className="h-4 w-4 text-blue-600" />;
      case 'location': return <MapPin className="h-4 w-4 text-green-600" />;
      case 'trending': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  const getCategoryLabel = useCallback((category: string) => {
    switch (category) {
      case 'tournament_type': return t('tournament.categories.tournamentType') || 'Tipo de Torneo';
      case 'location': return t('tournament.categories.location') || 'Ubicación';
      case 'trending': return t('tournament.categories.trending') || 'Tendencia';
      default: return category;
    }
  }, [t]);

  const getTrendIcon = useCallback((trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const suggestions = Object.values(groupedSuggestions).flat();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  }, [selectedIndex, onSuggestionClick]);

  const handleSuggestionClick = useCallback((suggestion: PopularSuggestion) => {
    // Track click for analytics (if available)
    try {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'suggestion_click', {
          suggestion_id: suggestion.id,
          suggestion_category: suggestion.category,
          suggestion_name: suggestion.name
        });
      }
    } catch (error) {
      // Ignore analytics errors
    }
    
    onSuggestionClick(suggestion);
  }, [onSuggestionClick]);

  // Memoized grouped suggestions with sorting
  const groupedSuggestions = useMemo(() => {
    return popularSuggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category].push(suggestion);
      return acc;
    }, {} as Record<string, PopularSuggestion[]>);
  }, [popularSuggestions]);

  // Sort categories by priority
  const sortedCategories = useMemo(() => {
    const categoryOrder = ['tournament_type', 'location', 'trending'];
    return Object.entries(groupedSuggestions)
      .sort(([a], [b]) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      })
      .map(([category, suggestions]) => [
        category,
        suggestions
          .sort((a, b) => (a.priority || 999) - (b.priority || 999))
          .slice(0, maxSuggestions)
      ] as [string, PopularSuggestion[]]);
  }, [groupedSuggestions, maxSuggestions]);

  if (loading) {
    return (
      <div className={`p-4 ${className}`} role="status" aria-label={t('common.loading') || 'Loading...'}>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                <div className="w-20 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchPopularSuggestions}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {t('common.retry') || 'Retry'}
        </button>
      </div>
    );
  }

  if (popularSuggestions.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">{t('tournament.search.noSuggestions') || 'No suggestions available'}</p>
      </div>
    );
  }

  return (
    <div 
      className={`${className}`}
      role="listbox"
      aria-label={t('tournament.search.popularSuggestions') || 'Popular tournament suggestions'}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {sortedCategories.map(([category, suggestions], categoryIndex) => (
        <div key={category}>
          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b flex items-center gap-2">
            {getCategoryIcon(category)}
            <span>{getCategoryLabel(category)}</span>
            {suggestions.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {suggestions.length}
              </Badge>
            )}
          </div>
          
          {suggestions.map((suggestion, suggestionIndex) => {
            const globalIndex = sortedCategories
              .slice(0, categoryIndex)
              .reduce((acc, [, sug]) => acc + sug.length, 0) + suggestionIndex;
            
            const isSelected = selectedIndex === globalIndex;
            
            return (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                role="option"
                aria-selected={isSelected}
                aria-label={`${suggestion.name}, ${getCategoryLabel(suggestion.category)}${
                  suggestion.count ? `, ${suggestion.count} ${t('tournament.search.tournaments') || 'tournaments'}` : ''
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                  <span className="text-sm" role="img" aria-hidden="true">
                    {suggestion.icon || '🏆'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{getCategoryLabel(suggestion.category)}</span>
                    {suggestion.count && (
                      <>
                        <span>•</span>
                        <span>
                          {suggestion.count} {t('tournament.search.tournaments') || 'torneos'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  {suggestion.trend && (
                    <div title={t(`tournament.trends.${suggestion.trend}`) || suggestion.trend}>
                      {getTrendIcon(suggestion.trend)}
                    </div>
                  )}
                  {suggestion.count && (
                    <span className="text-xs text-gray-500 ml-1">
                      {suggestion.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ))}
      
      {/* Quick tip */}
      <div className="px-4 py-3 bg-blue-50 border-t text-center">
        <p className="text-xs text-blue-600">
          💡 {t('tournament.search.tip') || 'Tip: Escribe al menos 2 caracteres para ver sugerencias personalizadas'}
        </p>
      </div>
    </div>
  );
}