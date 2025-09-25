/**
 * Tournament Status Management Utilities
 * 
 * Centralized status handling that replaces all duplicated functions with:
 * - Consistent Spanish translations
 * - Unified color schemes using existing Tailwind classes
 * - Status validation and transition logic
 * - Support for tournament, participant, and file upload statuses
 */

import { 
  TournamentStatus, 
  ParticipantStatus, 
  TournamentType 
} from '@/lib/types/tournament';

// File upload status type (commonly used across components)
export type FileUploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

// Status configuration interface
export interface StatusConfig {
  label: string; // Consistent Spanish translation
  color: string; // Complete CSS class (bg-blue-100 text-blue-800)
  bgColor: string; // Background only
  textColor: string; // Text color only
  borderColor: string; // Border color only
  icon: string; // Emoji or icon identifier
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
}

// Centralized translations
export interface StatusTranslations {
  tournament: Record<TournamentStatus, string>;
  participant: Record<ParticipantStatus, string>;
  file: Record<FileUploadStatus, string>;
}

/**
 * Consistent Spanish translations for all status types
 */
export const STATUS_TRANSLATIONS: StatusTranslations = {
  tournament: {
    [TournamentStatus.UPCOMING]: 'Próximo',
    [TournamentStatus.ONGOING]: 'En Curso',
    [TournamentStatus.COMPLETED]: 'Completado',
    [TournamentStatus.CANCELLED]: 'Cancelado'
  },
  participant: {
    [ParticipantStatus.REGISTERED]: 'Registrado',
    [ParticipantStatus.CHECKED_IN]: 'Confirmado',
    [ParticipantStatus.DROPPED]: 'Retirado'
  },
  file: {
    pending: 'Pendiente',
    uploading: 'Subiendo',
    completed: 'Completado',
    error: 'Error'
  }
};

/**
 * Tournament status configurations using existing color constants
 */
const TOURNAMENT_STATUS_CONFIGS: Record<TournamentStatus, StatusConfig> = {
  [TournamentStatus.UPCOMING]: {
    label: STATUS_TRANSLATIONS.tournament[TournamentStatus.UPCOMING],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    bgColor: 'bg-blue-100 dark:bg-blue-800',
    textColor: 'text-blue-800 dark:text-blue-100',
    borderColor: 'border-blue-200 dark:border-blue-600',
    icon: '📅',
    badgeVariant: 'default'
  },
  [TournamentStatus.ONGOING]: {
    label: STATUS_TRANSLATIONS.tournament[TournamentStatus.ONGOING],
    color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    bgColor: 'bg-green-100 dark:bg-green-800',
    textColor: 'text-green-800 dark:text-green-100',
    borderColor: 'border-green-200 dark:border-green-600',
    icon: '🎮',
    badgeVariant: 'default'
  },
  [TournamentStatus.COMPLETED]: {
    label: STATUS_TRANSLATIONS.tournament[TournamentStatus.COMPLETED],
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    textColor: 'text-gray-800 dark:text-gray-100',
    borderColor: 'border-gray-200 dark:border-gray-500',
    icon: '🏆',
    badgeVariant: 'secondary'
  },
  [TournamentStatus.CANCELLED]: {
    label: STATUS_TRANSLATIONS.tournament[TournamentStatus.CANCELLED],
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    textColor: 'text-red-800 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '❌',
    badgeVariant: 'destructive'
  }
};

/**
 * Participant status configurations
 */
const PARTICIPANT_STATUS_CONFIGS: Record<ParticipantStatus, StatusConfig> = {
  [ParticipantStatus.REGISTERED]: {
    label: STATUS_TRANSLATIONS.participant[ParticipantStatus.REGISTERED],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    textColor: 'text-blue-800 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '📝',
    badgeVariant: 'outline'
  },
  [ParticipantStatus.CHECKED_IN]: {
    label: STATUS_TRANSLATIONS.participant[ParticipantStatus.CHECKED_IN],
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    textColor: 'text-green-800 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '✅',
    badgeVariant: 'default'
  },
  [ParticipantStatus.DROPPED]: {
    label: STATUS_TRANSLATIONS.participant[ParticipantStatus.DROPPED],
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    textColor: 'text-red-800 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '🚫',
    badgeVariant: 'destructive'
  }
};

/**
 * File upload status configurations
 */
