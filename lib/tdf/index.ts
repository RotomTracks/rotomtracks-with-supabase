/**
 * TDF (Tournament Director File) Integration System
 * 
 * This module provides complete TDF file handling capabilities including:
 * - Parsing and validation of TDF files
 * - Generation of TOM-compatible TDF files
 * - Tournament metadata extraction
 * - Player data management
 */

// Parser exports
export {
  TDFParser,
  TDFUtils,
  type TDFMetadata,
  type TDFPlayer,
  type ValidationResult,
  type ParsedTDF
} from './parser';

// Generator exports
export {
  TDFGenerator,
  type GeneratedTDF,
  type TournamentParticipant
} from './generator';

// Utility exports
export * from './utils';

// Utility functions for common TDF operations
export class TDFManager {
  /**
   * Quick validation of TDF file
   */
  static async validateFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const content = await file.text();
      const validation = TDFParser.validateStructure(content);
      return {
        isValid: validation.isValid,
        errors: validation.errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Extract tournament summary from file
   */
  static async extractSummaryFromFile(file: File): Promise<{
    name: string;
    id: string;
    type: string;
    location: string;
    date: string;
    playerCount: number;
    isEmpty: boolean;
  }> {
    const content = await file.text();
    return TDFParser.extractSummary(content);
  }

  /**
   * Check if file is compatible with our system
   */
  static async checkCompatibility(file: File): Promise<{ compatible: boolean; reason?: string }> {
    try {
      const content = await file.text();
      return TDFParser.isCompatible(content);
    } catch (error) {
      return {
        compatible: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Re-export parser and generator classes
import { TDFParser, TDFUtils } from './parser';
import { TDFGenerator } from './generator';