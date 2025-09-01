/**
 * Enhanced translation hook with automatic type conversion
 */

import { useCallback } from 'react';
import { useLanguage } from './useLanguage';
import enLocale from '../locales/en';
import esLocale from '../locales/es';

/**
 * Type-safe translation function that always returns a string
 */
type TypedTranslationFunction = (key: string, params?: Record<string, string | number>) => string;



const locales = {
  en: enLocale,
  es: esLocale,
};

/**
 * Hook that provides type-safe translation functions
 * Uses static locale data for better performance and type safety
 */
export function useTypedTranslation() {
  const { language, isLoading } = useLanguage();
  const currentLocale = locales[language];

  // Helper function to get nested value from object
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Main translation function with automatic string conversion
  const translate = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      const value = getNestedValue(currentLocale, key);
      let result = value || key;
      
      // Handle interpolation
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        });
      }
      
      return Array.isArray(result) ? result.join(', ') : String(result);
    },
    [currentLocale]
  );



  // Function to get array translations (for lists, etc.)
  const getArrayTranslation = useCallback(
    (key: string): string[] => {
      const value = getNestedValue(currentLocale, key);
      return Array.isArray(value) ? value : [String(value || key)];
    },
    [currentLocale]
  );

  // Namespace-specific translation functions
  const tAuth = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`auth.${key}`, params);
    },
    [translate]
  );

  // Array-specific auth translation function
  const tAuthArray = useCallback(
    (key: string): string[] => {
      return getArrayTranslation(`auth.${key}`);
    },
    [getArrayTranslation]
  );

  const tCommon = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`common.${key}`, params);
    },
    [translate]
  );

  const tTournaments = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`tournament.${key}`, params);
    },
    [translate]
  );

  const tNavigation = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`navigation.${key}`, params);
    },
    [translate]
  );

  const tHome = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`home.${key}`, params);
    },
    [translate]
  );

  const tPokemon = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`pokemon.${key}`, params);
    },
    [translate]
  );

  const tPages = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`pages.${key}`, params);
    },
    [translate]
  );

  return {
    t: translate,
    tAuth,
    tAuthArray,
    tCommon,
    tTournaments,
    tNavigation,
    tHome,
    tPokemon,
    tPages,
    getArrayTranslation,
    language,
    isLoading,
  };
}