// Validation utilities for Tournament Management System

import { UserRole } from '@/lib/types/tournament';

// Auth form data interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  playerId: string;
  birthYear: string;
  userRole: UserRole;
  organizationName?: string;
  businessEmail?: string;
  phoneNumber?: string;
  address?: string;
  pokemonLeagueUrl?: string;
  experienceDescription?: string;
}

export interface PasswordResetFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

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
 * Validates a birth year
 * @param year - The birth year to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateBirthYear(year: string | number): boolean {
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  
  if (isNaN(yearNum)) return false;
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearNum;
  
  // Must be at least 13 years old and less than 100 years old
  return age >= 13 && age < 100;
}

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a password
 * @param password - The password to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validatePassword(password: string): boolean {
  if (!password) return false;
  
  // Minimum 6 characters
  return password.length >= 6;
}

/**
 * Validates that two passwords match
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns boolean - true if they match, false otherwise
 */
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Validates a name (first name or last name)
 * @param name - The name to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateName(name: string): boolean {
  if (!name) return false;
  
  // At least 1 character, only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 1;
}

/**
 * Validates an organization name
 * @param name - The organization name to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateOrganizationName(name: string): boolean {
  if (!name) return false;
  
  // At least 2 characters
  return name.trim().length >= 2;
}

/**
 * Validates phone number (Spanish format)
 * @param phone - The phone number to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Spanish phone number patterns:
  // Mobile: 6XX XXX XXX or 7XX XXX XXX (9 digits)
  // Landline: 9XX XXX XXX (9 digits)
  // International: +34 followed by 9 digits
  const phoneRegex = /^(\+34)?[679]\d{8}$/;
  
  return phoneRegex.test(cleanPhone);
}

/**
 * Validation error messages (Spanish)
 */
