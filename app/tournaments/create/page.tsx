import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth/roles';
import { UserRole } from '@/lib/types/tournament';
import { PageNavigation } from '@/components/navigation/PageNavigation';
import { getNavigationConfig } from '@/lib/navigation/config';
import CreateTournamentSwitcher from '../../../components/tournaments/CreateTournamentSwitcher';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CreateTournamentPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login?redirect=/tournaments/create');
  }

  // Check if user is an organizer
  const userRole = await getCurrentUserRole();
  if (userRole !== UserRole.ORGANIZER) {
    redirect('/organizer-request?redirect=/tournaments/create');
  }

  const navConfig = getNavigationConfig('tournaments');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageNavigation
          title="Crear nuevo torneo"
          description="Completa la información básica o sube un TDF de TOM."
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Crear torneo', href: '/tournaments/create', current: true },
          ]}
          backButtonHref="/dashboard"
          backButtonText="Volver al dashboard"
        />

        <CreateTournamentSwitcher user={user} />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Crear Torneo - RotomTracks',
  description: 'Crea y gestiona un nuevo torneo de Pokémon',
};