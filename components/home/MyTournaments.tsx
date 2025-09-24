'use client';

import { useEffect, useState } from 'react';
import { Calendar, Trophy, Users, Clock, MapPin, ArrowRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { TournamentStatus } from '@/lib/types/tournament';
import { useTypedTranslation } from '@/lib/i18n';

interface UserTournament {
  id: string;
  name: string;
  tournament_type: string;
  location: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  role: 'participant' | 'organizer';
  registration_status?: 'registered' | 'waitlist' | 'confirmed';
  participant_count?: number;
  max_participants?: number;
}

export function MyTournaments() {
  const { tPages } = useTypedTranslation();
  const { user, profile } = useAuth();
  const [tournaments, setTournaments] = useState<UserTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTournaments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/tournaments/user');
        
        if (!response.ok) {
          let errorMessage = 'Error al cargar tus torneos';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform the API response to match our component's expected format
          const transformedTournaments = data.data.tournaments.map((tournament: any) => ({
            id: tournament.id,
            name: tournament.name,
            tournament_type: tournament.tournament_type,
            location: `${tournament.city}, ${tournament.country}`,
            date: tournament.start_date,
            status: tournament.status === TournamentStatus.UPCOMING ? 'upcoming' : 
                   tournament.status === TournamentStatus.ONGOING ? 'ongoing' : 'completed',
            role: tournament.user_role,
            registration_status: tournament.registration_status,
            participant_count: tournament.current_players,
            max_participants: tournament.max_players
          }));
          
          setTournaments(transformedTournaments);
        } else {
          setTournaments([]);
        }
        
      } catch (err) {
        console.error('Error fetching user tournaments:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTournaments();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Próximo</Badge>;
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">En curso</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Badge className="bg-purple-100 text-purple-800">Organizador</Badge>;
      case 'participant':
        return <Badge className="bg-orange-100 text-orange-800">Participante</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Inicia sesión para ver tus torneos
        </h3>
        <p className="text-gray-600 mb-6">
          Accede a tu cuenta para ver los torneos en los que participas u organizas
        </p>
        <Button 
          onClick={() => {
            // This will be handled by the parent component
            window.dispatchEvent(new CustomEvent('openLoginModal'));
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="w-full h-4 bg-gray-200 rounded mb-3"></div>
              <div className="w-3/4 h-3 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="w-16 h-5 bg-gray-200 rounded"></div>
                <div className="w-20 h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
        <div className="text-red-500 mb-4">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">Error al cargar tus torneos</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 text-center border border-gray-100 dark:border-gray-600">
        <div className="bg-green-100 dark:bg-green-800/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200 dark:border-green-700">
          <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {tPages('home.myTournaments.empty.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          {profile?.user_role === 'organizer' 
            ? tPages('home.myTournaments.empty.description.organizer')
            : tPages('home.myTournaments.empty.description.participant')
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/tournaments'}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent px-4 py-2"
          >
            <Trophy className="w-4 h-4" />
            {tPages('home.myTournaments.searchTournaments')}
          </button>
          
          {profile?.user_role === 'organizer' && (
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
{tPages('home.myTournaments.createTournament')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tPages('home.myTournaments.title')}</h3>
        </div>
        
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 bg-transparent"
        >
          {tPages('home.myTournaments.viewAll')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournaments.map((tournament) => (
          <div 
            key={tournament.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
            onClick={() => window.location.href = `/tournaments/${tournament.id}`}
          >
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {tournament.name}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{tournament.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(tournament.date)}</span>
            </div>

            <div className="flex items-center justify-between">
              {getStatusBadge(tournament.status)}
              {getRoleBadge(tournament.role)}
            </div>

            {tournament.role === 'participant' && tournament.registration_status && (
              <div className="mt-2 text-xs text-gray-500">
                Estado: {tournament.registration_status === 'registered' ? 'Registrado' : 
                        tournament.registration_status === 'confirmed' ? 'Confirmado' : 'En lista de espera'}
              </div>
            )}

            {tournament.role === 'organizer' && tournament.participant_count !== undefined && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>
                  {tournament.participant_count}
                  {tournament.max_participants && `/${tournament.max_participants}`} participantes
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {tournaments.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 bg-transparent"
          >
            Ver Dashboard Completo
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
}