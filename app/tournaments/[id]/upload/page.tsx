import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileUploadDemo } from '@/components/tournaments/FileUploadDemo';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

interface UploadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get tournament details
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('id, name, organizer_id')
    .eq('id', id)
    .single();

  if (tournamentError || !tournament) {
    redirect('/tournaments');
  }

  // Check if user is the organizer
  if (tournament.organizer_id !== user.id) {
    redirect(`/tournaments/${id}`);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Archivos
          </h1>
          <p className="text-gray-600 mt-2">
            Sube y gestiona archivos para tu torneo
          </p>
        </div>

        <FileUploadDemo
          tournamentId={tournament.id}
          tournamentName={tournament.name}
        />
      </div>
    </div>
  );
}