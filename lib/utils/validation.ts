// Validation utilities for Tournament Management System

/**
 * Validates Player ID format
 * Player ID must be 1-7 digits, range 1-9999999
 * @param playerId - The player ID to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validatePlayerId(playerId: string): boolean {
  if (!playerId) return false;
  
  // Check if it's a number between 1 and 9999999
  const num = parseInt(playerId, 10);
  if (isNaN(num)) return false;
  
  // Must be between 1 and 9999999 (inclusive)
  if (num < 1 || num > 9999999) return false;
  
  // Must not have leading zeros (except for single digit)
  if (playerId !== num.toString()) return false;
  
  return true;
}

/**
 * Validates Tournament ID format
 * Tournament ID must follow format: YY-MM-XXXXXX
 * Where YY = year (last 2 digits), MM = month (01-12), XXXXXX = 6-digit sequence
 * @param tournamentId - The tournament ID to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateTournamentId(tournamentId: string): boolean {
  if (!tournamentId) return false;
  
  // Check format: YY-MM-XXXXXX
  const regex = /^[0-9]{2}-[0-9]{2}-[0-9]{6}$/;
  if (!regex.test(tournamentId)) return false;
  
  const parts = tournamentId.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const sequence = parseInt(parts[2], 10);
  
  // Validate year (00-99, but typically 20-99 for 2020-2099)
  if (year < 0 || year > 99) return false;
  
  // Validate month (01-12)
  if (month < 1 || month > 12) return false;
  
  // Validate sequence (000001-999999)
  if (sequence < 1 || sequence > 999999) return false;
  
  return true;
}

/**
 * Formats a player ID for display
 * Adds dots for readability: 1234567 -> 12.34.567
 * @param playerId - The player ID to format
 * @returns string - formatted player ID
 */
export function formatPlayerId(playerId: string): string {
  if (!validatePlayerId(playerId)) return playerId;
  
  const id = playerId.toString();
  if (id.length <= 2) return id;
  if (id.length <= 4) return `${id.slice(0, 2)}.${id.slice(2)}`;
  if (id.length <= 6) return `${id.slice(0, 2)}.${id.slice(2, 4)}.${id.slice(4)}`;
  return `${id.slice(0, 2)}.${id.slice(2, 4)}.${id.slice(4)}`;
}

/**
 * Generates a tournament ID for a given date
 * @param date - Date object for the tournament
 * @param sequence - Sequence number for the month (1-999999)
 * @returns string - formatted tournament ID
 */
export function generateTournamentId(date: Date, sequence: number): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seq = sequence.toString().padStart(6, '0');
  
  return `${year}-${month}-${seq}`;
}

/**
 * Parses a tournament ID to extract components
 * @param tournamentId - The tournament ID to parse
 * @returns object with year, month, sequence or null if invalid
 */
export function parseTournamentId(tournamentId: string): { year: number; month: number; sequence: number } | null {
  if (!validateTournamentId(tournamentId)) return null;
  
  const parts = tournamentId.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    sequence: parseInt(parts[2], 10)
  };
}

/**
 * Gets the next sequence number for a tournament in a given month/year
 * This would typically query the database to find the highest sequence
 * @param year - Year (2-digit)
 * @param month - Month (1-12)
 * @returns Promise<number> - Next sequence number
 */
export async function getNextTournamentSequence(year: number, month: number): Promise<number> {
  // This would be implemented with actual database query
  // For now, return a placeholder
  return 1;
}

/**
 * Validation error messages
 */
export const ValidationMessages = {
  PLAYER_ID_INVALID: 'Player ID must be a number between 1 and 9999999',
  PLAYER_ID_REQUIRED: 'Player ID is required',
  TOURNAMENT_ID_INVALID: 'Tournament ID must follow format YY-MM-XXXXXX (e.g., 25-02-000001)',
  TOURNAMENT_ID_REQUIRED: 'Tournament ID is required',
  TOURNAMENT_ID_EXISTS: 'A tournament with this ID already exists',
} as const;

/**
 * Form validation for tournament creation
 */
export interface TournamentValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    tournament_type?: string;
    official_tournament_id?: string;
    city?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    max_players?: string;
  };
}

/**
 * Validates tournament creation form data
 * @param data - Tournament form data
 * @returns TournamentValidationResult
 */
export function validateTournamentForm(data: any): TournamentValidationResult {
  const errors: TournamentValidationResult['errors'] = {};
  
  // Name validation
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Tournament name must be at least 3 characters long';
  }
  
  // Tournament type validation
  if (!data.tournament_type) {
    errors.tournament_type = 'Tournament type is required';
  }
  
  // Tournament ID validation
  if (!data.official_tournament_id) {
    errors.official_tournament_id = ValidationMessages.TOURNAMENT_ID_REQUIRED;
  } else if (!validateTournamentId(data.official_tournament_id)) {
    errors.official_tournament_id = ValidationMessages.TOURNAMENT_ID_INVALID;
  }
  
  // City validation
  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'City must be at least 2 characters long';
  }
  
  // Country validation
  if (!data.country || data.country.trim().length < 2) {
    errors.country = 'Country must be at least 2 characters long';
  }
  
  // Start date validation
  if (!data.start_date) {
    errors.start_date = 'Start date is required';
  } else {
    const startDate = new Date(data.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      errors.start_date = 'Start date cannot be in the past';
    }
  }
  
  // End date validation (if provided)
  if (data.end_date && data.start_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    if (endDate < startDate) {
      errors.end_date = 'End date cannot be before start date';
    }
  }
  
  // Max players validation (if provided)
  if (data.max_players !== undefined && data.max_players !== null) {
    const maxPlayers = parseInt(data.max_players, 10);
    if (isNaN(maxPlayers) || maxPlayers < 4 || maxPlayers > 1000) {
      errors.max_players = 'Maximum players must be between 4 and 1000';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Form validation for player registration
 */
export interface RegistrationValidationResult {
  isValid: boolean;
  errors: {
    player_name?: string;
    player_id?: string;
  };
}

/**
 * Validates player registration form data
 * @param data - Registration form data
 * @returns RegistrationValidationResult
 */
export function validateRegistrationForm(data: any): RegistrationValidationResult {
  const errors: RegistrationValidationResult['errors'] = {};
  
  // Player name validation
  if (!data.player_name || data.player_name.trim().length < 2) {
    errors.player_name = 'Player name must be at least 2 characters long';
  }
  
  // Player ID validation
  if (!data.player_id) {
    errors.player_id = ValidationMessages.PLAYER_ID_REQUIRED;
  } else if (!validatePlayerId(data.player_id)) {
    errors.player_id = ValidationMessages.PLAYER_ID_INVALID;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}