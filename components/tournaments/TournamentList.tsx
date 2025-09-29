'use client';

// React
import { useState } from 'react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Icons
import { 
  Search, 
  MapPin, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Grid,
  List
} from 'lucide-react';

// Next.js
import { useRouter, useSearchParams } from 'next/navigation';

// Components
import { TournamentFilters } from './TournamentFilters';
import { TournamentCard } from './TournamentCard';
import { TournamentDetailsModal } from './TournamentDetailsModal';
import { useTournamentModal } from './useTournamentModal';

// Types
import { 
  TournamentWithOrganizer,
  UserRole} from '@/lib/types/tournament';

// Hooks and Utilities
import { useTypedTranslation } from '@/lib/i18n';
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';

interface TournamentListProps {
  tournaments: TournamentWithOrganizer[];
  totalTournaments: number;
  currentPage: number;
  totalPages: number;
  searchParams: {
    q?: string;
    location?: string;
    type?: string;
    status?: string;
    page?: string;
    sort?: string;
  };
  userRole: UserRole | 'authenticated' | 'guest';
  loading?: boolean;
  error?: string | null;
}

export function TournamentList({
  tournaments,
  totalTournaments,
  currentPage,
  totalPages,
  searchParams,
  userRole,
  loading = false,
  error = null
}: TournamentListProps) {
  // Hooks
  const { tTournaments } = useTypedTranslation();
  useTournamentFormatting();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const { selectedTournament, isModalOpen, openModal, closeModal } = useTournamentModal();
  
  // State
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.location || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ q: searchQuery, location: locationQuery, page: '1' });
  };

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/tournaments?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const handleSortChange = (sort: string) => {
    updateSearchParams({ sort, page: '1' });
  };

  const clearFilters = () => {
    router.push('/tournaments');
    setSearchQuery('');
    setLocationQuery('');
  };

  const hasActiveFilters = searchParams.q || searchParams.location || searchParams.type || searchParams.status;

  // Render loading state
  const renderLoadingState = () => (
    <div className="space-y-6" role="status" aria-label={tTournaments('list.loading')}>
      <Card className="bg-gray-50 dark:bg-gray-800 border-0">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
      <span className="sr-only">{tTournaments('list.loading')}</span>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <Card className="bg-gray-50 dark:bg-gray-800 border-0">
      <CardContent className="text-center py-12" role="alert">
        <div className="text-red-500 text-lg font-medium mb-2">
          {tTournaments('list.errorLoading')}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          {tTournaments('list.tryAgain')}
        </Button>
      </CardContent>
    </Card>
  );

  // Early returns for loading and error states
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>{tTournaments('list.searchTournaments')}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white dark:bg-gray-700"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {tTournaments('list.filters')}
              </Button>
              <div className="flex border rounded-lg" role="group" aria-label={tTournaments('list.changeView')}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-r-none ${viewMode === 'grid' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  aria-label={tTournaments('list.gridView')}
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-l-none ${viewMode === 'list' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  aria-label={tTournaments('list.listView')}
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={tTournaments('list.searchByName')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700"
                  aria-label={tTournaments('list.searchByNameAria')}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={tTournaments('list.cityOrCountry')}
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700"
                  aria-label={tTournaments('list.searchByLocationAria')}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  {tTournaments('list.search')}
                </Button>
                {hasActiveFilters && (
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    {tTournaments('list.clear')}
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <TournamentFilters
              searchParams={searchParams}
              onFilterChange={updateSearchParams}
            />
          )}
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {totalTournaments === 1 
              ? tTournaments('list.tournamentsFoundOne', { count: totalTournaments })
              : tTournaments('list.tournamentsFoundOther', { count: totalTournaments })
            }
          </h2>
          {hasActiveFilters && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {tTournaments('list.showingFilteredResults')}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">{tTournaments('list.sortBy')}</span>
          <select
            value={searchParams.sort || 'date'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border rounded px-3 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-label={tTournaments('list.sortByAria')}
          >
            <option value="date">{tTournaments('list.date')}</option>
            <option value="name">{tTournaments('list.name')}</option>
            <option value="players">{tTournaments('list.players')}</option>
            <option value="location">{tTournaments('list.location')}</option>
          </select>
        </div>
      </div>

      {/* Tournament Grid/List */}
      {tournaments.length > 0 ? (
        <div 
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }
          role="list"
          aria-label={tTournaments('list.tournamentsList')}
        >
          {tournaments.map((tournament) => (
            <div key={tournament.id} role="listitem">
              <TournamentCard
                tournament={tournament}
                viewMode={viewMode}
                userRole={userRole}
                showActions={true}
                onViewDetails={openModal}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 dark:bg-gray-800 border-0">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {tTournaments('list.noTournamentsFound')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? tTournaments('list.tryAdjustingFilters')
                : tTournaments('list.noTournamentsAvailable')
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} aria-label={tTournaments('list.clearAllFilters')}>
                {tTournaments('list.clearFilters')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (page > totalPages) return null;
            
            return (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Tournament Details Modal */}
      <TournamentDetailsModal
        tournament={selectedTournament}
        isOpen={isModalOpen}
        onClose={closeModal}
        userRole={userRole}
      />
    </div>
  );
}