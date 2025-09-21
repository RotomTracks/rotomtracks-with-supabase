/**
 * Development tools for translation validation and debugging
 */

import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';

// Track missing translations in development
const missingTranslations = new Set<string>();
const usedTranslations = new Set<string>();
const translationUsageCount = new Map<string, number>();

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log missing translation in development
 */
export function logMissingTranslation(
  language: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>
): void {
  if (!isDevelopment()) return;

  const fullKey = `${language}:${key}${params ? `:${JSON.stringify(params)}` : ''}`;
  
  if (!missingTranslations.has(fullKey)) {
    missingTranslations.add(fullKey);
    console.warn(`🌐 Missing translation: ${fullKey}`);
    
    // Group similar missing translations
    const baseKey = `${language}:${key}`;
    const similarMissing = Array.from(missingTranslations)
      .filter(k => k.startsWith(baseKey) && k !== fullKey);
    
    if (similarMissing.length > 0) {
      console.warn(`   Similar missing: ${similarMissing.join(', ')}`);
    }
  }
}

/**
 * Track translation usage
 */
export function trackTranslationUsage(
  language: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>
): void {
  if (!isDevelopment()) return;

  const fullKey = `${language}:${key}${params ? `:${JSON.stringify(params)}` : ''}`;
  usedTranslations.add(fullKey);
  
  const count = translationUsageCount.get(fullKey) || 0;
  translationUsageCount.set(fullKey, count + 1);
}

/**
 * Validate translation key format
 */
