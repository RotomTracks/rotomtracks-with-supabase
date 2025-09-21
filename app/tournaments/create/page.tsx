import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentUserRole } from '@/lib/auth/roles';
import { CreateTournamentForm } from '@/components/tournaments/CreateTournamentForm';
import { TDFUpload } from '@/components/tournaments/TDFUpload';
import { UserRole } from '@/lib/types/tournament';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Torneo
          </h1>
          <p className="text-gray-600">
            Completa la información básica del torneo. Podrás subir el archivo TDF y gestionar participantes después de crearlo.
          </p>
        </div>

        <div className="space-y-8">
          {/* Option selector */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ¿Cómo quieres crear el torneo?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <div className="mb-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Subir archivo TDF</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sube un archivo TDF de TOM para crear el torneo automáticamente
                  </p>
                  <div className="text-xs text-gray-500">
                    ✓ Datos automáticos<br/>
                    ✓ Compatible con TOM<br/>
                    ✓ Registro online
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <div className="mb-4">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Crear manualmente</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Completa el formulario con los datos del torneo
                  </p>
                  <div className="text-xs text-gray-500">
                    ✓ Control total<br/>
                    ✓ Personalizable<br/>
                    ✓ Sin archivos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TDF Upload Component */}
          <TDFUpload />
          
          {/* Manual Form */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Crear Torneo Manualmente
              </h2>
              <p className="text-gray-600 mt-1">
                Completa el formulario con los datos del torneo
              </p>
            </div>
            <div className="p-6">
              <CreateTournamentForm user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Crear Torneo - RotomTracks',
  description: 'Crea y gestiona un nuevo torneo de Pokémon',
};