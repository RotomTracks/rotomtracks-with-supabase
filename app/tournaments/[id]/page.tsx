import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TournamentDetails } from '@/components/tournaments/TournamentDetails';
import { BackToTournamentsButton } from '@/components/tournaments/BackToTournamentsButton';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

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
    .select('full_name, organization_name')
    .eq('id', tournament.organizer_id)
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
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackToTournamentsButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tournament.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {tournament.city}, {tournament.country} • {new Date(tournament.start_date).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          {/* Organizer actions */}
          {isOrganizer && (
            <div className="flex items-center space-x-2">
              <Link href={`/tournaments/${tournamentId}/manage`}>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar Torneo
                </Button>
              </Link>
            </div>
          )}
        </div>

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
      title: 'Torneo no encontrado',
    };
  }

  return {
    title: `${tournament.name} - RotomTracks`,
    description: `Detalles del torneo ${tournament.name} en ${tournament.city}, ${tournament.country}. Tipo: ${tournament.tournament_type}. Fecha: ${new Date(tournament.start_date).toLocaleDateString('es-ES')}.`,
    openGraph: {
      title: tournament.name,
      description: `Torneo de ${tournament.tournament_type} en ${tournament.city}, ${tournament.country}`,
      type: 'website',
    },
  };
}