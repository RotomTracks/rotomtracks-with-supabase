import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TournamentManagement } from '@/components/tournaments/TournamentManagement';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

interface ManagePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ManagePage({ params }: ManagePageProps) {
  const supabase = await createClient();
  const { id } = await params;
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get tournament details
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_files(
        id,
        file_name,
        file_type,
        file_size,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (tournamentError || !tournament) {
    redirect('/tournaments');
  }

  // Check if user is the organizer
  if (tournament.organizer_id !== user.id) {
    redirect(`/tournaments/${id}`);
  }

  // Get tournament statistics
  const [
    { count: participantsCount },
    { count: matchesCount },
    { count: resultsCount }
  ] = await Promise.all([
    supabase
      .from('tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', id),
    supabase
      .from('tournament_matches')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', id),
    supabase
      .from('tournament_results')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', id)
  ]);

  const stats = {
    participants: participantsCount || 0,
    matches: matchesCount || 0,
    results: resultsCount || 0,
    files: tournament.tournament_files?.length || 0,
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Torneo
          </h1>
          <p className="text-gray-600 mt-2">
            Administra archivos, procesa datos y genera reportes
          </p>
        </div>

        <TournamentManagement
          tournament={tournament}
          files={tournament.tournament_files || []}
          stats={stats}
        />
      </div>
    </div>
  );
}