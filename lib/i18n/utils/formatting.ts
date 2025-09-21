/**
 * Locale-aware formatting utilities for dates, numbers, and currency
 */

import { SupportedLanguage } from '../types';

// Locale mappings for JavaScript Intl API
const LOCALE_MAP: Record<SupportedLanguage, string> = {
  es: 'es-ES',
  en: 'en-US'
};

/**
 * Format a date according to the current locale
 */
export function formatDate(
  date: Date | string | number,
  language: SupportedLanguage,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const locale = LOCALE_MAP[language];
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format a date as a short date string (e.g., "12/31/2023" or "31/12/2023")
 */
export function formatShortDate(
  date: Date | string | number,
  language: SupportedLanguage
): string {
  return formatDate(date, language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format a date as a long date string (e.g., "December 31, 2023" or "31 de diciembre de 2023")
 */
export function formatLongDate(
  date: Date | string | number,
  language: SupportedLanguage
): string {
  return formatDate(date, language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a time according to the current locale
 */
export function formatTime(
  date: Date | string | number,
  language: SupportedLanguage,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  const locale = LOCALE_MAP[language];
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format a date and time together
 */
export function formatDateTime(
  date: Date | string | number,
  language: SupportedLanguage,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid DateTime';
  }

  const locale = LOCALE_MAP[language];
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format a relative time (e.g., "2 hours ago", "hace 2 horas")
 */
export function formatRelativeTime(
  date: Date | string | number,
  language: SupportedLanguage,
  baseDate: Date = new Date()
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const baseDateObj = baseDate;
  
  if (isNaN(dateObj.getTime()) || isNaN(baseDateObj.getTime())) {
    return 'Invalid Date';
  }

  const locale = LOCALE_MAP[language];
  const diffInSeconds = Math.floor((baseDateObj.getTime() - dateObj.getTime()) / 1000);

  // Use Intl.RelativeTimeFormat for modern browsers
  if (typeof Intl.RelativeTimeFormat !== 'undefined') {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  // Fallback for older browsers
  const absDiff = Math.abs(diffInSeconds);
  const isPast = diffInSeconds > 0;
  
  if (absDiff < 60) {
    return language === 'es' 
      ? (isPast ? 'hace unos segundos' : 'en unos segundos')
      : (isPast ? 'a few seconds ago' : 'in a few seconds');
  } else if (absDiff < 3600) {
    const minutes = Math.floor(absDiff / 60);
    return language === 'es'
      ? (isPast ? `hace ${minutes} minuto${minutes > 1 ? 's' : ''}` : `en ${minutes} minuto${minutes > 1 ? 's' : ''}`)
      : (isPast ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : `in ${minutes} minute${minutes > 1 ? 's' : ''}`);
  } else if (absDiff < 86400) {
    const hours = Math.floor(absDiff / 3600);
    return language === 'es'
      ? (isPast ? `hace ${hours} hora${hours > 1 ? 's' : ''}` : `en ${hours} hora${hours > 1 ? 's' : ''}`)
      : (isPast ? `${hours} hour${hours > 1 ? 's' : ''} ago` : `in ${hours} hour${hours > 1 ? 's' : ''}`);
  } else {
    const days = Math.floor(absDiff / 86400);
    return language === 'es'
      ? (isPast ? `hace ${days} día${days > 1 ? 's' : ''}` : `en ${days} día${days > 1 ? 's' : ''}`)
      : (isPast ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${days} day${days > 1 ? 's' : ''}`);
  }
}

/**
 * Format a number according to the current locale
 */
export function formatNumber(
  number: number,
  language: SupportedLanguage,
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = LOCALE_MAP[language];
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  language: SupportedLanguage,
  currency: string = 'EUR',
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = LOCALE_MAP[language];
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency
  };

  return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(amount);
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(
  number: number,
  language: SupportedLanguage,
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = LOCALE_MAP[language];
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent'
  };

  return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(number);
}

/**
 * Format a large number with compact notation (e.g., "1.2K", "1.2M")
 */
export function formatCompactNumber(
  number: number,
  language: SupportedLanguage,
  options: Intl.NumberFormatOptions = {}
): string {
  const locale = LOCALE_MAP[language];
  
  // Check if Intl.NumberFormat supports compact notation
  if (typeof Intl.NumberFormat !== 'undefined') {
    try {
      const defaultOptions: Intl.NumberFormatOptions = {
        notation: 'compact',
        compactDisplay: 'short'
      };
      
      return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(number);
    } catch (error) {
      // Fallback for browsers that don't support compact notation
    }
  }

  // Manual fallback for compact numbers
  const absNumber = Math.abs(number);
  const sign = number < 0 ? '-' : '';
  
  if (absNumber >= 1000000000) {
    return `${sign}${(absNumber / 1000000000).toFixed(1)}B`;
  } else if (absNumber >= 1000000) {
    return `${sign}${(absNumber / 1000000).toFixed(1)}M`;
  } else if (absNumber >= 1000) {
    return `${sign}${(absNumber / 1000).toFixed(1)}K`;
  } else {
    return formatNumber(number, language, options);
  }
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(
  bytes: number,
  language: SupportedLanguage,
  decimals: number = 2
): string {
  if (bytes === 0) {
    return language === 'es' ? '0 Bytes' : '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = language === 'es' 
    ? ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(
  milliseconds: number,
  language: SupportedLanguage,
  options: { includeSeconds?: boolean; includeMilliseconds?: boolean } = {}
): string {
  const { includeSeconds = true, includeMilliseconds = false } = options;
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(language === 'es' ? `${hours}h` : `${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(language === 'es' ? `${minutes}m` : `${minutes}m`);
  }
  
  if (includeSeconds && seconds > 0) {
    parts.push(language === 'es' ? `${seconds}s` : `${seconds}s`);
  }
  
  if (includeMilliseconds && ms > 0) {
    parts.push(language === 'es' ? `${ms}ms` : `${ms}ms`);
  }

  if (parts.length === 0) {
    return language === 'es' ? '0s' : '0s';
  }

  return parts.join(' ');
}