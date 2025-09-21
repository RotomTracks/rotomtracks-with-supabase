'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Calendar, MapPin, Trophy, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTournamentSearch } from '@/lib/hooks/useTournamentSearch';
import { TournamentType, TournamentStatus, TournamentSearchParams } from '@/lib/types/tournament';

interface TournamentSearchProps {
  onTournamentSelect?: (tournamentId: string) => void;
  showFilters?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TournamentSearch({
  onTournamentSelect,
  showFilters = true,
  placeholder = "Buscar torneos por nombre, ciudad o tipo...",
  autoFocus = false
}: TournamentSearchProps) {
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
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
            className="pl-10 pr-10 py-3 text-lg"
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
        {(showSuggestions || tournaments.length > 0 || (!loading && !suggestionsLoading && query.length >= 2)) && (
          <div 
            id="search-suggestions"
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
            role="listbox"
            aria-label="Search suggestions and results"
          >
            {/* Loading State */}
            {(suggestionsLoading || loading) && (
              <div className="p-4 text-center text-gray-500" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="sr-only">
                  {suggestionsLoading ? 'Cargando sugerencias' : 'Buscando torneos'}
                </span>
                <span aria-hidden="true">
                  {suggestionsLoading ? 'Buscando sugerencias...' : 'Buscando torneos...'}
                </span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && !suggestionsLoading && (
              <div className="p-4 bg-red-50 border-b border-red-200">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            {!loading && !suggestionsLoading && !error && (
              <>
                {/* Tournament Results - Priority 1 */}
                {tournaments.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b flex items-center justify-between">
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
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Trophy className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold text-base">{tournament.name}</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">
                              {tournament.city}, {tournament.country}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tournament.tournament_type} • {new Date(tournament.start_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-3">
                            <Badge variant={tournament.status === 'upcoming' ? 'default' : 'secondary'} className="text-xs">
                              {tournament.status === 'upcoming' ? 'Próximo' : 
                               tournament.status === 'ongoing' ? 'En curso' : 'Completado'}
                            </Badge>
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
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                              Búsquedas recientes
                            </div>
                            {recentSearches.map((search, index) => (
                              <button
                                key={`recent-${index}`}
                                id={`suggestion-${index}`}
                                onClick={() => handleSuggestionClick({ id: `recent-${search}`, name: search, category: 'recent' })}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 ${
                                  selectedSuggestionIndex === index ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                                }`}
                                role="option"
                                aria-selected={selectedSuggestionIndex === index}
                              >
                                <Search className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-medium">{search}</div>
                                  <div className="text-xs text-gray-500">Búsqueda reciente</div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Search Suggestions */}
                        {suggestions.length > 0 ? (
                          <>
                            {recentSearches.length > 0 && query.length < 2 && (
                              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
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
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3 transition-colors ${
                                    selectedSuggestionIndex === adjustedIndex ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                                  }`}
                                  role="option"
                                  aria-selected={selectedSuggestionIndex === adjustedIndex}
                                >
                                  {suggestion.category === 'tournament' && <Trophy className="h-4 w-4 text-blue-600" />}
                                  {suggestion.category === 'location' && <MapPin className="h-4 w-4 text-green-600" />}
                                  {suggestion.category === 'type' && <Calendar className="h-4 w-4 text-purple-600" />}
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{suggestion.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
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
                                    <Badge 
                                      variant={suggestion.status === 'upcoming' ? 'default' : 'secondary'}
                                      className="shrink-0"
                                    >
                                      {suggestion.status === 'upcoming' ? 'Próximo' : 'En curso'}
                                    </Badge>
                                  )}
                                </button>
                              );
                            })}
                          </>
                        ) : (
                          /* No suggestions found */
                          query.length >= 2 && !suggestionsLoading && (
                            <div className="p-6 text-center text-gray-500">
                              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="font-medium">No se encontraron sugerencias</p>
                              <p className="text-sm text-gray-400 mt-1">
                                Intenta con términos más generales
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
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Limpiar filtros ({activeFiltersCount})
            </Button>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            Filtros disponibles: tipo, estado, ubicación
          </div>
        </div>
      )}


    </div>
  );
}