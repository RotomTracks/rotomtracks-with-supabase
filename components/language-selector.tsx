'use client';

/**
 * Language selector component for switching between supported languages
 */

import React, { useState } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useTypedTranslation,
  useLanguage,
  SUPPORTED_LANGUAGES, 
  LANGUAGE_METADATA,
  SupportedLanguage 
} from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showFlag?: boolean;
  showText?: boolean;
  className?: string;
}

export function LanguageSelector({ 
  variant = 'default',
  showFlag = true,
  showText = true,
  className = ''
}: LanguageSelectorProps) {
  const { language, setLanguage, languageInfo, isLoading } = useLanguage();
  const { tCommon, tUI, tAdmin, tForms, tPages } = useTypedTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    setIsOpen(false);
    // Force page reload to see changes immediately
    window.location.reload();
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'icon-only':
        return (
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </div>
        );
      case 'compact':
        return (
          <div className="flex items-center gap-2">
            {showFlag && <span className="text-sm">{languageInfo.flag}</span>}
            <span className="text-sm font-medium uppercase">
              {languageInfo.code}
            </span>
            <ChevronDown className="w-3 h-3" />
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            {showFlag && <span>{languageInfo.flag}</span>}
            {showText && (
              <span className="font-medium">
                {languageInfo.nativeName}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className={`${className} opacity-50`}
      >
        <Globe className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${className} hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2`}
          aria-label={`${tUI('buttons.select') as string} ${tUI('navigation.language', { current: languageInfo.nativeName }) as string}`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {getButtonContent()}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-48"
        role="menu"
        aria-label={tUI('navigation.languageOptions') as string}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const langInfo = LANGUAGE_METADATA[lang];
          const isSelected = language === lang;
          
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`flex items-center justify-between cursor-pointer ${
                isSelected ? 'bg-accent text-accent-foreground' : ''
              }`}
              role="menuitem"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{langInfo.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{langInfo.nativeName}</span>
                  <span className="text-xs text-muted-foreground">
                    {langInfo.name}
                  </span>
                </div>
              </div>
              {isSelected && (
                <Check 
                  className="w-4 h-4 text-primary" 
                  aria-hidden="true"
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact language toggle for mobile or space-constrained areas
 */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { toggleLanguage, languageInfo, isLoading } = useLanguage();

  const handleToggle = () => {
    toggleLanguage();
    // Force page reload to see changes immediately
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className={`${className} opacity-50`}
      >
        <Globe className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={`${className} hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      aria-label={`Switch to ${languageInfo.code === 'es' ? 'English' : 'Español'}`}
    >
      <div className="flex items-center gap-2">
        <span>{languageInfo.flag}</span>
        <span className="font-medium uppercase text-sm">
          {languageInfo.code}
        </span>
      </div>
    </Button>
  );
}