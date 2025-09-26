'use client';

import { useEffect, useState } from 'react';
import { Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { Tournament, TournamentStatus } from '@/lib/types/tournament';
import { useTypedTranslation } from '@/lib/i18n';
import { User } from '@supabase/supabase-js';

interface UpcomingTournamentsProps {
  user?: User;
  userLocation?: string;
  limit?: number;
  onTournamentsChange?: (hasTournaments: boolean) => void;
}

export function UpcomingTournaments({ user, userLocation, limit = 6, onTournamentsChange }: UpcomingTournamentsProps) {
  const { tCommon, tTournaments, tUI } = useTypedTranslation();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notify parent component about tournament changes
  useEffect(() => {
    if (onTournamentsChange) {
      onTournamentsChange(tournaments.length > 0);
    }
  }, [tournaments.length, onTournamentsChange]);

  useEffect(() => {
    const fetchUpcomingTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams({
          limit: limit.toString(),
          status: TournamentStatus.UPCOMING,
          sort: 'asc'
        });
        
        if (userLocation) {
          // Extract city from location string (e.g., "Madrid" from "Madrid, España")
          const city = userLocation.split(',')[0].trim();
          params.append('city', city);
        }

        const response = await fetch(`/api/tournaments?${params}`);
        
        if (!response.ok) {
          let errorMessage = tTournaments('upcoming.error.loading');
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorMessage = tTournaments('upcoming.error.http', { status: response.status, statusText: response.statusText });
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setTournaments(data.data);
        } else {
          setTournaments([]);
        }
      } catch (err) {
        console.error('Error fetching upcoming tournaments:', err);
        const errorMessage = err instanceof Error ? err.message : tUI('status.unknown');
        setError(errorMessage);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingTournaments();
  }, [userLocation, limit, tCommon, tTournaments, tUI]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{tTournaments('upcoming.title')}</h2>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="w-full h-4 bg-gray-200 rounded mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">{tTournaments('upcoming.error.title')}</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground mt-4"
        >
          {tUI('buttons.retry')}
        </button>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-gray-700 rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-gray-600 text-center">
        <div className="bg-blue-100 dark:bg-blue-800/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-200 dark:border-blue-700">
          <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {tTournaments('upcoming.empty.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          {userLocation 
            ? tTournaments('upcoming.empty.descriptionWithLocation', { location: userLocation })
            : tTournaments('upcoming.empty.description')
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/tournaments'}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-blue-600 text-black hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-white dark:hover:bg-blue-400 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 p-2"
          >
            {tTournaments('upcoming.actions.viewAll')}
          </button>
          {user && (
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {tTournaments('upcoming.actions.create')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {tTournaments('upcoming.title')}
            {userLocation && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                {tTournaments('upcoming.inLocation', { location: userLocation })}
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            {tTournaments('upcoming.subtitle')}
          </p>
        </div>
        
        <button 
          onClick={() => window.location.href = '/tournaments'}
          className="hidden sm:inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 bg-transparent"
        >
          {tTournaments('upcoming.actions.viewAll')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <TournamentCard 
            key={tournament.id} 
            tournament={{...tournament, official_tournament_id: tournament.id} as Tournament}
            viewMode="grid"
            userRole="authenticated"
          />
        ))}
      </div>

      {tournaments.length >= limit && (
        <div className="text-center pt-6">
          <button 
            onClick={() => window.location.href = '/tournaments'}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
          >
            {tTournaments('upcoming.actions.viewAll')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}