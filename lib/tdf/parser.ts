/**
 * TDF (Tournament Director File) Parser and Validator
 * 
 * This module handles parsing and validation of TDF files from TOM (Tournament Operations Manager) software.
 * It extracts tournament metadata, validates XML structure, and maps tournament types to internal enums.
 */

import { TournamentType } from '@/lib/types/tournament';
import './dom-polyfill'; // Ensure DOMParser is available

export interface TDFMetadata {
  name: string;
  id: string;
  city: string;
  state?: string;
  country: string;
  startdate: string;
  organizer: {
    popid: string;
    name: string;
  };
  gametype: string;
  mode: string;
  roundtime: number;
  finalsroundtime: number;
  lessswiss: boolean;
  autotablenumber: boolean;
  overflowtablestart: number;
  type: string;
  stage: string;
  version: string;
}

export interface TDFPlayer {
  userid: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  creationdate: string;
  lastmodifieddate: string;
  starter?: boolean;
  dropped?: {
    status: string;
    round: string;
    timestamp: string;
  };
  order?: string;
  seed?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ParsedTDF {
  metadata: TDFMetadata;
  players: TDFPlayer[];
  hasPlayers: boolean;
  playerCount: number;
  validation: ValidationResult;
}

/**
 * Tournament type mapping from TDF format to internal enum
 */
const TOURNAMENT_TYPE_MAPPING: Record<string, TournamentType> = {
  // VGC Tournaments
  'VIDEO_GAME:VGCPREMIER': TournamentType.VGC_PREMIER_EVENT,
  
  // TCG Tournaments
  'TRADING_CARD_GAME:LEAGUECHALLENGE': TournamentType.TCG_LEAGUE_CHALLENGE,
  'TRADING_CARD_GAME:PRERELEASE': TournamentType.TCG_PRERELEASE,
  'TRADING_CARD_GAME:TCG1DAY': TournamentType.TCG_LEAGUE_CUP,
  
  // GO Tournaments
  'GO:GOPREMIER': TournamentType.GO_PREMIER_EVENT,
};

/**
 * TDF Parser class with static methods for parsing and validation
 */
export class TDFParser {
  /**
   * Parse a complete TDF file and extract all information
   */
  static parse(xmlContent: string): ParsedTDF {
    const validation = this.validateStructure(xmlContent);
    
    if (!validation.isValid) {
      throw new Error(`Invalid TDF structure: ${validation.errors.join(', ')}`);
    }

    const metadata = this.parseMetadata(xmlContent);
    const players = this.extractPlayers(xmlContent);

    return {
      metadata,
      players,
      hasPlayers: players.length > 0,
      playerCount: players.length,
      validation
    };
  }

