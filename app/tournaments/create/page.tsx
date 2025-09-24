"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/lib/types/tournament';
import { PageNavigation } from '@/components/navigation/PageNavigation';
import CreateTournamentSwitcher from '../../../components/tournaments/CreateTournamentSwitcher';
import { useTypedTranslation } from '@/lib/i18n';

export default function CreateTournamentPage() {
  const { user, loading } = useAuth();
  const { tPages } = useTypedTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth/login?redirect=/tournaments/create');
      return;
    }

    // Check if user is an organizer
    if ((user as any).user_profiles?.account_type !== UserRole.ORGANIZER) {
      router.push('/organizer-request?redirect=/tournaments/create');
      return;
    }

    setIsLoading(false);
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageNavigation
          title={tPages('tournaments.create.title')}
          description={tPages('tournaments.create.description')}
          breadcrumbs={[
            { label: tPages('tournaments.create.breadcrumbs.home'), href: '/' },
            { label: tPages('tournaments.create.breadcrumbs.dashboard'), href: '/dashboard' },
            { label: tPages('tournaments.create.breadcrumbs.createTournament'), href: '/tournaments/create', current: true },
          ]}
          backButtonHref="/dashboard"
          backButtonText={tPages('tournaments.create.backButton')}
        />

        <CreateTournamentSwitcher user={user} />
      </div>
    </div>
  );
}
