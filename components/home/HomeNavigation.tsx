'use client';

import Link from "next/link";
import { Trophy } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { AuthButtonClient } from "@/components/auth-button-client";
import { MobileNavigation } from "./MobileNavigation";

interface HomeNavigationProps {
  user: any;
}

export function HomeNavigation({ user }: HomeNavigationProps) {
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block w-full border-b border-gray-200 dark:border-gray-700 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex items-center font-semibold">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl text-gray-900 dark:text-white">RotomTracks</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <AuthButtonClient />
            <div className="border-l border-gray-200 dark:border-gray-700 h-6"></div>
            <LanguageSelector variant="compact" />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Only show on small screens */}
      <div className="block lg:hidden">
        <MobileNavigation user={user} />
      </div>
    </>
  );
}