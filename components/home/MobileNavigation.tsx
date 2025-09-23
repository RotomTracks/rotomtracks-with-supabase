'use client';

import { useState } from 'react';
import Link from "next/link";
import { Trophy, Menu, X } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { AuthButtonClient } from "@/components/auth-button-client";
import { Button } from "@/components/ui/button";
import { useTypedTranslation } from "@/lib/i18n";

interface MobileNavigationProps {
  user: any;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { tUI } = useTypedTranslation();

  return (
    <>
      {/* Mobile Header */}
      <nav className="w-full border-b border-b-foreground/10 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 lg:hidden">
        <div className="w-full flex justify-between items-center p-3 px-4 text-sm">
          <div className="flex items-center font-semibold">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
            >
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xl">RotomTracks</span>
            </Link>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
            aria-label={tUI('accessibility.toggleMenu')}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <span className="text-xl font-semibold">RotomTracks</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 p-4 space-y-6">
                <div className="space-y-4">
                  <Link 
                    href="/" 
                    className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {tUI('navigation.home')}
                  </Link>
                  <Link 
                    href="/tournaments" 
                    className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {tUI('navigation.tournaments')}
                  </Link>
                  {user && (
                    <Link 
                      href="/dashboard" 
                      className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {tUI('navigation.dashboard')}
                    </Link>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{tUI('navigation.language')}</span>
                      <LanguageSelector variant="compact" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{tUI('navigation.account')}</span>
                      <AuthButtonClient />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