export const ValidationMessages = {
  // Player ID validation
  PLAYER_ID_INVALID: 'El Player ID debe ser un número entre 1 y 9999999',
  PLAYER_ID_REQUIRED: 'El Player ID es obligatorio',
  
  // Tournament ID validation
  TOURNAMENT_ID_INVALID: 'El ID del torneo debe seguir el formato YY-MM-XXXXXX (ej: 25-02-000001)',
  TOURNAMENT_ID_REQUIRED: 'El ID del torneo es obligatorio',
  TOURNAMENT_ID_EXISTS: 'Ya existe un torneo con este ID',
  
  // Birth year validation
  BIRTH_YEAR_INVALID: 'El año de nacimiento debe ser un año válido',
  BIRTH_YEAR_REQUIRED: 'El año de nacimiento es obligatorio',
  BIRTH_YEAR_TOO_OLD: 'El año de nacimiento indica una edad mayor a 100 años',
  BIRTH_YEAR_TOO_YOUNG: 'Debes tener al menos 13 años',
  
  // Email validation
  EMAIL_INVALID: 'Ingresa un correo electrónico válido',
  EMAIL_REQUIRED: 'El correo electrónico es obligatorio',
  
  // Password validation
  PASSWORD_REQUIRED: 'La contraseña es obligatoria',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
  PASSWORD_TOO_WEAK: 'La contraseña es muy débil',
  PASSWORDS_NO_MATCH: 'Las contraseñas no coinciden',
  
  // Name validation
  FIRST_NAME_REQUIRED: 'El nombre es obligatorio',
  LAST_NAME_REQUIRED: 'Los apellidos son obligatorios',
  
  // Organization validation
  ORGANIZATION_NAME_REQUIRED: 'El nombre de la organización es obligatorio para organizadores',
  ORGANIZATION_NAME_TOO_SHORT: 'El nombre de la organización debe tener al menos 2 caracteres',
  
  // User role validation
  USER_ROLE_REQUIRED: 'Selecciona un tipo de cuenta'
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

/**
 * Validates login form data
 * @param data - The login form data to validate
 * @returns ValidationResult - validation result with errors
 */
export function validateLoginForm(data: LoginFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Email validation
  if (!data.email) {
    errors.email = ValidationMessages.EMAIL_REQUIRED;
  } else if (!validateEmail(data.email)) {
    errors.email = ValidationMessages.EMAIL_INVALID;
  }
  
  // Password validation
  if (!data.password) {
    errors.password = ValidationMessages.PASSWORD_REQUIRED;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates sign up form data
 * @param data - The sign up form data to validate
 * @returns ValidationResult - validation result with errors
 */
export function validateSignUpForm(data: SignUpFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Email validation
  if (!data.email) {
    errors.email = ValidationMessages.EMAIL_REQUIRED;
  } else if (!validateEmail(data.email)) {
    errors.email = ValidationMessages.EMAIL_INVALID;
  }
  
  // Password validation
  if (!data.password) {
    errors.password = ValidationMessages.PASSWORD_REQUIRED;
  } else if (!validatePassword(data.password)) {
    errors.password = ValidationMessages.PASSWORD_TOO_SHORT;
  }
  
  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = ValidationMessages.PASSWORD_REQUIRED;
  } else if (!validatePasswordMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = ValidationMessages.PASSWORDS_NO_MATCH;
  }
  
  // First name validation
  if (!data.firstName) {
    errors.firstName = ValidationMessages.FIRST_NAME_REQUIRED;
  } else if (!validateName(data.firstName)) {
    errors.firstName = 'El nombre contiene caracteres no válidos';
  }
  
  // Last name validation
  if (!data.lastName) {
    errors.lastName = ValidationMessages.LAST_NAME_REQUIRED;
  } else if (!validateName(data.lastName)) {
    errors.lastName = 'Los apellidos contienen caracteres no válidos';
  }
  
  // Player ID validation
  if (!data.playerId) {
    errors.playerId = ValidationMessages.PLAYER_ID_REQUIRED;
  } else if (!validatePlayerId(data.playerId)) {
    errors.playerId = ValidationMessages.PLAYER_ID_INVALID;
  }
  
  // Birth year validation
  if (!data.birthYear) {
    errors.birthYear = ValidationMessages.BIRTH_YEAR_REQUIRED;
  } else if (!validateBirthYear(data.birthYear)) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(data.birthYear, 10);
    if (age < 13) {
      errors.birthYear = ValidationMessages.BIRTH_YEAR_TOO_YOUNG;
    } else if (age >= 100) {
      errors.birthYear = ValidationMessages.BIRTH_YEAR_TOO_OLD;
    } else {
      errors.birthYear = ValidationMessages.BIRTH_YEAR_INVALID;
    }
  }
  
  // User role validation
  if (!data.userRole) {
    errors.userRole = ValidationMessages.USER_ROLE_REQUIRED;
  }
  
  // Organizer-specific validation
  if (data.userRole === 'organizer') {
    if (!data.organizationName) {
      errors.organizationName = ValidationMessages.ORGANIZATION_NAME_REQUIRED;
    } else if (!validateOrganizationName(data.organizationName)) {
      errors.organizationName = ValidationMessages.ORGANIZATION_NAME_TOO_SHORT;
    }
    
    // Business email validation (optional)
    if (data.businessEmail && !validateEmail(data.businessEmail)) {
      errors.businessEmail = ValidationMessages.EMAIL_INVALID;
    }
    
    // Phone number validation (optional)
    if (data.phoneNumber && !validatePhoneNumber(data.phoneNumber)) {
      errors.phoneNumber = 'Número de teléfono no válido';
    }
    
    // Pokemon League URL validation (optional)
    if (data.pokemonLeagueUrl && data.pokemonLeagueUrl.trim()) {
      try {
        const url = new URL(data.pokemonLeagueUrl.trim());
        if (!url.protocol.startsWith('http')) {
          errors.pokemonLeagueUrl = "La URL debe comenzar con http:// o https://";
        }
      } catch {
        errors.pokemonLeagueUrl = "La URL no tiene un formato válido";
      }
    }
    
    // Experience description validation (optional, but if provided should be meaningful)
    if (data.experienceDescription && data.experienceDescription.trim().length > 0 && data.experienceDescription.trim().length < 20) {
      errors.experienceDescription = 'La descripción debe tener al menos 20 caracteres';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates password reset form data
 * @param data - The password reset form data to validate
 * @returns ValidationResult - validation result with errors
 */
export function validatePasswordResetForm(data: PasswordResetFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Email validation
  if (!data.email) {
    errors.email = ValidationMessages.EMAIL_REQUIRED;
  } else if (!validateEmail(data.email)) {
    errors.email = ValidationMessages.EMAIL_INVALID;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates update password form data
 * @param data - The update password form data to validate
 * @returns ValidationResult - validation result with errors
 */
export function validateUpdatePasswordForm(data: UpdatePasswordFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Password validation
  if (!data.password) {
    errors.password = ValidationMessages.PASSWORD_REQUIRED;
  } else if (!validatePassword(data.password)) {
    errors.password = ValidationMessages.PASSWORD_TOO_SHORT;
  }
  
  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = ValidationMessages.PASSWORD_REQUIRED;
  } else if (!validatePasswordMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = ValidationMessages.PASSWORDS_NO_MATCH;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}