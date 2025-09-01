'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Grid,
  List
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TournamentFilters } from './TournamentFilters';
import { TournamentCard } from './TournamentCard';
import { useTypedTranslation } from '@/lib/i18n';

interface Tournament {
  id: string;
  name: string;
  tournament_type: string;
  city: string;
  country: string;
  start_date: string;
  end_date?: string;
  status: string;
  current_players: number;
  max_players?: number;
  registration_open: boolean;
  organizer_id: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface TournamentListProps {
  tournaments: Tournament[];
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
  userRole: 'authenticated' | 'guest';
}

export function TournamentList({
  tournaments,
  totalTournaments,
  currentPage,
  totalPages,
  searchParams,
  userRole
}: TournamentListProps) {
  const { tTournaments } = useTypedTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.location || '');
  
  const router = useRouter();
  const currentSearchParams = useSearchParams();

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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
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
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {tTournaments('list.filters')}
              </Button>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
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
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={tTournaments('list.cityOrCountry')}
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
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
          <h2 className="text-xl font-semibold text-gray-900">
            {tTournaments('list.tournamentsFound', { count: totalTournaments })}
          </h2>
          {hasActiveFilters && (
            <p className="text-sm text-gray-600 mt-1">
              {tTournaments('list.showingFilteredResults')}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{tTournaments('list.sortBy')}</span>
          <select
            value={searchParams.sort || 'date'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border rounded px-3 py-1 bg-white"
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
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              viewMode={viewMode}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tTournaments('list.noTournamentsFound')}
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters 
                ? tTournaments('list.tryAdjustingFilters')
                : tTournaments('list.noTournamentsAvailable')
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>
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
    </div>
  );
}