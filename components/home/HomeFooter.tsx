'use client';

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useTypedTranslation } from "@/lib/i18n";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface HomeFooterProps {
  user: any;
}

export function HomeFooter({ user }: HomeFooterProps) {
  const { tPages } = useTypedTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">RotomTracks</span>
            </div>
            <p className="text-gray-400">
              {tPages('home.footer.description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{tPages('home.footer.tournaments')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/tournaments" className="hover:text-white">{tPages('home.footer.searchTournaments')}</Link></li>
              <li><Link href="/tournaments?type=tcg" className="hover:text-white">TCG</Link></li>
              <li><Link href="/tournaments?type=vgc" className="hover:text-white">VGC</Link></li>
              <li><Link href="/tournaments?type=go" className="hover:text-white">Pokémon GO</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{tPages('home.footer.account')}</h4>
            <ul className="space-y-2 text-gray-400">
              {user ? (
                <>
                  <li><Link href="/dashboard" className="hover:text-white">{tPages('home.navigation.dashboard')}</Link></li>
                  <li><Link href="/profile" className="hover:text-white">{tPages('home.footer.profile')}</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/auth/login" className="hover:text-white">{tPages('home.footer.signIn')}</Link></li>
                  <li><Link href="/auth/sign-up" className="hover:text-white">{tPages('home.footer.signUp')}</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{tPages('home.footer.support')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">{tPages('home.footer.help')}</a></li>
              <li><a href="#" className="hover:text-white">{tPages('home.footer.contact')}</a></li>
              <li><a href="#" className="hover:text-white">{tPages('home.footer.terms')}</a></li>
              <li><a href="#" className="hover:text-white">{tPages('home.footer.privacy')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between">
          <p className="text-gray-400">
            {tPages('home.footer.copyright')}
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}