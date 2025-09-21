/**
 * Optimized translation hook with lazy loading and caching
 */

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from './useLanguage';
import { SupportedLanguage } from '../types';
import { getCachedTranslation, setCachedTranslation, preloadTranslations } from '../utils/cache';
import { loadLocaleModule } from '../utils/lazy-loader';

/**
 * Type-safe translation function that always returns a string
 */
type OptimizedTranslationFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Hook that provides optimized translation functions with lazy loading and caching
 */
export function useOptimizedTranslation() {
  const { language, isLoading: languageLoading } = useLanguage();
  const [localeData, setLocaleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load locale data when language changes
  useEffect(() => {
    let isMounted = true;

    const loadLocaleData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await loadLocaleModule(language);
        
        if (isMounted) {
          setLocaleData(data);
          
          // Preload translations into cache
          preloadTranslations(language, data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load translations');
          console.error('Failed to load locale data:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!languageLoading) {
      loadLocaleData();
    }

    return () => {
      isMounted = false;
    };
  }, [language, languageLoading]);

  // Helper function to get nested value from object
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }, []);

  // Main translation function with caching and lazy loading
  const translate = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      // Return key as fallback if still loading or error
      if (isLoading || error || !localeData) {
        return key;
      }

      // Check cache first
      const cachedResult = getCachedTranslation(language, key, params);
      if (cachedResult !== null) {
        return cachedResult;
      }

      const value = getNestedValue(localeData, key);
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

      return finalResult;
    },
    [language, localeData, isLoading, error, getNestedValue]
  );

  // Function to get array translations (for lists, etc.)
  const getArrayTranslation = useCallback(
    (key: string): string[] => {
      if (isLoading || error || !localeData) {
        return [key];
      }

      const value = getNestedValue(localeData, key);
      return Array.isArray(value) ? value : [String(value || key)];
    },
    [localeData, isLoading, error, getNestedValue]
  );

  // Namespace-specific translation functions
  const tAuth = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`auth.${key}`, params);
    },
    [translate]
  );

  const tCommon = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`common.${key}`, params);
    },
    [translate]
  );

  const tTournaments = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`tournament.${key}`, params);
    },
    [translate]
  );

  const tNavigation = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`navigation.${key}`, params);
    },
    [translate]
  );

  const tHome = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`home.${key}`, params);
    },
    [translate]
  );

  const tPokemon = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`pokemon.${key}`, params);
    },
    [translate]
  );

  const tPages = useCallback<OptimizedTranslationFunction>(
    (key: string, params?: Record<string, string | number>) => {
      return translate(`pages.${key}`, params);
    },
    [translate]
  );

  return {
    t: translate,
    tAuth,
    tCommon,
    tTournaments,
    tNavigation,
    tHome,
    tPokemon,
    tPages,
    getArrayTranslation,
    language,
    isLoading: isLoading || languageLoading,
    error
  };
}