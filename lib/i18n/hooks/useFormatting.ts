/**
 * Hook for locale-aware formatting utilities
 */

import { useCallback } from 'react';
import { useLanguage } from './useLanguage';
import {
  formatDate,
  formatShortDate,
  formatLongDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  formatFileSize,
  formatDuration
} from '../utils/formatting';

/**
 * Hook that provides locale-aware formatting functions
 */
export function useFormatting() {
  const { language } = useLanguage();

  // Date formatting functions
  const formatDateLocale = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => 
      formatDate(date, language, options),
    [language]
  );

  const formatShortDateLocale = useCallback(
    (date: Date | string | number) => formatShortDate(date, language),
    [language]
  );

  const formatLongDateLocale = useCallback(
    (date: Date | string | number) => formatLongDate(date, language),
    [language]
  );

  const formatTimeLocale = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => 
      formatTime(date, language, options),
    [language]
  );

  const formatDateTimeLocale = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => 
      formatDateTime(date, language, options),
    [language]
  );

  const formatRelativeTimeLocale = useCallback(
    (date: Date | string | number, baseDate?: Date) => 
      formatRelativeTime(date, language, baseDate),
    [language]
  );

  // Number formatting functions
  const formatNumberLocale = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => 
      formatNumber(number, language, options),
    [language]
  );

  const formatCurrencyLocale = useCallback(
    (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => 
      formatCurrency(amount, language, currency, options),
    [language]
  );

  const formatPercentageLocale = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => 
      formatPercentage(number, language, options),
    [language]
  );

  const formatCompactNumberLocale = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => 
      formatCompactNumber(number, language, options),
    [language]
  );

  // Utility formatting functions
  const formatFileSizeLocale = useCallback(
    (bytes: number, decimals?: number) => formatFileSize(bytes, language, decimals),
    [language]
  );

  const formatDurationLocale = useCallback(
    (milliseconds: number, options?: { includeSeconds?: boolean; includeMilliseconds?: boolean }) => 
      formatDuration(milliseconds, language, options),
    [language]
  );

  return {
    // Date and time formatting
    formatDate: formatDateLocale,
    formatShortDate: formatShortDateLocale,
    formatLongDate: formatLongDateLocale,
    formatTime: formatTimeLocale,
    formatDateTime: formatDateTimeLocale,
    formatRelativeTime: formatRelativeTimeLocale,
    
    // Number formatting
    formatNumber: formatNumberLocale,
    formatCurrency: formatCurrencyLocale,
    formatPercentage: formatPercentageLocale,
    formatCompactNumber: formatCompactNumberLocale,
    
    // Utility formatting
    formatFileSize: formatFileSizeLocale,
    formatDuration: formatDurationLocale,
    
    // Current language for reference
    language
  };
}