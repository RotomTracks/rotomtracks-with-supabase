import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TournamentRegistrationPage } from '@/components/tournaments/TournamentRegistrationPage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface TournamentRegisterPageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentRegisterPage({ params }: TournamentRegisterPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get tournament details (public access)
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      organizer:user_profiles!tournaments_organizer_id_fkey(
        first_name,
        last_name,
        organization_name
      )
    `)
    .eq('id', id)
    .single();

  if (error || !tournament) {
    redirect('/tournaments');
  }

  // Check if registration is open
  if (!tournament.registration_open) {
    redirect(`/tournaments/${id}?registration=closed`);
  }

  // Check if tournament is not upcoming
  if (tournament.status !== 'upcoming') {
    redirect(`/tournaments/${id}?registration=unavailable`);
  }

  return <TournamentRegistrationPage tournament={tournament} />;
}

export async function generateMetadata({ params }: TournamentRegisterPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name, city, country')
    .eq('id', id)
    .single();

  if (!tournament) {
    return {
      title: 'Registro de Torneo - RotomTracks',
      description: 'Regístrate en un torneo de Pokémon',
    };
  }

  return {
    title: `Registro - ${tournament.name} - RotomTracks`,
    description: `Regístrate en ${tournament.name} en ${tournament.city}, ${tournament.country}`,
  };
}