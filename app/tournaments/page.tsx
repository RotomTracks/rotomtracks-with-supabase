
import { TournamentList } from '@/components/tournaments/components/TournamentList';
import { getCurrentUser } from '@/lib/auth/roles';
import { PageNavigation } from '@/components/navigation/PageNavigation';
import { getNavigationConfig } from '@/lib/navigation/config';
import { createClient } from '@/lib/supabase/server';
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
  const supabase = await createClient();

  // Fetch tournaments from database
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('tournaments')
    .select('*')
    .order('start_date', { ascending: false });

  if (tournamentsError) {
    console.error('Error fetching tournaments:', tournamentsError);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="max-w-7xl mx-auto">
            <PageNavigation
              title="Torneos de Pokémon"
              description="Encuentra y participa en torneos de TCG, VGC y GO"
              breadcrumbs={[
                { label: "Inicio", href: "/" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Torneos de Pokémon", href: "/tournaments", current: true }
              ]}
              backButtonHref="/dashboard"
              backButtonText="Volver al Dashboard"
            />
            <div className="text-center py-12">
              <p className="text-red-600">Error al cargar los torneos. Inténtalo de nuevo más tarde.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current user for registration status
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch organizer information and registration status for each tournament
  const tournamentsWithOrganizers = await Promise.all(
    (tournaments || []).map(async (tournament) => {
      const { data: organizer, error: organizerError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, organization_name, email')
        .eq('user_id', tournament.organizer_id)
        .single();

      // Check if current user is the organizer
      const is_organizer = currentUser && tournament.organizer_id === currentUser.id;

      // Check user registration status if user is authenticated and not organizer
        let user_registration_status: 'registered' | 'waitlist' | 'not_registered' = 'not_registered';
        if (currentUser && !is_organizer) {
          const { data: registration, error: registrationError } = await supabase
            .from('tournament_participants')
            .select('status')
            .eq('tournament_id', tournament.id)
            .eq('user_id', currentUser.id)
            .single();
          
          if (registration) {
            user_registration_status = registration.status === 'waitlist' ? 'waitlist' : 'registered';
          }
        }

      return {
        ...tournament,
        organizer: organizer || null,
        is_organizer,
        user_registration_status
      };
    })
  );

  // Apply basic filtering based on search params
  let filteredTournaments = tournamentsWithOrganizers || [];

  if (params.q) {
    const query = params.q.toLowerCase();
    filteredTournaments = filteredTournaments.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.tournament_type.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <PageNavigation
          title={navConfig.title}
          description={navConfig.description}
          breadcrumbs={[
            { label: "Inicio", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Torneos de Pokémon", href: "/tournaments", current: true }
          ]}
          backButtonHref="/dashboard"
          backButtonText="Volver al Dashboard"
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
    </div>
  );
}

export const metadata = {
  title: 'Tournaments - RotomTracks',
  description: 'Find and participate in Pokémon TCG, VGC and GO tournaments in Spain and Latin America',
};