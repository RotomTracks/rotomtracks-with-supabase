/**
 * TDF Utility Functions
 * 
 * Additional utility functions for working with TDF files and tournament data
 */

import { TournamentType } from '@/lib/types/tournament';

/**
 * Map internal tournament types to TDF gametype and mode
 */
function mapTournamentTypeToTDF(tournamentType: TournamentType): { gametype: string; mode: string } {
  switch (tournamentType) {
    case TournamentType.TCG_PRERELEASE:
      return { gametype: 'TRADING_CARD_GAME', mode: 'PRERELEASE' };
    
    case TournamentType.TCG_LEAGUE_CHALLENGE:
      return { gametype: 'TRADING_CARD_GAME', mode: 'LEAGUECHALLENGE' };
    
    case TournamentType.TCG_LEAGUE_CUP:
      return { gametype: 'TRADING_CARD_GAME', mode: 'TCG1DAY' };
    
    case TournamentType.VGC_PREMIER_EVENT:
      return { gametype: 'VIDEO_GAME', mode: 'VGCPREMIER' };
    
    case TournamentType.GO_PREMIER_EVENT:
      return { gametype: 'GO', mode: 'GOPREMIER' };
    
    default:
      // Default to TCG League Challenge
      return { gametype: 'TRADING_CARD_GAME', mode: 'LEAGUECHALLENGE' };
  }
}

// Note: Tournament ID comes from TDF files uploaded by users, not generated

/**
 * Validate tournament ID format
 */
function isValidTournamentID(id: string): boolean {
  return /^\d{2}-\d{2}-\d{6}$/.test(id);
}

/**
 * Format date for TDF (MM/DD/YYYY)
 */
function formatTDFDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear().toString();
  return `${month}/${day}/${year}`;
}

/**
 * Format timestamp for TDF (MM/DD/YYYY HH:MM:SS)
 */
function formatTDFTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = formatTDFDate(d);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}:${seconds}`;
}

/**
 * Calculate appropriate overflow table start based on player count
 */
function calculateOverflowTableStart(playerCount: number): number {
  // TOM typically uses multiples of 4 or 8 for table numbering
  // Start overflow tables after the main tournament tables
  const baseTableCount = Math.ceil(playerCount / 2); // Assuming 2 players per table
  const roundedUp = Math.ceil(baseTableCount / 4) * 4; // Round up to nearest multiple of 4
  return Math.max(16, roundedUp + 4); // Minimum of 16, with some buffer
}

/**
 * Validate player name for TDF compatibility
 */
function validatePlayerName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Player name cannot be empty' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Player name cannot exceed 50 characters' };
  }
  
  // Check for invalid XML characters
  const invalidChars = /[<>&"']/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Player name contains invalid characters' };
  }
  
  return { isValid: true };
}

/**
 * Clean and format player name for TDF
 */
function cleanPlayerName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>&"']/g, '') // Remove XML-invalid characters
    .substring(0, 50); // Limit length
}

/**
 * Generate organizer POP ID if not provided
 */
function generateOrganizerPOPID(): string {
  // Generate a 7-digit POP ID similar to player IDs
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

/**
 * Validate organizer information
 */
function validateOrganizerInfo(organizer: { name: string; popid?: string }): {
  isValid: boolean;
  errors: string[];
  cleaned: { name: string; popid: string };
} {
  const errors: string[] = [];
  
  if (!organizer.name || organizer.name.trim().length === 0) {
    errors.push('Organizer name is required');
  }
  
  if (organizer.name && organizer.name.length > 50) {
    errors.push('Organizer name cannot exceed 50 characters');
  }
  
  const cleanedName = cleanPlayerName(organizer.name || '');
  const popid = organizer.popid || generateOrganizerPOPID();
  
  if (popid && !/^\d{7}$/.test(popid)) {
    errors.push('Organizer POP ID must be 7 digits');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleaned: {
      name: cleanedName,
      popid
    }
  };
}

/**
 * Get tournament stage based on player count and status
 */
function getTournamentStage(playerCount: number, hasStarted: boolean): string {
  if (playerCount === 0) {
    return '1'; // Empty tournament
  }
  
  if (!hasStarted) {
    return '3'; // Ready to start
  }
  
  return '4'; // Tournament in progress
}

/**
 * Calculate recommended round time based on tournament type
 */
function getRecommendedRoundTime(gametype: string, mode: string): {
  roundtime: number;
  finalsroundtime: number;
} {
  // Default times in minutes
  let roundtime = 50;
  let finalsroundtime = 50;
  
  switch (`${gametype}:${mode}`) {
    case 'TRADING_CARD_GAME:PRERELEASE':
      roundtime = 50;
      finalsroundtime = 50;
      break;
    
    case 'TRADING_CARD_GAME:LEAGUECHALLENGE':
      roundtime = 50;
      finalsroundtime = 50;
      break;
    
    case 'TRADING_CARD_GAME:TCG1DAY':
      roundtime = 50;
      finalsroundtime = 50;
      break;
    
    case 'VIDEO_GAME:VGCPREMIER':
      roundtime = 15;
      finalsroundtime = 20;
      break;
    
    case 'GO:GOPREMIER':
      roundtime = 10;
      finalsroundtime = 15;
      break;
  }
  
  return { roundtime, finalsroundtime };
}

/**
 * Create a backup filename for TDF files
 */
function createBackupFilename(originalFilename: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nameWithoutExt = originalFilename.replace(/\.tdf$/i, '');
  return `${nameWithoutExt}_backup_${timestamp}.tdf`;
}

/**
 * Validate TDF file size and content
 */
function validateTDFFile(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    size: number;
    playerCount: number;
    hasMetadata: boolean;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size (reasonable limits)
  const size = new Blob([content]).size;
  if (size > 10 * 1024 * 1024) { // 10MB limit
    errors.push('TDF file is too large (maximum 10MB)');
  }
  
  if (size < 100) { // Minimum reasonable size
    errors.push('TDF file appears to be too small or empty');
  }
  
  // Basic XML structure check
  if (!content.includes('<tournament')) {
    errors.push('Invalid TDF structure: missing tournament element');
  }
  
  if (!content.includes('<data>')) {
    errors.push('Invalid TDF structure: missing data element');
  }
  
  if (!content.includes('<players>')) {
    errors.push('Invalid TDF structure: missing players element');
  }
  
  // Count players (rough estimate)
  const playerMatches = content.match(/<player\s+userid=/g);
  const playerCount = playerMatches ? playerMatches.length : 0;
  
  if (playerCount > 1000) {
    warnings.push('Large number of players detected, processing may be slow');
  }
  
  // Check for metadata
  const hasMetadata = content.includes('<name>') && content.includes('<organizer');
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      size,
      playerCount,
      hasMetadata
    }
  };
}

// Export all utility functions
export {
  mapTournamentTypeToTDF,
  isValidTournamentID,
  formatTDFDate,
  formatTDFTimestamp,
  calculateOverflowTableStart,
  validatePlayerName,
  cleanPlayerName,
  generateOrganizerPOPID,
  validateOrganizerInfo,
  getTournamentStage,
  getRecommendedRoundTime,
  createBackupFilename,
  validateTDFFile
};