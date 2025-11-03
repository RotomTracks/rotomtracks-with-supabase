import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TournamentDetails } from '@/components/tournaments/components/TournamentDetails';
import { PageNavigation } from '@/components/navigation/PageNavigation';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

interface TournamentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const supabase = await createClient();
  const { id: tournamentId } = await params;
  
  // Check authentication (optional for viewing tournaments)
  const { data: { user } } = await supabase.auth.getUser();

  // Get tournament details with all related data
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_participants(
        id,
        user_id,
        player_name,
        player_id,
        registration_date,
        status
      ),
      tournament_results(
        id,
        participant_id,
        wins,
        losses,
        draws,
        byes,
        final_standing,
        points
      ),
      tournament_matches(
        id,
        round_number,
        table_number,
        player1_id,
        player2_id,
        outcome,
        match_status,
        created_at
      ),
      tournament_files(
        id,
        file_name,
        file_type,
        created_at
      )
    `)
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    redirect('/tournaments');
  }

  // Check if user is organizer
  const isOrganizer = user?.id === tournament.organizer_id;

  // Check if user is participant
  const isParticipant = tournament.tournament_participants?.some(
    (p: any) => p.user_id === user?.id
  ) || false;

  // Get organizer information
  const { data: organizer } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, organization_name, email')
    .eq('user_id', tournament.organizer_id)
    .single();

  // Get HTML reports from storage
  const { data: htmlReports } = await supabase.storage
    .from('tournament-files')
    .list(`tournaments/${tournamentId}/reports/`, {
      limit: 10,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  const reportUrls = htmlReports?.map(report => ({
    name: report.name,
    url: supabase.storage
      .from('tournament-files')
      .getPublicUrl(`tournaments/${tournamentId}/reports/${report.name}`).data.publicUrl,
    created_at: report.created_at,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
        {/* Header with navigation */}
        <PageNavigation
          title=""
          className="mb-4"
          breadcrumbs={[
            { label: "Inicio", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Ver Torneos", href: "/tournaments" },
            { label: tournament.name, href: `/tournaments/${tournamentId}`, current: true }
          ]}
        />

        {/* Tournament details component */}
        <TournamentDetails
          tournament={tournament}
          participants={tournament.tournament_participants || []}
          results={tournament.tournament_results || []}
          matches={tournament.tournament_matches || []}
          files={tournament.tournament_files || []}
          reports={reportUrls}
          organizer={organizer || undefined}
          userRole={isOrganizer ? 'organizer' : isParticipant ? 'participant' : 'viewer'}
          userId={user?.id}
        />
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TournamentPageProps) {
  const supabase = await createClient();
  const { id: tournamentId } = await params;
  
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name, city, country, start_date, tournament_type')
    .eq('id', tournamentId)
    .single();

  if (!tournament) {
    return {
      title: 'Tournament not found',
    };
  }

  return {
    title: `${tournament.name} - RotomTracks`,
    description: `Tournament details ${tournament.name} in ${tournament.city}, ${tournament.country}. Type: ${tournament.tournament_type}. Date: ${new Date(tournament.start_date).toLocaleDateString('en-US')}.`,
    openGraph: {
      title: tournament.name,
      description: `${tournament.tournament_type} tournament in ${tournament.city}, ${tournament.country}`,
      type: 'website',
    },
  };
}