const FILE_STATUS_CONFIGS: Record<FileUploadStatus, StatusConfig> = {
  pending: {
    label: STATUS_TRANSLATIONS.file.pending,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    textColor: 'text-gray-800 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-800',
    icon: '⏳',
    badgeVariant: 'secondary'
  },
  uploading: {
    label: STATUS_TRANSLATIONS.file.uploading,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    textColor: 'text-blue-800 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '⬆️',
    badgeVariant: 'default'
  },
  completed: {
    label: STATUS_TRANSLATIONS.file.completed,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    textColor: 'text-green-800 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '✅',
    badgeVariant: 'default'
  },
  error: {
    label: STATUS_TRANSLATIONS.file.error,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    textColor: 'text-red-800 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '❌',
    badgeVariant: 'destructive'
  }
};

/**
 * Valid status transitions for tournaments
 */
const TOURNAMENT_STATUS_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  [TournamentStatus.UPCOMING]: [TournamentStatus.ONGOING, TournamentStatus.CANCELLED],
  [TournamentStatus.ONGOING]: [TournamentStatus.COMPLETED, TournamentStatus.CANCELLED],
  [TournamentStatus.COMPLETED]: [TournamentStatus.ONGOING], // Allow reopening if needed
  [TournamentStatus.CANCELLED]: [TournamentStatus.UPCOMING, TournamentStatus.ONGOING]
};

/**
 * Valid status transitions for participants
 */
const PARTICIPANT_STATUS_TRANSITIONS: Record<ParticipantStatus, ParticipantStatus[]> = {
  [ParticipantStatus.REGISTERED]: [ParticipantStatus.CHECKED_IN, ParticipantStatus.DROPPED],
  [ParticipantStatus.CHECKED_IN]: [ParticipantStatus.DROPPED],
  [ParticipantStatus.DROPPED]: [ParticipantStatus.REGISTERED] // Allow re-registration
};

/**
 * Tournament Status Manager - Centralized status management for tournaments
 * 
 * Provides consistent status handling, translations, and color schemes
 * across all tournament-related components and API routes.
 * 
 * @example
 * ```typescript
 * import { TournamentStatusManager } from '@/lib/utils/tournament-status';
 * 
 * const config = TournamentStatusManager.getStatusConfig('upcoming', 'tournament');
 * const color = TournamentStatusManager.getStatusColor('upcoming', 'tournament');
 * const label = TournamentStatusManager.getStatusLabel('upcoming', 'tournament');
 * ```
 */
