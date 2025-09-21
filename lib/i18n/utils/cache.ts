/**
 * Translation caching utilities for performance optimization
 */

import { SupportedLanguage } from '../types';

// In-memory cache for translations
const translationCache = new Map<string, any>();
const translationTimestamps = new Map<string, number>();

// Cache configuration
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached translation keys

/**
 * Generate a cache key for a translation
 */
function getCacheKey(language: SupportedLanguage, key: string, params?: Record<string, string | number>): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${language}:${key}:${paramsStr}`;
}

/**
 * Check if a cached translation is still valid
 */
function isCacheValid(cacheKey: string): boolean {
  const timestamp = translationTimestamps.get(cacheKey);
  if (!timestamp) return false;
  
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  
  for (const [key, timestamp] of translationTimestamps.entries()) {
    if (now - timestamp >= CACHE_TTL) {
      translationCache.delete(key);
      translationTimestamps.delete(key);
    }
  }
}

/**
 * Ensure cache doesn't exceed maximum size
 */
function enforceMaxCacheSize(): void {
  if (translationCache.size <= MAX_CACHE_SIZE) return;
  
  // Remove oldest entries
  const entries = Array.from(translationTimestamps.entries())
    .sort(([, a], [, b]) => a - b);
  
  const toRemove = entries.slice(0, translationCache.size - MAX_CACHE_SIZE);
  
  for (const [key] of toRemove) {
    translationCache.delete(key);
    translationTimestamps.delete(key);
  }
}

/**
 * Get a cached translation
 */
export function getCachedTranslation(
  language: SupportedLanguage, 
  key: string, 
  params?: Record<string, string | number>
): string | null {
  const cacheKey = getCacheKey(language, key, params);
  
  if (!isCacheValid(cacheKey)) {
    translationCache.delete(cacheKey);
    translationTimestamps.delete(cacheKey);
    return null;
  }
  
  return translationCache.get(cacheKey) || null;
}

/**
 * Cache a translation
 */
export function setCachedTranslation(
  language: SupportedLanguage, 
  key: string, 
  value: string, 
  params?: Record<string, string | number>
): void {
  const cacheKey = getCacheKey(language, key, params);
  
  translationCache.set(cacheKey, value);
  translationTimestamps.set(cacheKey, Date.now());
  
  // Periodic cleanup
  if (Math.random() < 0.1) { // 10% chance to trigger cleanup
    cleanupExpiredCache();
    enforceMaxCacheSize();
  }
}

/**
 * Clear all cached translations
 */
export function clearTranslationCache(): void {
  translationCache.clear();
  translationTimestamps.clear();
}

/**
 * Clear cached translations for a specific language
 */
export function clearLanguageCache(language: SupportedLanguage): void {
  const keysToRemove: string[] = [];
  
  for (const key of translationCache.keys()) {
    if (key.startsWith(`${language}:`)) {
      keysToRemove.push(key);
    }
  }
  
  for (const key of keysToRemove) {
    translationCache.delete(key);
    translationTimestamps.delete(key);
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  hitRate: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const timestamps = Array.from(translationTimestamps.values());
  
  return {
    size: translationCache.size,
    maxSize: MAX_CACHE_SIZE,
    hitRate: 0, // This would need to be tracked separately
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null
  };
}

/**
 * Preload translations for better performance
 */
export function preloadTranslations(
  language: SupportedLanguage,
  translations: Record<string, any>,
  prefix: string = ''
): void {
  const preloadRecursive = (obj: any, currentPrefix: string) => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
      
      if (typeof value === 'string') {
        setCachedTranslation(language, fullKey, value);
      } else if (typeof value === 'object' && value !== null) {
        preloadRecursive(value, fullKey);
      }
    }
  };
  
  preloadRecursive(translations, prefix);
}