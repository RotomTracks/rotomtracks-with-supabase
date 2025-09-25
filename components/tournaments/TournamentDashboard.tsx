'use client';

// React
import { useState, useEffect } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  Settings,
  Search,
  AlertCircle
} from 'lucide-react';

// Next.js
import Link from 'next/link';

// Local Components
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { CreateTournamentButton } from '@/components/tournaments/CreateTournamentButton';

// Types
import { 
  Tournament, 
  TournamentType, 
  TournamentStatus} from '@/lib/types/tournament';

// Utilities
import { 
  STATUS_TRANSLATIONS
} from '@/lib/utils/tournament-status';
import { useTypedTranslation } from '@/lib/i18n';

interface UserTournament extends Tournament {
  user_role: 'participant' | 'organizer';
  registration_status?: 'registered' | 'checked_in' | 'dropped';
  registration_date?: string;
}


interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
  user_profiles?: {
    user_role?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

interface TournamentDashboardProps {
  user: User;
  loading?: boolean;
  error?: string | null;
  showHeader?: boolean;
}

export function TournamentDashboard({ 
  user, 
  loading: externalLoading = false, 
  error: externalError = null,
  showHeader = true,
}: TournamentDashboardProps) {
  // Hooks
  const { tTournaments, tUI } = useTypedTranslation();
  
  // State
  const [tournaments, setTournaments] = useState<UserTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userRole = user?.user_profiles?.user_role || 'player';
  const isOrganizer = userRole === 'organizer' || userRole === 'admin';
  
  console.log('Dashboard user data:', {
    user: user,
    userRole: userRole,
    isOrganizer: isOrganizer,
    userProfiles: user?.user_profiles
  });
  
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null as any;
  const initialTab = (searchParams?.get('tab') as string) || (isOrganizer ? 'organizing' : 'participating');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchUserTournaments();
  }, [user]);

  const fetchUserTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is available
      if (!user?.id) {
        console.log('No user available, skipping tournament fetch');
        setLoading(false);
        return;
      }

      console.log('Fetching user tournaments for user:', user.id);
      const response = await fetch('/api/tournaments/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = tTournaments('dashboard.error.loading');
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData;
          console.error('API Error Response:', errorData);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        console.error('HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails
        });
        
        // If it's a 404 or empty response, show empty state
        if (response.status === 404 || (errorDetails && Object.keys(errorDetails).length === 0)) {
          console.log('API returned empty data, showing empty state');
          setTournaments([]);
          setLoading(false);
          return;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && data.data) {
        console.log(`Found ${data.data.tournaments?.length || 0} tournaments`);
        setTournaments(data.data.tournaments || []);
      } else {
        console.log('API returned unsuccessful response or no data');
        setTournaments([]);
      }
    } catch (err) {
      console.error('Error fetching user tournaments:', err);
      const errorMessage = err instanceof Error ? err.message : tTournaments('dashboard.error.loading');
      setError(errorMessage);
      setTournaments([]);
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

  // Computed values
  const organizingTournaments = tournaments.filter(t => t.user_role === 'organizer');
  const participatingTournaments = tournaments.filter(t => t.user_role === 'participant');
  const upcomingTournaments = tournaments.filter(t => t.status === TournamentStatus.UPCOMING);

  // Use external loading/error states if provided
  const isLoading = externalLoading || loading;
  const currentError = externalError || error;

  // Render loading state with better accessibility
  const renderLoadingState = () => (
    <div className="max-w-7xl mx-auto px-4 py-8" role="status" aria-label={tUI('status.loading')}>
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{tUI('status.loading')}</span>
    </div>
  );

  // Render error state with better styling
  const renderErrorState = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 p-8 text-center" role="alert">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {tUI('status.error')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{currentError}</p>
        <Button onClick={fetchUserTournaments} className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl">
          {tUI('buttons.retry')}
        </Button>
      </div>
    </div>
  );

  // Early returns for loading and error states
  if (isLoading) return renderLoadingState();
  
  // Only show error state if we have no tournaments AND an error
  if (currentError && tournaments.length === 0) return renderErrorState();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {tTournaments('dashboard.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isOrganizer 
                ? tTournaments('dashboard.subtitle.organizer')
                : tTournaments('dashboard.subtitle.player')
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Link href="/tournaments">
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {tTournaments('filters.search')}
              </Button>
            </Link>
            
            {isOrganizer && (
              <CreateTournamentButton centered />
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-300 dark:border-gray-600 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">{tTournaments('dashboard.stats.total')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tournaments.length}</p>
            </div>
            <Trophy className="h-8 w-8 text-blue-500" />
          </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {isOrganizer 
                ? organizingTournaments.length > 0 
                  ? `${organizingTournaments.length} ${tTournaments('dashboard.stats.organizing')}` 
                  : tTournaments('dashboard.stats.noOrganizing')
                : tTournaments('dashboard.stats.participating')
              }
            </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-300 dark:border-gray-600 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">{tTournaments('dashboard.stats.upcoming')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{upcomingTournaments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {tTournaments('dashboard.stats.scheduled')}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg p-6 border border-gray-300 dark:border-gray-600 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                {isOrganizer ? tTournaments('stats.participants') : tTournaments('stats.cities')}
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isOrganizer ? tTournaments('stats.inYourTournaments') : tTournaments('stats.visited')}
          </p>
        </div>
      </div>

      {/* Combined Filters, Search and Tabs */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 p-6 pb-4 mb-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={tTournaments('dashboard.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                aria-label={tTournaments('dashboard.search.aria')}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md transition-all duration-200 appearance-none cursor-pointer min-w-[140px]"
                aria-label={tTournaments('dashboard.filter.status.aria')}
              >
                <option value="all">{tTournaments('dashboard.filter.status.all')}</option>
                <option value={TournamentStatus.UPCOMING}>{STATUS_TRANSLATIONS.tournament[TournamentStatus.UPCOMING]}</option>
                <option value={TournamentStatus.ONGOING}>{STATUS_TRANSLATIONS.tournament[TournamentStatus.ONGOING]}</option>
                <option value={TournamentStatus.COMPLETED}>{STATUS_TRANSLATIONS.tournament[TournamentStatus.COMPLETED]}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className={`grid w-full ${isOrganizer ? 'grid-cols-3' : 'grid-cols-2'} bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl p-1.5 mb-0 !h-auto`}>
          {isOrganizer && (
            <TabsTrigger value="organizing" className="rounded-xl data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:p-2 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:data-[state=active]:border-gray-500 transition-all duration-200 font-medium px-3 m-0 flex items-center justify-center h-full leading-none">
              {tTournaments('dashboard.tabs.organizing')} ({organizingTournaments.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="participating" className="rounded-xl data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:p-2 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:data-[state=active]:border-gray-500 transition-all duration-200 font-medium px-3 m-0 flex items-center justify-center h-full leading-none">
            {tTournaments('dashboard.tabs.participating')} ({participatingTournaments.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:p-2 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:data-[state=active]:border-gray-500 transition-all duration-200 font-medium px-3 m-0 flex items-center justify-center h-full leading-none">
            {tTournaments('dashboard.tabs.all')} ({tournaments.length})
          </TabsTrigger>
        </TabsList>

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
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 p-8 text-center">
                <Settings className="h-12 w-12 text-gray-300 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {tTournaments('dashboard.empty.organizing.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {tTournaments('dashboard.empty.organizing.description')}
                </p>
                <CreateTournamentButton centered />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="list" aria-label={tTournaments('dashboard.tabs.organizingAria')}>
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
                        tournament={tournament as any}
                        userRole="authenticated"
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {tTournaments('dashboard.empty.participating.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {tTournaments('dashboard.empty.participating.description')}
              </p>
              <div className="flex justify-center">
                <Link href="/tournaments">
                  <Button className="flex items-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:border-blue-500 dark:hover:border-blue-600">
                    <Search className="h-4 w-4" />
                    {tTournaments('dashboard.empty.participating.searchButton')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="list" aria-label={tTournaments('dashboard.tabs.participatingAria')}>
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
                      tournament={tournament as any}
                      userRole="authenticated"
                      showActions={true}
                      className="h-full"
                    />
                  </div>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredTournaments.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery || statusFilter !== 'all' 
                  ? tTournaments('dashboard.empty.all.titleFiltered') 
                  : tTournaments('dashboard.empty.all.title')
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? tTournaments('dashboard.empty.all.descriptionFiltered')
                  : isOrganizer 
                    ? tTournaments('dashboard.empty.all.description')
                    : tTournaments('dashboard.empty.participating.description')
                }
              </p>
              
              {!searchQuery && statusFilter === 'all' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/tournaments">
                    <Button variant="outline" className="flex items-center gap-2 rounded-xl border-2 border-blue-600 text-white hover:bg-blue-600 hover:text-white transition-all duration-200 dark:border-blue-500 dark:text-white dark:hover:bg-blue-500 dark:hover:text-white">
                      <Search className="h-4 w-4" />
                      {tTournaments('dashboard.empty.participating.searchButton')}
                    </Button>
                  </Link>
                  
                  {isOrganizer && (
                    <CreateTournamentButton centered />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="list" aria-label={tTournaments('dashboard.tabs.allAria')}>
              {filteredTournaments.map((tournament) => (
                <div key={tournament.id} role="listitem">
                  <TournamentCard
                    tournament={tournament as any}
                    userRole="authenticated"
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
    </div>
  );
}