  /**
   * Extract tournament metadata from TDF XML
   */
  static parseMetadata(xmlContent: string): TDFMetadata {
    try {
      // Parse XML using DOMParser (works in both browser and Node.js with proper polyfill)
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      const tournament = doc.querySelector('tournament');
      if (!tournament) {
        throw new Error('No tournament element found');
      }

      const data = tournament.querySelector('data');
      if (!data) {
        throw new Error('No data element found');
      }

      const organizer = data.querySelector('organizer');
      if (!organizer) {
        throw new Error('No organizer element found');
      }

      // Extract tournament attributes
      const type = tournament.getAttribute('type') || '';
      const stage = tournament.getAttribute('stage') || '';
      const version = tournament.getAttribute('version') || '';
      const gametype = tournament.getAttribute('gametype') || '';
      const mode = tournament.getAttribute('mode') || '';

      // Extract data elements
      const name = data.querySelector('name')?.textContent || '';
      const id = data.querySelector('id')?.textContent || '';
      const city = data.querySelector('city')?.textContent || '';
      const state = data.querySelector('state')?.textContent || '';
      const country = data.querySelector('country')?.textContent || '';
      const startdate = data.querySelector('startdate')?.textContent || '';
      const roundtime = parseInt(data.querySelector('roundtime')?.textContent || '0');
      const finalsroundtime = parseInt(data.querySelector('finalsroundtime')?.textContent || '0');
      const lessswiss = data.querySelector('lessswiss')?.textContent === 'true';
      const autotablenumber = data.querySelector('autotablenumber')?.textContent === 'true';
      const overflowtablestart = parseInt(data.querySelector('overflowtablestart')?.textContent || '0');

      // Extract organizer info
      const organizerPopid = organizer.getAttribute('popid') || '';
      const organizerName = organizer.getAttribute('name') || '';

      return {
        name,
        id,
        city,
        state: state || undefined,
        country,
        startdate,
        organizer: {
          popid: organizerPopid,
          name: organizerName
        },
        gametype,
        mode,
        roundtime,
        finalsroundtime,
        lessswiss,
        autotablenumber,
        overflowtablestart,
        type,
        stage,
        version
      };
    } catch (error) {
      throw new Error(`Failed to parse TDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract players from TDF XML
   */
  static extractPlayers(xmlContent: string): TDFPlayer[] {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, 'text/xml');
      
      const players: TDFPlayer[] = [];
      const playerElements = doc.querySelectorAll('players > player');

      playerElements.forEach(playerElement => {
        const userid = playerElement.getAttribute('userid') || '';
        const firstname = playerElement.querySelector('firstname')?.textContent || '';
        const lastname = playerElement.querySelector('lastname')?.textContent || '';
        const birthdate = playerElement.querySelector('birthdate')?.textContent || '';
        const creationdate = playerElement.querySelector('creationdate')?.textContent || '';
        const lastmodifieddate = playerElement.querySelector('lastmodifieddate')?.textContent || '';
        
        // Optional fields
        const starter = playerElement.querySelector('starter')?.textContent === 'true';
        const order = playerElement.querySelector('order')?.textContent;
        const seed = playerElement.querySelector('seed')?.textContent;
        
        // Dropped status
        const droppedElement = playerElement.querySelector('dropped');
        let dropped: TDFPlayer['dropped'] = undefined;
        if (droppedElement) {
          dropped = {
            status: droppedElement.querySelector('status')?.textContent || '',
            round: droppedElement.querySelector('round')?.textContent || '',
            timestamp: droppedElement.querySelector('timestamp')?.textContent || ''
          };
        }

        const player: TDFPlayer = {
          userid,
          firstname,
          lastname,
          birthdate,
          creationdate,
          lastmodifieddate
        };

        if (starter !== undefined) player.starter = starter;
        if (order) player.order = order;
        if (seed) player.seed = seed;
        if (dropped) player.dropped = dropped;

        players.push(player);
      });

      return players;
    } catch (error) {
      throw new Error(`Failed to extract players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate TDF XML structure
   */
  static validateStructure(xmlContent: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic XML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, 'text/xml');
      
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        errors.push('Invalid XML format');
        return { isValid: false, errors, warnings };
      }

      // Check for required elements
      const tournament = doc.querySelector('tournament');
      if (!tournament) {
        errors.push('Missing tournament root element');
        return { isValid: false, errors, warnings };
      }

      // Check tournament attributes
      const requiredAttributes = ['type', 'stage', 'version', 'gametype', 'mode'];
      requiredAttributes.forEach(attr => {
        if (!tournament.getAttribute(attr)) {
          errors.push(`Missing required tournament attribute: ${attr}`);
        }
      });

      // Check data section
      const data = tournament.querySelector('data');
      if (!data) {
        errors.push('Missing data element');
        return { isValid: false, errors, warnings };
      }

      // Check required data fields
      const requiredDataFields = ['name', 'id', 'city', 'country', 'startdate', 'organizer'];
      requiredDataFields.forEach(field => {
        const element = data.querySelector(field);
        if (!element || !element.textContent?.trim()) {
          errors.push(`Missing or empty required field: ${field}`);
        }
      });

      // Check organizer attributes
      const organizer = data.querySelector('organizer');
      if (organizer) {
        if (!organizer.getAttribute('popid')) {
          errors.push('Missing organizer popid attribute');
        }
        if (!organizer.getAttribute('name')) {
          errors.push('Missing organizer name attribute');
        }
      }

      // Check for required sections (even if empty)
      const requiredSections = ['players', 'pods', 'finalsoptions'];
      requiredSections.forEach(section => {
        if (!tournament.querySelector(section)) {
          errors.push(`Missing required section: ${section}`);
        }
      });

      // Validate tournament ID format (YY-MM-XXXXXX)
      const tournamentId = data.querySelector('id')?.textContent;
      if (tournamentId && !/^\d{2}-\d{2}-\d{6}$/.test(tournamentId)) {
        warnings.push('Tournament ID format should be YY-MM-XXXXXX');
      }

      // Validate date format
      const startDate = data.querySelector('startdate')?.textContent;
      if (startDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(startDate)) {
        warnings.push('Start date format should be MM/DD/YYYY');
      }

      // Check for supported tournament type
      const gametype = tournament.getAttribute('gametype');
      const mode = tournament.getAttribute('mode');
      if (gametype && mode) {
        const typeKey = `${gametype}:${mode}`;
        if (!TOURNAMENT_TYPE_MAPPING[typeKey]) {
          warnings.push(`Unsupported tournament type: ${gametype}:${mode}`);
        }
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Map TDF tournament type to internal enum
   */
  static mapTournamentType(gametype: string, mode: string): TournamentType {
    const typeKey = `${gametype}:${mode}`;
    const mappedType = TOURNAMENT_TYPE_MAPPING[typeKey];
    
    if (!mappedType) {
      throw new Error(`Unsupported tournament type: ${gametype}:${mode}`);
    }
    
    return mappedType;
  }

  /**
   * Get a summary of the TDF file for quick preview
   */
  static extractSummary(xmlContent: string): {
    name: string;
    id: string;
    type: string;
    location: string;
    date: string;
    playerCount: number;
    isEmpty: boolean;
  } {
    try {
      const metadata = this.parseMetadata(xmlContent);
      const players = this.extractPlayers(xmlContent);
      
      return {
        name: metadata.name,
        id: metadata.id,
        type: `${metadata.gametype} ${metadata.mode}`,
        location: `${metadata.city}, ${metadata.country}`,
        date: metadata.startdate,
        playerCount: players.length,
        isEmpty: players.length === 0
      };
    } catch (error) {
      throw new Error(`Failed to extract summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if TDF file is empty (no players)
   */
  static isEmpty(xmlContent: string): boolean {
    try {
      const players = this.extractPlayers(xmlContent);
      return players.length === 0;
    } catch {
      return false;
    }
  }

  /**
   * Validate that TDF is compatible with our system
   */
  static isCompatible(xmlContent: string): { compatible: boolean; reason?: string } {
    try {
      const validation = this.validateStructure(xmlContent);
      
      if (!validation.isValid) {
        return { compatible: false, reason: validation.errors.join(', ') };
      }

      const metadata = this.parseMetadata(xmlContent);
      
      // Check if tournament type is supported
      try {
        this.mapTournamentType(metadata.gametype, metadata.mode);
      } catch {
        return { 
          compatible: false, 
          reason: `Unsupported tournament type: ${metadata.gametype}:${metadata.mode}` 
        };
      }

      return { compatible: true };
    } catch (error) {
      return { 
        compatible: false, 
        reason: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

/**
 * Utility functions for working with TDF data
 */
export class TDFUtils {
  /**
   * Convert TDF date format (MM/DD/YYYY) to ISO string
   */
  static convertTDFDateToISO(tdfDate: string): string {
    try {
      // TDF format: MM/DD/YYYY
      const [month, day, year] = tdfDate.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toISOString();
    } catch {
      throw new Error(`Invalid TDF date format: ${tdfDate}`);
    }
  }

  /**
   * Convert ISO date to TDF format (MM/DD/YYYY)
   */
  static convertISOToTDFDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${month}/${day}/${year}`;
    } catch {
      throw new Error(`Invalid ISO date format: ${isoDate}`);
    }
  }

  /**
   * Generate a unique player ID for new registrations
   */
  static generatePlayerID(): string {
    // Generate a 7-digit ID similar to TOM format
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  }

  /**
   * Format player name for TDF
   */
  static formatPlayerName(firstName: string, lastName: string): { firstname: string; lastname: string } {
    return {
      firstname: firstName.trim(),
      lastname: lastName.trim()
    };
  }

  /**
   * Validate player birthdate format
   */
  static validateBirthdate(birthdate: string): boolean {
    // TDF format: MM/DD/YYYY
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(birthdate)) {
      return false;
    }

    try {
      const [month, day, year] = birthdate.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Check if date is valid and not in the future
      return date.getFullYear() === year &&
             date.getMonth() === month - 1 &&
             date.getDate() === day &&
             date <= new Date();
    } catch {
      return false;
    }
  }
}
