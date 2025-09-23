/**
 * Main i18n exports
 * This file serves as the main entry point for all internationalization functionality
 */

// Export the main hooks
export { useTypedTranslation } from './hooks/useTypedTranslation';
export { useLanguage } from './hooks/useLanguage';
export { useFormatting } from './hooks/useFormatting';

// Export types
export type { LocaleData, TranslationNamespace, SupportedLanguage } from './types';

// Export constants
export { SUPPORTED_LANGUAGES, LANGUAGE_METADATA, DEFAULT_LANGUAGE } from './types';

// Export locale data
export { default as enLocale } from './locales/en';
export { default as esLocale } from './locales/es';

// Export formatting utilities
export * from './utils/formatting';

// Export optimization utilities
export * from './utils/cache';
export * from './utils/lazy-loader';

// Export development tools (only in development)
export * from './utils/dev-tools';
export { TranslationDevTools } from './components/TranslationDevTools';