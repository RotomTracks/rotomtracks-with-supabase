import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { PageNavigation } from '@/components/navigation/PageNavigation';
import { CreateTournamentForm } from '@/components/tournaments/forms/CreateTournamentForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CreateTournamentPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login?redirect=/tournaments/create');
  }

  // Get user profile with role information
  const userProfile = await getCurrentUserProfile();
  
  // Create user object with profile data
  const userWithProfile = {
    ...user,
    user_profiles: userProfile
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageNavigation
          title="Crear Torneo"
          description="Completa los detalles para crear un nuevo torneo Pokémon"
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Crear Torneo', href: '/tournaments/create', current: true },
          ]}
          backButtonHref="/dashboard"
          backButtonText="Volver al Dashboard"
        />

        <CreateTournamentForm user={userWithProfile} />
      </div>
    </div>
  );
}
