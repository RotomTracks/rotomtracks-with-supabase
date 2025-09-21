
import { TournamentList } from '@/components/tournaments/TournamentList';
import { getCurrentUser } from '@/lib/auth/roles';
import { HomePageNavigation } from '@/components/navigation/PageNavigation';
import { getNavigationConfig } from '@/lib/navigation/config';
import { TournamentType, TournamentStatus } from '@/lib/types/tournament';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

interface TournamentsPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    type?: string;
    status?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function TournamentsPage({ searchParams }: TournamentsPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  
  // For now, we'll use mock data until Supabase is properly configured
  const mockTournaments = [
    {
      id: '1',
      official_tournament_id: '24-03-000247',
      name: 'Campeonato Regional Madrid 2024',
      tournament_type: TournamentType.VGC_PREMIER_EVENT,
      city: 'Madrid',
      country: 'España',
      start_date: '2024-03-15T10:00:00Z',
      end_date: '2024-03-15T18:00:00Z',
      status: TournamentStatus.COMPLETED,
      current_players: 128,
      max_players: 150,
      registration_open: false,
      organizer_id: 'org1',
      description: 'El campeonato regional más importante de Madrid con los mejores jugadores de VGC.',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-03-15T18:00:00Z'
    },
    {
      id: '2',
      official_tournament_id: '24-03-000156',
      name: 'Liga Cup Barcelona TCG',
      tournament_type: TournamentType.TCG_LEAGUE_CUP,
      city: 'Barcelona',
      country: 'España',
      start_date: '2024-03-20T09:00:00Z',
      end_date: '2024-03-20T17:00:00Z',
      status: TournamentStatus.ONGOING,
      current_players: 64,
      max_players: 80,
      registration_open: false,
      organizer_id: 'org2',
      description: 'Liga Cup oficial de TCG en Barcelona con premios increíbles.',
      created_at: '2024-02-10T10:00:00Z',
      updated_at: '2024-03-20T12:00:00Z'
    },
    {
      id: '3',
      official_tournament_id: '24-04-000089',
      name: 'Torneo GO Valencia Spring',
      tournament_type: TournamentType.GO_PREMIER_EVENT,
      city: 'Valencia',
      country: 'España',
      start_date: '2024-04-05T11:00:00Z',
      end_date: '2024-04-05T16:00:00Z',
      status: TournamentStatus.UPCOMING,
      current_players: 32,
      max_players: 50,
      registration_open: true,
      organizer_id: 'org3',
      description: 'Primer torneo de Pokémon GO de la temporada primavera en Valencia.',
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-25T10:00:00Z'
    },
    {
      id: '4',
      official_tournament_id: '24-04-000123',
      name: 'Challenge Sevilla TCG',
      tournament_type: TournamentType.TCG_LEAGUE_CHALLENGE,
      city: 'Sevilla',
      country: 'España',
      start_date: '2024-04-12T10:00:00Z',
      end_date: '2024-04-12T15:00:00Z',
      status: TournamentStatus.UPCOMING,
      current_players: 24,
      max_players: 40,
      registration_open: true,
      organizer_id: 'org4',
      description: 'League Challenge mensual en Sevilla para jugadores de todos los niveles.',
      created_at: '2024-03-15T10:00:00Z',
      updated_at: '2024-03-25T10:00:00Z'
    },
    {
      id: '5',
      official_tournament_id: '24-04-000201',
      name: 'Prerelease Bilbao',
      tournament_type: TournamentType.TCG_PRERELEASE,
      city: 'Bilbao',
      country: 'España',
      start_date: '2024-04-20T12:00:00Z',
      end_date: '2024-04-20T17:00:00Z',
      status: TournamentStatus.UPCOMING,
      current_players: 18,
      max_players: 30,
      registration_open: true,
      organizer_id: 'org5',
      description: 'Evento prerelease de la nueva expansión con sobres gratuitos.',
      created_at: '2024-03-20T10:00:00Z',
      updated_at: '2024-03-25T10:00:00Z'
    },
    {
      id: '6',
      official_tournament_id: '24-05-000078',
      name: 'VGC Regional Zaragoza',
      tournament_type: TournamentType.VGC_PREMIER_EVENT,
      city: 'Zaragoza',
      country: 'España',
      start_date: '2024-05-01T09:00:00Z',
      end_date: '2024-05-01T19:00:00Z',
      status: TournamentStatus.UPCOMING,
      current_players: 96,
      max_players: 120,
      registration_open: true,
      organizer_id: 'org6',
      description: 'Regional de VGC en Zaragoza con clasificación para el campeonato mundial.',
      created_at: '2024-03-10T10:00:00Z',
      updated_at: '2024-03-25T10:00:00Z'
    }
  ];

  // Apply basic filtering based on search params
  let filteredTournaments = mockTournaments;

  if (params.q) {
    const query = params.q.toLowerCase();
    filteredTournaments = filteredTournaments.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.tournament_type.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  }

  if (params.location) {
    const location = params.location.toLowerCase();
    filteredTournaments = filteredTournaments.filter(t => 
      t.city.toLowerCase().includes(location) ||
      t.country.toLowerCase().includes(location)
    );
  }

  if (params.type) {
    filteredTournaments = filteredTournaments.filter(t => 
      t.tournament_type.toLowerCase().includes(params.type!.toLowerCase())
    );
  }

  if (params.status) {
    filteredTournaments = filteredTournaments.filter(t => 
      t.status === params.status
    );
  }

  // Apply sorting
  const sortBy = params.sort || 'date';
  filteredTournaments.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'players':
        return b.current_players - a.current_players;
      case 'location':
        return a.city.localeCompare(b.city);
      default:
        return 0;
    }
  });

  // Pagination
  const page = parseInt(params.page || '1');
  const perPage = 12;
  const totalTournaments = filteredTournaments.length;
  const totalPages = Math.ceil(totalTournaments / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedTournaments = filteredTournaments.slice(startIndex, startIndex + perPage);

  const navConfig = getNavigationConfig('tournaments');

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <HomePageNavigation
          title={navConfig.title}
          description={navConfig.description}
          currentPageLabel="Torneos"
          currentPageHref="/tournaments"
        />

        <TournamentList
          tournaments={paginatedTournaments}
          totalTournaments={totalTournaments}
          currentPage={page}
          totalPages={totalPages}
          searchParams={params}
          userRole={user ? 'authenticated' : 'guest'}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Tournaments - RotomTracks',
  description: 'Encuentra y participa en torneos de Pokémon TCG, VGC y GO en España y Latinoamérica',
};