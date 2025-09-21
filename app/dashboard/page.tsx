import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/roles';
import { TournamentDashboard } from '@/components/tournaments/TournamentDashboard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TournamentDashboard user={user} />
    </div>
  );
}

export const metadata = {
  title: 'Dashboard - RotomTracks',
  description: 'Gestiona tus torneos, participaciones y organizaciones',
};