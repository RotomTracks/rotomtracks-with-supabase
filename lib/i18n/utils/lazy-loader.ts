/**
 * Lazy loading utilities for translation files
 */

import { SupportedLanguage } from '../types';

// Cache for loaded locale modules
const localeModuleCache = new Map<SupportedLanguage, Record<string, unknown>>();

/**
 * Dynamically load a locale module
 */
export async function loadLocaleModule(language: SupportedLanguage): Promise<Record<string, unknown>> {
  // Return cached module if available
  if (localeModuleCache.has(language)) {
    const cached = localeModuleCache.get(language);
    if (cached) {
      return cached;
    }
  }

  try {
    let localeModule;
    
    // Dynamic import with webpack magic comments for better chunk naming
    switch (language) {
      case 'es':
        localeModule = await import(
          /* webpackChunkName: "locale-es" */ '../locales/es'
        );
        break;
      case 'en':
        localeModule = await import(
          /* webpackChunkName: "locale-en" */ '../locales/en'
        );
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    const localeData = localeModule.default || localeModule;
    localeModuleCache.set(language, localeData);
    
    return localeData;
  } catch (error) {
    console.error(`Failed to load locale module for ${language}:`, error);
    
    // Fallback to default language if available
    if (language !== 'es') {
      return loadLocaleModule('es');
    }
    
    throw error;
  }
}

/**
 * Preload locale modules for better performance
 */
export async function preloadLocaleModules(languages: SupportedLanguage[]): Promise<void> {
  const loadPromises = languages.map(async (language) => {
    try {
      await loadLocaleModule(language);
    } catch (error) {
      console.warn(`Failed to preload locale ${language}:`, error);
    }
  });

  await Promise.allSettled(loadPromises);
}

/**
 * Clear locale module cache
 */
export function clearLocaleModuleCache(): void {
  localeModuleCache.clear();
}

/**
 * Get cache statistics
 */
export function getLocaleModuleCacheStats(): {
  cachedLanguages: SupportedLanguage[];
  cacheSize: number;
} {
  return {
    cachedLanguages: Array.from(localeModuleCache.keys()),
    cacheSize: localeModuleCache.size
  };
}