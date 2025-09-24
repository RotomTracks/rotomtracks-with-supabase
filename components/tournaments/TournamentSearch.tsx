'use client';

// React
import { useState, useEffect, useRef } from 'react';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { Search, Filter, Calendar, MapPin, Trophy, X } from 'lucide-react';

// Hooks
import { useTournamentSearch } from '@/lib/hooks/useTournamentSearch';
import { useTypedTranslation } from '@/lib/i18n';

// Types
import { 
  TournamentType, 
  TournamentStatus, 
  TournamentSearchParams,
  UserRole
} from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  getStatusColor,
  getStatusText
} from '@/lib/utils/tournament-status';

interface TournamentSearchProps {
  onTournamentSelect?: (tournamentId: string) => void;
  showFilters?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  userRole?: UserRole;
  loading?: boolean;
  error?: string | null;
}

export function TournamentSearch({
  onTournamentSelect,
  showFilters = true,
  placeholder,
  autoFocus = false,
  loading: externalLoading = false,
  error: externalError = null
}: TournamentSearchProps) {
  // Hooks
  const { tTournaments, tUI } = useTypedTranslation();
  const { formatDate } = useTournamentFormatting();  
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    tournament_type: TournamentType | '';
    status: TournamentStatus | '';
    city: string;
    country: string;
    registration_open: string;
  }>({
    tournament_type: '',
    status: '',
    city: '',
    country: '',
    registration_open: ''
  });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Placeholder responsive usando CSS
  const mobilePlaceholder = tTournaments('search.placeholder.mobile');
  const desktopPlaceholder = placeholder || tTournaments('search.placeholder.desktop');
  
  const {
    tournaments,
    loading,
    error,
    total,
    suggestions,
    suggestionsLoading,
    search,
    getSuggestions,
    reset
  } = useTournamentSearch();
  
  // Use external loading/error states if provided
  const isLoading = externalLoading || loading;
  const currentError = externalError || error;

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tournament-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('tournament-recent-searches', JSON.stringify(updated));
  };

  // Handle search input changes with adaptive debouncing
  useEffect(() => {
    // Adaptive debouncing: shorter delay for longer queries
    const delay = query.length <= 3 ? 400 : query.length <= 6 ? 250 : 150;
    
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        getSuggestions(query);
        setShowSuggestions(true);
      } else if (query.length === 0 && recentSearches.length > 0) {
        // Show recent searches when input is empty
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, getSuggestions, recentSearches.length]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = () => {
    const searchParams: TournamentSearchParams = {
      query: query.trim(),
      limit: 20,
      offset: 0
    };

    // Add non-empty filters
    if (filters.tournament_type) searchParams.tournament_type = filters.tournament_type as TournamentType;
    if (filters.status) searchParams.status = filters.status as TournamentStatus;
    if (filters.city) searchParams.city = filters.city;
    if (filters.country) searchParams.country = filters.country;

    search(searchParams);
    // Keep dropdown open to show results
    // setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.category === 'tournament') {
      saveRecentSearch(query);
      if (onTournamentSelect) {
        onTournamentSelect(suggestion.id);
      } else {
        // Default navigation behavior
        window.location.href = `/tournaments/${suggestion.id}`;
      }
    } else if (suggestion.category === 'location') {
      const [city, country] = suggestion.name.split(', ');
      setFilters(prev => ({ ...prev, city, country }));
      setQuery('');
      saveRecentSearch(query);
    } else if (suggestion.category === 'type') {
      setFilters(prev => ({ ...prev, tournament_type: suggestion.name }));
      setQuery('');
      saveRecentSearch(query);
    } else if (suggestion.category === 'recent') {
      setQuery(suggestion.name);
      getSuggestions(suggestion.name);
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const allSuggestions = [
      ...recentSearches.map(search => ({ id: `recent-${search}`, name: search, category: 'recent' })),
      ...suggestions
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && allSuggestions[selectedSuggestionIndex]) {
          handleSuggestionClick(allSuggestions[selectedSuggestionIndex]);
        } else if (query.length >= 2) {
          // Perform search with current query
          saveRecentSearch(query);
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };



  const clearFilters = () => {
    setFilters({
      tournament_type: '',
      status: '',
      city: '',
      country: '',
      registration_open: ''
    });
    setQuery('');
    reset();
    setShowSuggestions(false);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  // Get tournament status badge using centralized utilities
  const getTournamentStatusBadge = (status: TournamentStatus) => {
    return (
      <Badge className={getStatusColor(status)}>
        {getStatusText(status)}
      </Badge>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="w-full max-w-4xl mx-auto" role="status" aria-label="Loading tournament search">
      <div className="relative">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          {showFilters && (
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          )}
        </div>
      </div>
      <span className="sr-only">Loading tournament search...</span>
    </div>
  );

  if (externalLoading) return renderLoadingState();

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={desktopPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.length >= 2) {
                setShowSuggestions(true);
              } else if (recentSearches.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="pl-10 pr-10 py-3 text-base sm:text-lg rounded-xl bg-white dark:bg-gray-900 placeholder:text-sm sm:placeholder:text-base responsive-placeholder"
            style={{
              '--mobile-placeholder': `"${mobilePlaceholder}"`,
              '--desktop-placeholder': `"${desktopPlaceholder}"`
            } as React.CSSProperties}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-describedby="search-suggestions"
            role="combobox"
            aria-activedescendant={
              selectedSuggestionIndex >= 0 
                ? `suggestion-${selectedSuggestionIndex}` 
                : undefined
            }
          />
          {/* Clear button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                reset();
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {/* Loading indicator */}
          {loading && !query && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Suggestions and Results Dropdown */}
        {(showSuggestions || tournaments.length > 0 || (!isLoading && !suggestionsLoading && query.length >= 2)) && (
          <div 
            id="search-suggestions"
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-96 overflow-y-auto"
            role="listbox"
            aria-label="Search suggestions and results"
          >
            {/* Loading State */}
            {(suggestionsLoading || isLoading) && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="sr-only">
                  {suggestionsLoading ? 'Loading suggestions' : 'Searching tournaments'}
                </span>
                <span aria-hidden="true">
                  {suggestionsLoading ? 'Loading suggestions...' : 'Searching tournaments...'}
                </span>
              </div>
            )}

            {/* Error State */}
            {currentError && !isLoading && !suggestionsLoading && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800" role="alert">
                <div className="text-red-700 dark:text-red-400 text-sm">{currentError}</div>
              </div>
            )}

            {!isLoading && !suggestionsLoading && !currentError && (
              <>
                {/* Tournament Results - Priority 1 */}
                {tournaments.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 flex items-center justify-between">
                      <span>Resultados de búsqueda</span>
                      <span>{total} torneo{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</span>
                    </div>
                    {tournaments.map((tournament) => (
                      <button
                        key={tournament.id}
                        onClick={() => {
                          if (onTournamentSelect) {
                            onTournamentSelect(tournament.id);
                          } else {
                            window.location.href = `/tournaments/${tournament.id}`;
                          }
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Trophy className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold text-base dark:text-gray-100">{tournament.name}</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                              {tournament.city}, {tournament.country}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {tournament.tournament_type.replace(/_/g, ' ')} • {formatDate(tournament.start_date, 'short')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-3">
                            {getTournamentStatusBadge(tournament.status as TournamentStatus)}
                            {tournament.registration_open && (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                Inscripciones abiertas
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Suggestions Mode - Priority 2 */}
                    {showSuggestions ? (
                      <>
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && query.length < 2 && (
                          <>
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                              Búsquedas recientes
                            </div>
                            {recentSearches.map((search, index) => (
                              <button
                                key={`recent-${index}`}
                                id={`suggestion-${index}`}
                                onClick={() => handleSuggestionClick({ id: `recent-${search}`, name: search, category: 'recent' })}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 flex items-center gap-3 ${
                                  selectedSuggestionIndex === index ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' : ''
                                }`}
                                role="option"
                                aria-selected={selectedSuggestionIndex === index}
                              >
                                <Search className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-medium dark:text-gray-100">{search}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{tTournaments('search.recentSearch')}</div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Search Suggestions */}
                        {suggestions.length > 0 ? (
                          <>
                            {recentSearches.length > 0 && query.length < 2 && (
                              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                Sugerencias
                              </div>
                            )}
                            {suggestions.map((suggestion, index) => {
                              const adjustedIndex = query.length < 2 ? recentSearches.length + index : index;
                              const getCategoryLabel = (category: string) => {
                                switch (category) {
                                  case 'tournament': return 'Torneo';
                                  case 'location': return 'Ubicación';
                                  case 'type': return 'Tipo';
                                  default: return category;
                                }
                              };
                              
                              return (
                                <button
                                  key={suggestion.id}
                                  id={`suggestion-${adjustedIndex}`}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center gap-3 transition-colors ${
                                    selectedSuggestionIndex === adjustedIndex ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' : ''
                                  }`}
                                  role="option"
                                  aria-selected={selectedSuggestionIndex === adjustedIndex}
                                >
                                  {suggestion.category === 'tournament' && <Trophy className="h-4 w-4 text-blue-600" />}
                                  {suggestion.category === 'location' && <MapPin className="h-4 w-4 text-green-600" />}
                                  {suggestion.category === 'type' && <Calendar className="h-4 w-4 text-purple-600" />}
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate dark:text-gray-100">{suggestion.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{getCategoryLabel(suggestion.category)}</span>
                                      {suggestion.location && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate">{suggestion.location}</span>
                                        </>
                                      )}
                                      {suggestion.type && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate">{suggestion.type}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {suggestion.category === 'tournament' && suggestion.status && (
                                    <div className="shrink-0">
                                      {getTournamentStatusBadge(suggestion.status as TournamentStatus)}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </>
                        ) : (
                          /* No suggestions found */
                          query.length >= 2 && !suggestionsLoading && (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="font-medium">{tTournaments('search.noSuggestions')}</p>
                              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
{tTournaments('search.tryGeneralTerms')}
                              </p>
                            </div>
                          )
                        )}
                      </>
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {tUI('buttons.search')}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              {tUI('buttons.clearFilters')} ({activeFiltersCount})
            </Button>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Filter className="h-4 w-4" />
            Filtros disponibles: tipo, estado, ubicación
          </div>
        </div>
      )}


    </div>
  );
}