export function validateTranslationKey(key: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if key is empty
  if (!key || key.trim() === '') {
    errors.push('Translation key cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Check key format (should use dot notation)
  if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/.test(key)) {
    errors.push('Translation key should use dot notation with alphanumeric characters (e.g., "auth.login.title")');
  }

  // Check for common naming conventions
  if (key.includes('_')) {
    warnings.push('Consider using camelCase instead of snake_case for consistency');
  }

  if (key.includes('-')) {
    warnings.push('Consider using camelCase instead of kebab-case for consistency');
  }

  // Check key length
  if (key.length > 100) {
    warnings.push('Translation key is quite long, consider shortening it');
  }

  // Check for reserved words or patterns
  const reservedPatterns = ['test', 'debug', 'temp', 'TODO', 'FIXME'];
  for (const pattern of reservedPatterns) {
    if (key.toLowerCase().includes(pattern.toLowerCase())) {
      warnings.push(`Translation key contains reserved word "${pattern}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate translation value
 */
export function validateTranslationValue(
  key: string,
  value: any,
  language: SupportedLanguage
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if value exists
  if (value === undefined || value === null) {
    errors.push(`Missing translation value for key "${key}" in language "${language}"`);
    return { isValid: false, errors, warnings };
  }

  // Check value type
  if (typeof value !== 'string' && !Array.isArray(value)) {
    errors.push(`Translation value for "${key}" should be a string or array, got ${typeof value}`);
  }

  if (typeof value === 'string') {
    // Check for empty strings
    if (value.trim() === '') {
      warnings.push(`Empty translation value for key "${key}"`);
    }

    // Check for placeholder consistency
    const placeholders = value.match(/\{\{[^}]+\}\}/g) || [];
    const uniquePlaceholders = new Set(placeholders);
    
    if (placeholders.length !== uniquePlaceholders.size) {
      warnings.push(`Duplicate placeholders found in "${key}"`);
    }

    // Check for common issues
    if (value.includes('{{') && !value.includes('}}')) {
      errors.push(`Malformed placeholder in "${key}": missing closing braces`);
    }

    if (value.includes('}}') && !value.includes('{{')) {
      errors.push(`Malformed placeholder in "${key}": missing opening braces`);
    }

    // Check for HTML tags (might indicate missing escaping)
    if (/<[^>]+>/.test(value)) {
      warnings.push(`HTML tags found in "${key}", ensure proper escaping if intentional`);
    }

    // Language-specific checks
    if (language === 'es') {
      // Check for common Spanish grammar issues
      if (value.includes(' a ') && value.includes(' el ')) {
        warnings.push(`Possible "a + el = al" contraction in "${key}"`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Compare translations between languages to find inconsistencies
 */
export function compareTranslations(
  baseLanguage: SupportedLanguage,
  baseTranslations: Record<string, any>,
  targetLanguage: SupportedLanguage,
  targetTranslations: Record<string, any>
): {
  missingInTarget: string[];
  missingInBase: string[];
  typeMismatches: Array<{ key: string; baseType: string; targetType: string }>;
  placeholderMismatches: Array<{ key: string; basePlaceholders: string[]; targetPlaceholders: string[] }>;
} {
  const missingInTarget: string[] = [];
  const missingInBase: string[] = [];
  const typeMismatches: Array<{ key: string; baseType: string; targetType: string }> = [];
  const placeholderMismatches: Array<{ key: string; basePlaceholders: string[]; targetPlaceholders: string[] }> = [];

  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, fullKey));
      } else {
        flattened[fullKey] = value;
      }
    }
    
    return flattened;
  };

  const flatBase = flattenObject(baseTranslations);
  const flatTarget = flattenObject(targetTranslations);

  // Find missing translations
  for (const key of Object.keys(flatBase)) {
    if (!(key in flatTarget)) {
      missingInTarget.push(key);
    }
  }

  for (const key of Object.keys(flatTarget)) {
    if (!(key in flatBase)) {
      missingInBase.push(key);
    }
  }

  // Find type mismatches and placeholder mismatches
  for (const key of Object.keys(flatBase)) {
    if (key in flatTarget) {
      const baseValue = flatBase[key];
      const targetValue = flatTarget[key];
      
      const baseType = Array.isArray(baseValue) ? 'array' : typeof baseValue;
      const targetType = Array.isArray(targetValue) ? 'array' : typeof targetValue;
      
      if (baseType !== targetType) {
        typeMismatches.push({ key, baseType, targetType });
      }
      
      // Check placeholder consistency for strings
      if (typeof baseValue === 'string' && typeof targetValue === 'string') {
        const basePlaceholders = (baseValue.match(/\{\{[^}]+\}\}/g) || []).sort();
        const targetPlaceholders = (targetValue.match(/\{\{[^}]+\}\}/g) || []).sort();
        
        if (JSON.stringify(basePlaceholders) !== JSON.stringify(targetPlaceholders)) {
          placeholderMismatches.push({ key, basePlaceholders, targetPlaceholders });
        }
      }
    }
  }

  return {
    missingInTarget,
    missingInBase,
    typeMismatches,
    placeholderMismatches
  };
}

/**
 * Get development statistics
 */
export function getDevStats(): {
  missingTranslationsCount: number;
  usedTranslationsCount: number;
  mostUsedTranslations: Array<{ key: string; count: number }>;
  recentMissingTranslations: string[];
} {
  const mostUsedTranslations = Array.from(translationUsageCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([key, count]) => ({ key, count }));

  const recentMissingTranslations = Array.from(missingTranslations)
    .slice(-10);

  return {
    missingTranslationsCount: missingTranslations.size,
    usedTranslationsCount: usedTranslations.size,
    mostUsedTranslations,
    recentMissingTranslations
  };
}

/**
 * Clear development tracking data
 */
export function clearDevData(): void {
  missingTranslations.clear();
  usedTranslations.clear();
  translationUsageCount.clear();
}

/**
 * Generate a report of translation issues
 */
export function generateTranslationReport(): string {
  if (!isDevelopment()) {
    return 'Translation reports are only available in development mode.';
  }

  const stats = getDevStats();
  
  let report = '🌐 Translation Development Report\n';
  report += '================================\n\n';
  
  report += `📊 Statistics:\n`;
  report += `  - Used translations: ${stats.usedTranslationsCount}\n`;
  report += `  - Missing translations: ${stats.missingTranslationsCount}\n\n`;
  
  if (stats.mostUsedTranslations.length > 0) {
    report += `🔥 Most used translations:\n`;
    stats.mostUsedTranslations.forEach(({ key, count }) => {
      report += `  - ${key}: ${count} times\n`;
    });
    report += '\n';
  }
  
  if (stats.recentMissingTranslations.length > 0) {
    report += `❌ Recent missing translations:\n`;
    stats.recentMissingTranslations.forEach(key => {
      report += `  - ${key}\n`;
    });
    report += '\n';
  }
  
  report += `💡 Recommendations:\n`;
  if (stats.missingTranslationsCount > 0) {
    report += `  - Add missing translations to improve user experience\n`;
  }
  if (stats.mostUsedTranslations.length > 0) {
    report += `  - Consider caching frequently used translations\n`;
  }
  
  return report;
}