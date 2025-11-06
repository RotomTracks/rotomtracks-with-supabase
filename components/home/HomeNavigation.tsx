'use client';

import Link from "next/link";
import Image from "next/image";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { AuthButtonClient } from "@/components/auth/buttons/AuthButtonClient";
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher";
import { MobileNavigation } from "./MobileNavigation";
import { useTypedTranslation } from "@/lib/i18n";

export function HomeNavigation() {
  const { tUI } = useTypedTranslation();
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        id="navigation"
        className="hidden lg:block w-full border-b border-gray-200 dark:border-gray-700 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50"
        role="navigation"
        aria-label={tUI('accessibility.mainNavigation')}
      >
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-full px-5 text-sm">
          <div className="flex items-center font-semibold">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label={`RotomTracks - ${tUI('accessibility.goToHomepage')}`}
            >
              <Image 
                src="/images/rotom-image.png" 
                alt="RotomTracks Logo" 
                width={32} 
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl text-gray-900 dark:text-white">RotomTracks</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <AuthButtonClient />
            <div className="border-l border-gray-200 dark:border-gray-700 h-6"></div>
            <ThemeSwitcher />
            <LanguageSelector variant="compact" />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Only show on small screens */}
      <div className="block lg:hidden">
        <MobileNavigation />
      </div>
    </>
  );
}
