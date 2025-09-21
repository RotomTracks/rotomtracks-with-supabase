'use client';

// React
import { useState, useEffect } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  Settings,
  BarChart3,
  Filter,
  Search,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

// Next.js
import Link from 'next/link';

// Local Components
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { CreateTournamentButton } from '@/components/tournaments/CreateTournamentButton';

// Hooks
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

// Types
import { 
  Tournament, 
  TournamentType, 
  TournamentStatus,
  UserRole,
  ParticipantStatus,
  LoadingState
} from '@/lib/types/tournament';

// Utilities
import { useTournamentFormatting } from '@/lib/utils/tournament-formatting';
import { 
  TournamentStatusManager,
  getStatusColor,
  getStatusText,
  STATUS_TRANSLATIONS
} from '@/lib/utils/tournament-status';

interface UserTournament extends Tournament {
  user_role: 'participant' | 'organizer';
  registration_status?: ParticipantStatus;
  registration_date?: string;
}

interface TournamentDashboardProps {
  user: any;
  loading?: boolean;
  error?: string | null;
}

export function TournamentDashboard({ 
  user, 
  loading: externalLoading = false, 
  error: externalError = null 
}: TournamentDashboardProps) {
  // Hooks
  const { t } = useTranslation();
  const { formatDate, formatTime, formatDateTime } = useTournamentFormatting();
  
  // State
  const [tournaments, setTournaments] = useState<UserTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const userRole = user?.user_profiles?.user_role || 'player';
  const isOrganizer = userRole === 'organizer';

  useEffect(() => {
    fetchUserTournaments();
  }, [user]);

  const fetchUserTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll use mock data
      // In production, this would fetch from /api/tournaments/user
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTournaments: UserTournament[] = [
        {
          id: '1',
          official_tournament_id: '24-04-000247',
          name: 'Regional Championship Madrid 2024',
          tournament_type: TournamentType.VGC_PREMIER_EVENT,
          city: 'Madrid',
          country: 'España',
          start_date: '2024-04-15T10:00:00Z',
          end_date: '2024-04-15T18:00:00Z',
          status: TournamentStatus.UPCOMING,
          current_players: 89,
          max_players: 120,
          registration_open: true,
          organizer_id: isOrganizer ? user.id : 'other-organizer',
          user_role: isOrganizer ? 'organizer' : 'participant',
          registration_status: isOrganizer ? undefined : 'confirmed',
          registration_date: isOrganizer ? undefined : '2024-03-01T10:00:00Z',
          description: 'El campeonato regional más importante de Madrid',
          created_at: '2024-02-01T10:00:00Z',
          updated_at: '2024-03-25T10:00:00Z'
        },
        {
          id: '2',
          official_tournament_id: '24-03-000156',
          name: 'TCG League Cup Barcelona',
          tournament_type: TournamentType.TCG_LEAGUE_CUP,
          city: 'Barcelona',
          country: 'España',
          start_date: '2024-03-20T09:00:00Z',
          end_date: '2024-03-20T17:00:00Z',
          status: TournamentStatus.COMPLETED,
          current_players: 64,
          max_players: 80,
          registration_open: false,
          organizer_id: isOrganizer ? user.id : 'other-organizer',
          user_role: isOrganizer ? 'organizer' : 'participant',
          registration_status: isOrganizer ? undefined : 'confirmed',
          registration_date: isOrganizer ? undefined : '2024-02-15T10:00:00Z',
          description: 'Liga Cup oficial de TCG en Barcelona',
          created_at: '2024-02-10T10:00:00Z',
          updated_at: '2024-03-20T17:00:00Z'
        },
        {
          id: '3',
          official_tournament_id: '24-05-000089',
          name: 'Pokémon GO Community Day Valencia',
          tournament_type: TournamentType.GO_PREMIER_EVENT,
          city: 'Valencia',
          country: 'España',
          start_date: '2024-05-05T11:00:00Z',
          end_date: '2024-05-05T16:00:00Z',
          status: TournamentStatus.UPCOMING,
          current_players: 32,
          max_players: 50,
          registration_open: true,
          organizer_id: isOrganizer ? 'other-organizer' : user.id,
          user_role: 'participant',
          registration_status: 'registered',
          registration_date: '2024-04-01T10:00:00Z',
          description: 'Community Day especial en Valencia',
          created_at: '2024-03-15T10:00:00Z',
          updated_at: '2024-04-01T10:00:00Z'
        }
      ];

      // Filter based on user role
      const userTournaments = mockTournaments.filter(tournament => {
        if (isOrganizer) {
          // Show tournaments user organizes + tournaments user participates in
          return tournament.organizer_id === user.id || tournament.user_role === 'participant';
        } else {
          // Show only tournaments user participates in
          return tournament.user_role === 'participant';
        }
      });

      setTournaments(userTournaments);
    } catch (err) {
      console.error('Error fetching user tournaments:', err);
      setError('Error al cargar los torneos');
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        tournament.name.toLowerCase().includes(query) ||
        tournament.city.toLowerCase().includes(query) ||
        tournament.tournament_type.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && tournament.status !== statusFilter) {
      return false;
    }

    // Tab filter
    if (activeTab === 'organizing' && tournament.user_role !== 'organizer') {
      return false;
    }
    if (activeTab === 'participating' && tournament.user_role !== 'participant') {
      return false;
    }

    return true;
  });

  // Utility functions using centralized status management
  const getStatusIcon = (status: string) => {
    const statusConfig = TournamentStatusManager.getTournamentStatusConfig(status as TournamentStatus);
    return statusConfig.icon;
  };

  const getRegistrationStatusBadge = (status?: ParticipantStatus) => {
    if (!status) return null;
    
    const config = TournamentStatusManager.getParticipantStatusConfig(status);
    return (
      <Badge variant={config.badgeVariant} className={config.color}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  // Computed values
  const organizingTournaments = tournaments.filter(t => t.user_role === 'organizer');
  const participatingTournaments = tournaments.filter(t => t.user_role === 'participant');
  const upcomingTournaments = tournaments.filter(t => t.status === TournamentStatus.UPCOMING);

  // Use external loading/error states if provided
  const isLoading = externalLoading || loading;
  const currentError = externalError || error;

  // Render loading state with better accessibility
  const renderLoadingState = () => (
    <div className="max-w-7xl mx-auto px-4 py-8" role="status" aria-label="Cargando dashboard">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Cargando dashboard de torneos...</span>
    </div>
  );

  // Render error state with better styling
  const renderErrorState = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-8 text-center" role="alert">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar el dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentError}</p>
        <Button onClick={fetchUserTournaments} className="text-red-600 border-red-200 hover:bg-red-50">
          Reintentar
        </Button>
      </div>
    </div>
  );

  // Early returns for loading and error states
  if (isLoading) return renderLoadingState();
  if (currentError) return renderErrorState();



  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard de Torneos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isOrganizer 
              ? 'Gestiona tus torneos y participaciones'
              : 'Sigue tus participaciones en torneos'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Link href="/tournaments">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Torneos
            </Button>
          </Link>
          
          {isOrganizer && (
            <CreateTournamentButton />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Torneos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tournaments.length}</p>
            </div>
            <Trophy className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {isOrganizer ? `${organizingTournaments.length} organizando` : 'Participaciones activas'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Próximos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{upcomingTournaments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Torneos programados
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isOrganizer ? 'Participantes' : 'Ciudades'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isOrganizer 
                  ? organizingTournaments.reduce((sum, t) => sum + t.current_players, 0)
                  : new Set(tournaments.map(t => t.city)).size
                }
              </p>
            </div>
            {isOrganizer ? (
              <Users className="h-8 w-8 text-purple-500" />
            ) : (
              <MapPin className="h-8 w-8 text-purple-500" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {isOrganizer ? 'En tus torneos' : 'Visitadas'}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar torneos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-label="Buscar torneos"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos los estados</option>
              <option value={TournamentStatus.UPCOMING}>{STATUS_TRANSLATIONS.tournament[TournamentStatus.UPCOMING]}</option>
              <option value={TournamentStatus.ONGOING}>{STATUS_TRANSLATIONS.tournament[TournamentStatus.ONGOING]}</option>
              <option value={TournamentStatus.COMPLETED}>{STATUS_TRANSLATIONS.tournament[TournamentStatus.COMPLETED]}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tournament Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            Todos ({tournaments.length})
          </TabsTrigger>
          {isOrganizer && (
            <TabsTrigger value="organizing">
              Organizando ({organizingTournaments.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="participating">
            Participando ({participatingTournaments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTournaments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No se encontraron torneos' 
                  : 'No tienes torneos aún'
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : isOrganizer 
                    ? 'Crea tu primer torneo o regístrate en uno existente'
                    : 'Busca torneos interesantes y regístrate para participar'
                }
              </p>
              
              {!searchQuery && statusFilter === 'all' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/tournaments">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Buscar Torneos
                    </Button>
                  </Link>
                  
                  {isOrganizer && (
                    <CreateTournamentButton />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="list" aria-label="Lista de torneos">
              {filteredTournaments.map((tournament) => (
                <div key={tournament.id} role="listitem">
                  <TournamentCard
                    tournament={tournament}
                    userRole={tournament.user_role}
                    showActions={true}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {isOrganizer && (
          <TabsContent value="organizing" className="space-y-4">
            {organizingTournaments.filter(t => {
              if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return t.name.toLowerCase().includes(query) ||
                       t.city.toLowerCase().includes(query) ||
                       t.tournament_type.toLowerCase().includes(query);
              }
              if (statusFilter !== 'all') return t.status === statusFilter;
              return true;
            }).length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No estás organizando torneos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crea tu primer torneo y comienza a gestionar participantes
                </p>
                <CreateTournamentButton />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="list" aria-label="Torneos que organizas">
                {organizingTournaments
                  .filter(t => {
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase();
                      return t.name.toLowerCase().includes(query) ||
                             t.city.toLowerCase().includes(query) ||
                             t.tournament_type.toLowerCase().includes(query);
                    }
                    if (statusFilter !== 'all') return t.status === statusFilter;
                    return true;
                  })
                  .map((tournament) => (
                    <div key={tournament.id} role="listitem">
                      <TournamentCard
                        tournament={tournament}
                        userRole="organizer"
                        showActions={true}
                        className="h-full"
                      />
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="participating" className="space-y-4">
          {participatingTournaments.filter(t => {
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return t.name.toLowerCase().includes(query) ||
                     t.city.toLowerCase().includes(query) ||
                     t.tournament_type.toLowerCase().includes(query);
            }
            if (statusFilter !== 'all') return t.status === statusFilter;
            return true;
          }).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No estás participando en torneos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Busca torneos interesantes y regístrate para participar
              </p>
              <Link href="/tournaments">
                <Button className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar Torneos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="list" aria-label="Torneos en los que participas">
              {participatingTournaments
                .filter(t => {
                  if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    return t.name.toLowerCase().includes(query) ||
                           t.city.toLowerCase().includes(query) ||
                           t.tournament_type.toLowerCase().includes(query);
                  }
                  if (statusFilter !== 'all') return t.status === statusFilter;
                  return true;
                })
                .map((tournament) => (
                  <div key={tournament.id} role="listitem">
                    <TournamentCard
                      tournament={tournament}
                      userRole="participant"
                      showActions={true}
                      className="h-full"
                    />
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}