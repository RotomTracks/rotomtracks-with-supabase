'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Trophy, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TournamentCard } from '@/components/tournaments/TournamentCard';

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

interface UpcomingTournamentsProps {
  userLocation?: string;
  limit?: number;
}

export function UpcomingTournaments({ userLocation, limit = 6 }: UpcomingTournamentsProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingTournaments = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams({
          limit: limit.toString(),
          status: 'upcoming',
          sort: 'date_asc'
        });
        
        if (userLocation) {
          params.append('location', userLocation);
        }

        const response = await fetch(`/api/tournaments/search?${params}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar torneos próximos');
        }

        const data = await response.json();
        setTournaments(data.tournaments || []);
      } catch (err) {
        console.error('Error fetching upcoming tournaments:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingTournaments();
  }, [userLocation, limit]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Próximos Torneos</h2>
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
          <p className="text-lg font-medium">Error al cargar torneos</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay torneos próximos
        </h3>
        <p className="text-gray-600 mb-6">
          {userLocation 
            ? `No encontramos torneos próximos en ${userLocation}. Prueba expandir tu búsqueda.`
            : 'No hay torneos programados en este momento. ¡Vuelve pronto!'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.location.href = '/tournaments'}
            variant="outline"
          >
            Ver todos los torneos
          </Button>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Crear torneo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Próximos Torneos
            {userLocation && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                en {userLocation}
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Encuentra torneos cerca de ti y regístrate
          </p>
        </div>
        
        <Button 
          onClick={() => window.location.href = '/tournaments'}
          variant="outline"
          className="hidden sm:flex items-center gap-2"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <TournamentCard 
            key={tournament.id} 
            tournament={tournament}
            viewMode="grid"
            userRole="authenticated"
          />
        ))}
      </div>

      {tournaments.length >= limit && (
        <div className="text-center pt-6">
          <Button 
            onClick={() => window.location.href = '/tournaments'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Ver todos los torneos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}