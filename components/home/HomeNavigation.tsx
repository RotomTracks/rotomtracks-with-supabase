'use client';

import Link from "next/link";
import { Trophy } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { AuthButtonClient } from "@/components/auth-button-client";

interface HomeNavigationProps {
  user: any;
}

export function HomeNavigation({ user }: HomeNavigationProps) {
  return (
    <nav className="w-full border-b border-b-foreground/10 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex items-center font-semibold">
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
          >
            <Trophy className="h-6 w-6 text-blue-600" />
            <span className="text-xl">RotomTracks</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <AuthButtonClient />
          <div className="border-l border-border h-6"></div>
          <LanguageSelector variant="compact" />
        </div>
      </div>
    </nav>
  );
}