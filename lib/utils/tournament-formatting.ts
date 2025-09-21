/**
 * Tournament Formatting Utilities
 * 
 * Centralized formatting functions for tournaments that handle:
 * - TDF to Web date conversion (MM/DD/YYYY <-> ISO)
 * - Consistent date/time formatting using existing i18n system
 * - TDF-specific formatting for player names and tournament IDs
 * - Error handling and validation
 */

import { useFormatting } from '@/lib/i18n';

// Types for TDF date conversion
export interface TDFDateConversion {
  tdfToISO: (tdfDate: string) => string;
  isoToTDF: (isoDate: string) => string;
  validateTDFDate: (date: string) => boolean;
  validateISODate: (date: string) => boolean;
}

// Main tournament formatters interface
export interface TournamentFormatters {
  // Date formatting using existing useFormatting hook
  formatDate: (date: string | Date, style?: 'short' | 'medium' | 'long') => string;
  formatTime: (date: string | Date) => string;
  formatDateTime: (date: string | Date) => string;
  formatRelativeTime: (date: string | Date) => string;
  
  // TDF-specific formatting
  formatTDFDate: (tdfDate: string) => string;
  formatPlayerName: (firstName: string, lastName: string) => string;
  formatTournamentId: (id: string) => string;
  
  // Conversion utilities
  dateConversion: TDFDateConversion;
}

/**
 * TDF Date Conversion Utilities
 * Handles conversion between TDF format (MM/DD/YYYY) and ISO format
 */
export const TDFDateConversion: TDFDateConversion = {
  /**
   * Convert TDF date format (MM/DD/YYYY) to ISO string
   */
  tdfToISO: (tdfDate: string): string => {
    try {
      if (!TDFDateConversion.validateTDFDate(tdfDate)) {
        throw new Error(`Invalid TDF date format: ${tdfDate}. Expected MM/DD/YYYY`);
      }

      const [month, day, year] = tdfDate.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Validate the constructed date
      if (date.getFullYear() !== year || 
          date.getMonth() !== month - 1 || 
          date.getDate() !== day) {
        throw new Error(`Invalid date values in TDF date: ${tdfDate}`);
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('TDF to ISO conversion error:', error);
      throw new Error(`Failed to convert TDF date "${tdfDate}" to ISO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Convert ISO date string to TDF format (MM/DD/YYYY)
   */
  isoToTDF: (isoDate: string): string => {
    try {
      if (!TDFDateConversion.validateISODate(isoDate)) {
        throw new Error(`Invalid ISO date format: ${isoDate}`);
      }

      const date = new Date(isoDate);
      
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date value: ${isoDate}`);
      }

      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      
      return `${month}/${day}/${year}`;
    } catch (error) {
      console.error('ISO to TDF conversion error:', error);
      throw new Error(`Failed to convert ISO date "${isoDate}" to TDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Validate TDF date format (MM/DD/YYYY)
   */
  validateTDFDate: (date: string): boolean => {
    if (!date || typeof date !== 'string') return false;
    
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!regex.test(date)) return false;
    
    try {
      const [month, day, year] = date.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      return dateObj.getFullYear() === year &&
             dateObj.getMonth() === month - 1 &&
             dateObj.getDate() === day &&
             dateObj <= new Date(); // Don't allow future dates beyond reasonable limits
    } catch {
      return false;
    }
  },

  /**
   * Validate ISO date format
   */
  validateISODate: (date: string): boolean => {
    if (!date || typeof date !== 'string') return false;
    
    try {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime()) && dateObj.toISOString() === date;
    } catch {
      return false;
    }
  }
};

/**
 * TDF-specific formatting utilities
 */
export const TDFFormatters = {
  /**
   * Format TDF date for display (converts to ISO then formats)
   */
  formatTDFDate: (tdfDate: string): string => {
    try {
      const isoDate = TDFDateConversion.tdfToISO(tdfDate);
      return new Date(isoDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('TDF date formatting error:', error);
      return tdfDate; // Return original if conversion fails
    }
  },

  /**
   * Format player name consistently
   */
  formatPlayerName: (firstName: string, lastName: string): string => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    
    if (!first && !last) return 'Nombre no disponible';
    if (!first) return last;
    if (!last) return first;
    
    return `${first} ${last}`;
  },

  /**
   * Format tournament ID (YY-MM-XXXXXX)
   */
  formatTournamentId: (id: string): string => {
    if (!id || typeof id !== 'string') return 'ID no válido';
    
    const regex = /^\d{2}-\d{2}-\d{6}$/;
    if (!regex.test(id)) {
      console.warn(`Invalid tournament ID format: ${id}. Expected YY-MM-XXXXXX`);
      return id; // Return as-is if format is wrong
    }
    
    return id.toUpperCase();
  },

  /**
   * Generate a new tournament ID
   */
  generateTournamentId: (date: Date = new Date()): string => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    return `${year}-${month}-${sequence}`;
  }
};

/**
 * Hook-based tournament formatters that use the existing i18n system
 * This should be used in React components
 */
export function useTournamentFormatting(): TournamentFormatters {
  const formatting = useFormatting();

  return {
    // Delegate to existing i18n formatting functions
    formatDate: (date: string | Date, style: 'short' | 'medium' | 'long' = 'medium') => {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        switch (style) {
          case 'short':
            return formatting.formatShortDate(dateObj);
          case 'long':
            return formatting.formatLongDate(dateObj);
          case 'medium':
          default:
            return formatting.formatDate(dateObj);
        }
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Fecha inválida';
      }
    },

    formatTime: (date: string | Date) => {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatting.formatTime(dateObj);
      } catch (error) {
        console.error('Time formatting error:', error);
        return 'Hora inválida';
      }
    },

    formatDateTime: (date: string | Date) => {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatting.formatDateTime(dateObj);
      } catch (error) {
        console.error('DateTime formatting error:', error);
        return 'Fecha y hora inválida';
      }
    },

    formatRelativeTime: (date: string | Date) => {
      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatting.formatRelativeTime(dateObj);
      } catch (error) {
        console.error('Relative time formatting error:', error);
        return 'Tiempo inválido';
      }
    },

    // TDF-specific formatters
    formatTDFDate: TDFFormatters.formatTDFDate,
    formatPlayerName: TDFFormatters.formatPlayerName,
    formatTournamentId: TDFFormatters.formatTournamentId,

    // Conversion utilities
    dateConversion: TDFDateConversion
  };
}

/**
 * Non-hook version for use outside React components
 * Uses default Spanish locale
 */
export const TournamentFormatting = {
  // Date formatting with default Spanish locale
  formatDate: (date: string | Date, style: 'short' | 'medium' | 'long' = 'medium'): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }

      const options: Intl.DateTimeFormatOptions = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        medium: { year: 'numeric', month: 'long', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
      }[style];

      return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Fecha inválida';
    }
  },

  formatTime: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }

      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Hora inválida';
    }
  },

  formatDateTime: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }

      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('DateTime formatting error:', error);
      return 'Fecha y hora inválida';
    }
  },

  // TDF-specific formatters
  ...TDFFormatters,

  // Conversion utilities
  dateConversion: TDFDateConversion
};

// Export individual utilities for specific use cases
export { TDFDateConversion, TDFFormatters };

// Export types
export type { TDFDateConversion as TDFDateConversionType, TournamentFormatters };