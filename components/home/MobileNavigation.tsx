'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
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
      <nav 
        id="mobile-navigation"
        className="w-full border-b border-gray-200 dark:border-gray-700 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="w-full flex justify-between items-center h-full px-4 text-sm">
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
            aria-label={isOpen ? tUI('accessibility.closeMenu') : tUI('accessibility.openMenu')}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            id="mobile-menu"
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Image 
                      src="/images/rotom-image.png" 
                      alt="RotomTracks Logo" 
                      width={24} 
                      height={24}
                      className="h-6 w-6"
                    />
                    <span id="mobile-menu-title" className="text-xl font-semibold text-gray-900 dark:text-white">RotomTracks</span>
                  </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                  aria-label={tUI('accessibility.closeMenu')}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 p-4 space-y-6">
                <div className="space-y-4">
                  <Link 
                    href="/" 
                    className="block text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {tUI('navigation.home')}
                  </Link>
                  <Link 
                    href="/tournaments" 
                    className="block text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {tUI('navigation.tournaments')}
                  </Link>
                  {user && (
                    <Link 
                      href="/dashboard" 
                      className="block text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {tUI('navigation.dashboard')}
                    </Link>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{tUI('navigation.language')}</span>
                      <LanguageSelector variant="compact" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{tUI('navigation.account')}</span>
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
