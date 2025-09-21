import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TournamentManagementClient from '@/components/tournaments/TournamentManagementClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTournamentData(tournamentId: string, userId: string) {
  const supabase = await createClient();

  // Get tournament details
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return null;
  }

  // Check if user is the organizer
  if (tournament.organizer_id !== userId) {
    return null;
  }

  // Get participants
  const { data: participants, error: participantsError } = await supabase
    .from('tournament_participants')
    .select(`
      id,
      tournament_id,
      user_id,
      player_name,
      player_id,
      player_birthdate,
      email,
      phone,
      status,
      registration_date,
      tdf_userid,
      registration_source,
      emergency_contact,
      emergency_phone
    `)
    .eq('tournament_id', tournamentId)
    .order('registration_date', { ascending: true });

  if (participantsError) {
    console.error('Error fetching participants:', participantsError);
    return { tournament, participants: [] };
  }

  return { tournament, participants: participants || [] };
}

export default async function TournamentManagePage({ params }: PageProps) {
  const { id: tournamentId } = await params;
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/signin');
  }

  // Get tournament data
  const data = await getTournamentData(tournamentId, user.id);
  
  if (!data) {
    notFound();
  }

  const { tournament, participants } = data;

  return (
    <TournamentManagementClient 
      tournament={tournament}
      participants={participants}
    />
  );
}