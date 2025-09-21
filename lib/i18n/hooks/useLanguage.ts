/**
 * Simple language management hook
 */

import { useState, useEffect } from 'react';
import { SupportedLanguage, LANGUAGE_METADATA, DEFAULT_LANGUAGE } from '../types';
import { preloadTranslations, clearLanguageCache } from '../utils/cache';

const LANGUAGE_STORAGE_KEY = 'preferred-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load language from localStorage first
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === 'es' || stored === 'en')) {
      setLanguageState(stored as SupportedLanguage);
    } else {
      // Detect browser language if no stored preference
      const browserLanguage = navigator.language || navigator.languages?.[0] || 'es';
      const detectedLanguage = browserLanguage.startsWith('en') ? 'en' : 'es';
      setLanguageState(detectedLanguage);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);
    }
    setIsLoading(false);
  }, []);

  const setLanguage = async (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    
    // Clear cache for the previous language and preload new language
    clearLanguageCache(newLanguage);
    
    try {
      // Dynamically import the new language data
      const localeModule = await import(`../locales/${newLanguage}`);
      preloadTranslations(newLanguage, localeModule.default);
    } catch (error) {
      console.warn(`Failed to preload translations for ${newLanguage}:`, error);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
  };

  const languageInfo = LANGUAGE_METADATA[language];

  return {
    language,
    setLanguage,
    toggleLanguage,
    languageInfo,
    isLoading,
  };
}