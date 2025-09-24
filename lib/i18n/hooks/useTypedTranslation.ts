/**
 * Enhanced translation hook with automatic type conversion
 */

import { useCallback } from 'react';
import { useLanguage } from './useLanguage';
import enLocale from '../locales/en';
import esLocale from '../locales/es';
import { getCachedTranslation, setCachedTranslation } from '../utils/cache';
import { logMissingTranslation, trackTranslationUsage, validateTranslationKey } from '../utils/dev-tools';

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
  const { language } = useLanguage();
  const currentLocale = locales[language];

  // Helper function to get nested value from object
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Main translation function with automatic string conversion, caching, and dev tools
  const translate = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      // Validate key in development
      if (process.env.NODE_ENV === 'development') {
        const validation = validateTranslationKey(key);
        if (!validation.isValid) {
          console.warn(`🌐 Invalid translation key "${key}":`, validation.errors);
        }
        if (validation.warnings.length > 0) {
          console.warn(`🌐 Translation key warnings for "${key}":`, validation.warnings);
        }
      }

      // Check cache first
      const cachedResult = getCachedTranslation(language, key, params);
      if (cachedResult !== null) {
        trackTranslationUsage(language, key, params);
        return cachedResult;
      }
      
      const value = getNestedValue(currentLocale, key);
      
      // Log missing translation in development
      if (value === undefined && process.env.NODE_ENV === 'development') {
        logMissingTranslation(language, key, params);
      }
      
      let result = value || key;
      
      // Handle interpolation
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        });
      }
      
      const finalResult = Array.isArray(result) ? result.join(', ') : String(result);
      
      // Cache the result
      setCachedTranslation(language, key, finalResult, params);
      
      // Track usage in development
      trackTranslationUsage(language, key, params);
      
      return finalResult;
    },
    [currentLocale, language]
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

  const tUI = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`ui.${key}`, params);
    },
    [translate]
  );

  const tAdmin = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`admin.${key}`, params);
    },
    [translate]
  );

  const tForms = useCallback<TypedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`forms.${key}`, params);
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
    translate,
    getArrayTranslation,
    tAuth,
    tAuthArray,
    tCommon,
    tTournaments,
    tNavigation,
    tHome,
    tPokemon,
    tUI,
    tAdmin,
    tForms,
    tPages
  };
}