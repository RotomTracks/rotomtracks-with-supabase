import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { TournamentDashboard } from '@/components/tournaments/TournamentDashboard';
import { HomePageNavigation } from '@/components/navigation/PageNavigation';
import { getNavigationConfig } from '@/lib/navigation/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  // Get user profile with role information
  const userProfile = await getCurrentUserProfile();
  
  // Create user object with profile data
  const userWithProfile = {
    ...user,
    user_profiles: userProfile
  };

  const navConfig = getNavigationConfig('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <HomePageNavigation
          title={navConfig.title}
          description={navConfig.description}
          currentPageLabel={navConfig.title}
          currentPageHref="/dashboard"
        />

        <TournamentDashboard user={userWithProfile} showHeader={false} />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Dashboard - RotomTracks',
  description: 'Manage your tournaments, participations and organizations',
};