export const TournamentStatusManager = {
  /**
   * Get tournament status configuration
   */
  getTournamentStatusConfig: (status: TournamentStatus): StatusConfig => {
    const config = TOURNAMENT_STATUS_CONFIGS[status];
    if (!config) {
      console.warn(`Unknown tournament status: ${status}`);
      return TOURNAMENT_STATUS_CONFIGS[TournamentStatus.UPCOMING]; // Fallback
    }
    return config;
  },

  /**
   * Get participant status configuration
   */
  getParticipantStatusConfig: (status: ParticipantStatus): StatusConfig => {
    const config = PARTICIPANT_STATUS_CONFIGS[status];
    if (!config) {
      console.warn(`Unknown participant status: ${status}`);
      return PARTICIPANT_STATUS_CONFIGS[ParticipantStatus.REGISTERED]; // Fallback
    }
    return config;
  },

  /**
   * Get file upload status configuration
   */
  getFileStatusConfig: (status: FileUploadStatus): StatusConfig => {
    const config = FILE_STATUS_CONFIGS[status];
    if (!config) {
      console.warn(`Unknown file status: ${status}`);
      return FILE_STATUS_CONFIGS.pending; // Fallback
    }
    return config;
  },

  /**
   * Get status label (translation) - replaces all getStatusText functions
   */
  getStatusLabel: (status: string, type: 'tournament' | 'participant' | 'file'): string => {
    switch (type) {
      case 'tournament':
        return STATUS_TRANSLATIONS.tournament[status as TournamentStatus] || status;
      case 'participant':
        return STATUS_TRANSLATIONS.participant[status as ParticipantStatus] || status;
      case 'file':
        return STATUS_TRANSLATIONS.file[status as FileUploadStatus] || status;
      default:
        return status;
    }
  },

  /**
   * Get status color classes - replaces all getStatusColor functions
   */
  getStatusColor: (status: string, type: 'tournament' | 'participant' | 'file'): string => {
    switch (type) {
      case 'tournament':
        return TOURNAMENT_STATUS_CONFIGS[status as TournamentStatus]?.color || 
               TOURNAMENT_STATUS_CONFIGS[TournamentStatus.UPCOMING].color;
      case 'participant':
        return PARTICIPANT_STATUS_CONFIGS[status as ParticipantStatus]?.color || 
               PARTICIPANT_STATUS_CONFIGS[ParticipantStatus.REGISTERED].color;
      case 'file':
        return FILE_STATUS_CONFIGS[status as FileUploadStatus]?.color || 
               FILE_STATUS_CONFIGS.pending.color;
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  },

  /**
   * Check if status transition is valid
   */
  isStatusTransitionValid: (
    from: TournamentStatus | ParticipantStatus, 
    to: TournamentStatus | ParticipantStatus,
    type: 'tournament' | 'participant'
  ): boolean => {
    if (type === 'tournament') {
      const validTransitions = TOURNAMENT_STATUS_TRANSITIONS[from as TournamentStatus];
      return validTransitions?.includes(to as TournamentStatus) || false;
    } else {
      const validTransitions = PARTICIPANT_STATUS_TRANSITIONS[from as ParticipantStatus];
      return validTransitions?.includes(to as ParticipantStatus) || false;
    }
  },

  /**
   * Get valid next statuses for a given status
   */
  getValidTransitions: (
    status: TournamentStatus | ParticipantStatus,
    type: 'tournament' | 'participant'
  ): (TournamentStatus | ParticipantStatus)[] => {
    if (type === 'tournament') {
      return TOURNAMENT_STATUS_TRANSITIONS[status as TournamentStatus] || [];
    } else {
      return PARTICIPANT_STATUS_TRANSITIONS[status as ParticipantStatus] || [];
    }
  },

  /**
   * Get tournament type color (for tournament type badges)
   */
  getTournamentTypeColor: (type: TournamentType): string => {
    const typeColors: Record<TournamentType, string> = {
      [TournamentType.TCG_PRERELEASE]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      [TournamentType.TCG_LEAGUE_CHALLENGE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      [TournamentType.TCG_LEAGUE_CUP]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      [TournamentType.VGC_PREMIER_EVENT]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      [TournamentType.GO_PREMIER_EVENT]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    };
    
    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  },

  /**
   * Get tournament type icon
   */
  getTournamentTypeIcon: (type: TournamentType): string => {
    const typeIcons: Record<TournamentType, string> = {
      [TournamentType.TCG_PRERELEASE]: '🎴',
      [TournamentType.TCG_LEAGUE_CHALLENGE]: '⚔️',
      [TournamentType.TCG_LEAGUE_CUP]: '🏆',
      [TournamentType.VGC_PREMIER_EVENT]: '🎮',
      [TournamentType.GO_PREMIER_EVENT]: '📱'
    };
    
    return typeIcons[type] || '🏆';
  }
};

/**
 * Convenience functions that match the old API for easier migration
 * These can be used as drop-in replacements for existing functions
 */

/**
 * Get tournament status color classes
 * @param status - Tournament status
 * @returns Tailwind CSS color classes
 */
export const getStatusColor = (status: TournamentStatus): string => 
  TournamentStatusManager.getStatusColor(status, 'tournament');

/**
 * Get tournament status text in Spanish
 * @param status - Tournament status
 * @returns Translated status text
 */
export const getStatusText = (status: TournamentStatus): string => 
  TournamentStatusManager.getStatusLabel(status, 'tournament');

/**
 * Get participant status color classes
 * @param status - Participant status
 * @returns Tailwind CSS color classes
 */
export const getParticipantStatusColor = (status: ParticipantStatus): string => 
  TournamentStatusManager.getStatusColor(status, 'participant');

/**
 * Get participant status text in Spanish
 * @param status - Participant status
 * @returns Translated status text
 */
export const getParticipantStatusText = (status: ParticipantStatus): string => 
  TournamentStatusManager.getStatusLabel(status, 'participant');

/**
 * Get file upload status color classes
 * @param status - File upload status
 * @returns Tailwind CSS color classes
 */
export const getFileStatusColor = (status: FileUploadStatus): string => 
  TournamentStatusManager.getStatusColor(status, 'file');

/**
 * Get file upload status text in Spanish
 * @param status - File upload status
 * @returns Translated status text
 */
export const getFileStatusText = (status: FileUploadStatus): string => 
  TournamentStatusManager.getStatusLabel(status, 'file');

/**
 * Get tournament type color classes
 * @param type - Tournament type
 * @returns Tailwind CSS color classes
 */
export const getTournamentTypeColor = (type: TournamentType): string => 
  TournamentStatusManager.getTournamentTypeColor(type);

/**
 * Get tournament type icon
 * @param type - Tournament type
 * @returns Icon name or emoji
 */
export const getTournamentTypeIcon = (type: TournamentType): string => 
  TournamentStatusManager.getTournamentTypeIcon(type);
