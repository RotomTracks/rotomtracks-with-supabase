import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ProfileCompletionAlert } from "@/components/profile-completion-alert";
import { getCurrentUser } from "@/lib/auth/roles";
import { HomeContent } from "@/components/home/HomeContent";

import Link from "next/link";
import { Trophy } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  // Note: Featured tournaments are now handled by the UpcomingTournaments component

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-blue-600" />
              <span className="text-xl">RotomTracks</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              <Link href="/tournaments" className="text-gray-600 hover:text-gray-900">
                Torneos
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          <AuthButton />
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        {/* Profile completion alert for authenticated users */}
        {user && (
          <div className="w-full max-w-7xl mx-auto px-5 pt-4">
            <ProfileCompletionAlert user={user} />
          </div>
        )}

        {/* Home Content with Location Management */}
        <HomeContent user={user} />

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Trophy className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-bold">RotomTracks</span>
                </div>
                <p className="text-gray-400">
                  La plataforma líder para torneos de Pokémon en España y Latinoamérica.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Torneos</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/tournaments" className="hover:text-white">Buscar Torneos</Link></li>
                  <li><Link href="/tournaments?type=tcg" className="hover:text-white">TCG</Link></li>
                  <li><Link href="/tournaments?type=vgc" className="hover:text-white">VGC</Link></li>
                  <li><Link href="/tournaments?type=go" className="hover:text-white">Pokémon GO</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Cuenta</h4>
                <ul className="space-y-2 text-gray-400">
                  {user ? (
                    <>
                      <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                      <li><Link href="/profile" className="hover:text-white">Perfil</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link href="/auth/login" className="hover:text-white">Iniciar Sesión</Link></li>
                      <li><Link href="/auth/sign-up" className="hover:text-white">Registrarse</Link></li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Soporte</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Ayuda</a></li>
                  <li><a href="#" className="hover:text-white">Contacto</a></li>
                  <li><a href="#" className="hover:text-white">Términos</a></li>
                  <li><a href="#" className="hover:text-white">Privacidad</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between">
              <p className="text-gray-400">
                © 2024 RotomTracks. Todos los derechos reservados.
              </p>
              <ThemeSwitcher />
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
