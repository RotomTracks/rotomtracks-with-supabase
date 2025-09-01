/**
 * TypeScript types and interfaces for the i18n system
 */

// Supported languages
export type SupportedLanguage = 'es' | 'en';

// Translation function type
export type TranslationFunction = (key: string, params?: Record<string, string | number>) => string | string[];

// Main i18n context interface
export interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationFunction;
  isLoading: boolean;
}

// Language preference storage interface
export interface LanguagePreference {
  language: SupportedLanguage;
  timestamp: number;
  source: 'user' | 'browser' | 'default';
}

// Language detection result
export interface LanguageDetectionResult {
  language: SupportedLanguage;
  source: 'localStorage' | 'url' | 'browser' | 'default';
  confidence: number;
}

// Translation namespace structure
export interface TranslationNamespace {
  [key: string]: string | string[] | TranslationNamespace;
}

// Locale data structure
export interface LocaleData {
  auth: TranslationNamespace;
  common: TranslationNamespace;
  tournament: TranslationNamespace;
}

// Language metadata
export interface LanguageMetadata {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

// Translation key validation result
export interface TranslationValidationResult {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
}

// Constants
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['es', 'en'];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'preferred-language';

// Language metadata
export const LANGUAGE_METADATA: Record<SupportedLanguage, LanguageMetadata> = {
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
};