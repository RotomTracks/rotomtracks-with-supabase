/**
 * Simple language management hook
 */

import { useState, useEffect } from 'react';
import { SupportedLanguage, LANGUAGE_METADATA, DEFAULT_LANGUAGE } from '../types';

const LANGUAGE_STORAGE_KEY = 'preferred-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load language from localStorage
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === 'es' || stored === 'en')) {
      setLanguageState(stored as SupportedLanguage);
    }
    setIsLoading(false);
  }, []);

  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
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