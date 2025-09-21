/**
 * Simple translation hook that wraps useTypedTranslation
 * Provides backward compatibility for components expecting useTranslation
 */

import { useTypedTranslation } from './useTypedTranslation';

/**
 * Simple translation hook for backward compatibility
 */
export function useTranslation() {
  const { t, language, isLoading } = useTypedTranslation();
  
  return {
    t,
    language,
    isLoading
  };
}