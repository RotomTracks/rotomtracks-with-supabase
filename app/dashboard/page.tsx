import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { HomePageNavigation } from '@/components/navigation/PageNavigation';
import { getNavigationConfig } from '@/lib/navigation/config';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Mock data for now (will be replaced with real Supabase queries later)
  const profile = {
    id: user.id,
    full_name: user.email?.split('@')[0] || 'Usuario',
    user_role: 'player', // or 'organizer'
    email: user.email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const userTournaments: any[] = [];
  const participatingTournaments: any[] = [];
  const recentTournaments = [
    {
      id: '1',
      name: 'Campeonato Regional Madrid 2024',
      tournament_type: 'VGC Premier Event',
      city: 'Madrid',
      country: 'España',
      start_date: '2024-03-15T10:00:00Z',
      status: 'completed',
      current_players: 128
    },
    {
      id: '2',
      name: 'Liga Cup Barcelona',
      tournament_type: 'TCG League Cup',
      city: 'Barcelona', 
      country: 'España',
      start_date: '2024-03-20T09:00:00Z',
      status: 'completed',
      current_players: 64
    }
  ];

  const navConfig = getNavigationConfig('dashboard');

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <HomePageNavigation
          title={navConfig.title}
          description={navConfig.description}
          currentPageLabel="Dashboard"
          currentPageHref="/dashboard"
        />
        
        <DashboardContent
          user={user}
          profile={profile}
          userTournaments={userTournaments}
          participatingTournaments={participatingTournaments}
          recentTournaments={recentTournaments}
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Dashboard - RotomTracks',
  description: 'Tu panel de control para gestionar torneos y participaciones',
};