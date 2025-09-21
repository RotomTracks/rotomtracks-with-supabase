/**
 * TDF (Tournament Director File) Generator
 * 
 * This module handles generation of TDF files compatible with TOM (Tournament Operations Manager) software.
 * It creates XML files with proper structure, formatting, and encoding.
 */

import { TDFMetadata, TDFPlayer, TDFUtils } from './parser';
import './dom-polyfill'; // Ensure DOMParser is available

import { TournamentParticipant } from '@/lib/types/tournament';

export interface GeneratedTDF {
  xmlContent: string;
  playerCount: number;
  generatedAt: string;
  metadata: TDFMetadata;
}

/**
 * TDF Generator class for creating TOM-compatible XML files
 */
export class TDFGenerator {
  /**
   * Generate a complete TDF file with tournament metadata and players
   */
  static generateTDF(
    originalMetadata: TDFMetadata,
    participants: TournamentParticipant[]
  ): GeneratedTDF {
    const players = this.convertParticipantsToTDFPlayers(participants);
    const xmlContent = this.buildXMLStructure(originalMetadata, players);
    
    return {
      xmlContent,
      playerCount: players.length,
      generatedAt: new Date().toISOString(),
      metadata: originalMetadata
    };
  }

  /**
   * Generate TDF from scratch (without original TDF file)
   */
  static generateFromScratch(
    tournamentData: {
      name: string;
      id: string;
      city: string;
      state?: string;
      country: string;
      startDate: string;
      organizer: { name: string; popid: string };
      tournamentType: string;
      mode: string;
    },
    participants: TournamentParticipant[]
  ): GeneratedTDF {
    const metadata: TDFMetadata = {
      name: tournamentData.name,
      id: tournamentData.id,
      city: tournamentData.city,
      state: tournamentData.state,
      country: tournamentData.country,
      startdate: TDFUtils.convertISOToTDFDate(tournamentData.startDate),
      organizer: tournamentData.organizer,
      gametype: tournamentData.tournamentType,
      mode: tournamentData.mode,
      roundtime: 50, // Default values
      finalsroundtime: 50,
      lessswiss: false,
      autotablenumber: true,
      overflowtablestart: Math.max(16, Math.ceil(participants.length / 4)),
      type: '3', // Default tournament type
      stage: participants.length > 0 ? '3' : '1',
      version: '1.80'
    };

    return this.generateTDF(metadata, participants);
  }

  /**
   * Update an existing TDF file with new players
   */
  static updateTDFWithPlayers(
    originalXMLContent: string,
    participants: TournamentParticipant[]
  ): GeneratedTDF {
    try {
      // Parse the original TDF to get metadata
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalXMLContent, 'text/xml');
      
      // Extract metadata from original
      const tournament = doc.querySelector('tournament');
      if (!tournament) {
        throw new Error('Invalid TDF structure');
      }

      const data = tournament.querySelector('data');
      if (!data) {
        throw new Error('Missing data section');
      }

      const organizer = data.querySelector('organizer');
      if (!organizer) {
        throw new Error('Missing organizer information');
      }

      const metadata: TDFMetadata = {
        name: data.querySelector('name')?.textContent || '',
        id: data.querySelector('id')?.textContent || '',
        city: data.querySelector('city')?.textContent || '',
        state: data.querySelector('state')?.textContent || undefined,
        country: data.querySelector('country')?.textContent || '',
        startdate: data.querySelector('startdate')?.textContent || '',
        organizer: {
          popid: organizer.getAttribute('popid') || '',
          name: organizer.getAttribute('name') || ''
        },
        gametype: tournament.getAttribute('gametype') || '',
        mode: tournament.getAttribute('mode') || '',
        roundtime: parseInt(data.querySelector('roundtime')?.textContent || '50'),
        finalsroundtime: parseInt(data.querySelector('finalsroundtime')?.textContent || '50'),
        lessswiss: data.querySelector('lessswiss')?.textContent === 'true',
        autotablenumber: data.querySelector('autotablenumber')?.textContent === 'true',
        overflowtablestart: parseInt(data.querySelector('overflowtablestart')?.textContent || '16'),
        type: tournament.getAttribute('type') || '3',
        stage: participants.length > 0 ? '3' : '1',
        version: tournament.getAttribute('version') || '1.80'
      };

      return this.generateTDF(metadata, participants);
    } catch (error) {
      throw new Error(`Failed to update TDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert tournament participants to TDF player format
   */
  private static convertParticipantsToTDFPlayers(participants: TournamentParticipant[]): TDFPlayer[] {
    return participants.map((participant, index) => {
      // Split player name
      const nameParts = participant.player_name.trim().split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      // Generate or use existing TDF user ID
      const userid = participant.tdf_userid || TDFUtils.generatePlayerID();

      // Format birthdate or use default
      let birthdate = '02/27/2000'; // Default birthdate
      if (participant.player_birthdate) {
        try {
          birthdate = TDFUtils.convertISOToTDFDate(participant.player_birthdate);
        } catch (error) {
          console.warn(`Invalid birthdate for player ${participant.player_name}, using default`);
        }
      }

      // Format registration date as creation date (TOM format: MM/DD/YYYY HH:MM:SS)
      let creationdate = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '');

      try {
        const regDate = new Date(participant.registration_date);
        creationdate = regDate.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(',', '');
      } catch (error) {
        console.warn(`Invalid registration date for player ${participant.player_name}, using current time`);
      }

      return {
        userid,
        firstname,
        lastname,
        birthdate,
        creationdate,
        lastmodifieddate: creationdate,
        starter: true
      };
    });
  }

  /**
   * Build the complete XML structure
   */
  private static buildXMLStructure(metadata: TDFMetadata, players: TDFPlayer[]): string {
    const playersXML = players.map(player => this.formatPlayerXML(player)).join('\n\t\t');
    
    // Calculate finals options based on player count
    const finalsOptions = this.generateFinalsOptions(players.length);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<tournament type="${metadata.type}" stage="${metadata.stage}" version="${metadata.version}" gametype="${metadata.gametype}" mode="${metadata.mode}">
\t<data>
\t\t<name>${this.escapeXML(metadata.name)}</name>
\t\t<id>${metadata.id}</id>
\t\t<city>${this.escapeXML(metadata.city)}</city>
\t\t<state>${metadata.state || ''}</state>
\t\t<country>${this.escapeXML(metadata.country)}</country>
\t\t<roundtime>${metadata.roundtime}</roundtime>
\t\t<finalsroundtime>${metadata.finalsroundtime}</finalsroundtime>
\t\t<organizer popid="${metadata.organizer.popid}" name="${this.escapeXML(metadata.organizer.name)}"/>
\t\t<startdate>${metadata.startdate}</startdate>
\t\t<lessswiss>${metadata.lessswiss}</lessswiss>
\t\t<autotablenumber>${metadata.autotablenumber}</autotablenumber>
\t\t<overflowtablestart>${metadata.overflowtablestart}</overflowtablestart>
\t</data>
\t<timeelapsed>0</timeelapsed>
\t<players>
\t\t${playersXML}
\t</players>
\t<pods>
\t\t<pod category="10" stage="0">
\t\t\t<poddata>
\t\t\t\t<startingtable>1</startingtable>
\t\t\t\t<playoff3rd4th>false</playoff3rd4th>
\t\t\t\t<subgroupcount>1</subgroupcount>
\t\t\t\t<additionalrounds>0</additionalrounds>
\t\t\t</poddata>
\t\t\t<subgroups>
\t\t\t</subgroups>
\t\t\t<rounds>
\t\t\t</rounds>
\t\t</pod>
\t</pods>
\t${finalsOptions}
</tournament>`;
  }

  /**
   * Format a single player as XML
   */
  private static formatPlayerXML(player: TDFPlayer): string {
    let playerXML = `<player userid="${player.userid}">
\t\t\t<firstname>${this.escapeXML(player.firstname)}</firstname>
\t\t\t<lastname>${this.escapeXML(player.lastname)}</lastname>
\t\t\t<birthdate>${player.birthdate}</birthdate>`;

    if (player.starter !== undefined) {
      playerXML += `\n\t\t\t<starter>${player.starter}</starter>`;
    }

    if (player.dropped) {
      playerXML += `\n\t\t\t<dropped>
\t\t\t\t<status>${player.dropped.status}</status>
\t\t\t\t<round>${player.dropped.round}</round>
\t\t\t\t<timestamp>${player.dropped.timestamp}</timestamp>
\t\t\t</dropped>`;
    }

    if (player.order) {
      playerXML += `\n\t\t\t<order>${player.order}</order>`;
    }

    if (player.seed) {
      playerXML += `\n\t\t\t<seed>${player.seed}</seed>`;
    }

    playerXML += `\n\t\t\t<creationdate>${player.creationdate}</creationdate>
\t\t\t<lastmodifieddate>${player.lastmodifieddate}</lastmodifieddate>
\t\t</player>`;

    return playerXML;
  }

  /**
   * Generate finals options based on player count
   */
  private static generateFinalsOptions(playerCount: number): string {
    if (playerCount === 0) {
      return `<finalsoptions>
\t</finalsoptions>`;
    }

    // Calculate appropriate cut sizes based on player count
    const cuts = this.calculateCuts(playerCount);
    
    let finalsOptionsXML = `<finalsoptions>`;
    
    cuts.forEach(cut => {
      finalsOptionsXML += `\n\t\t<categorycut key="${cut.key}">
\t\t\t<options>`;
      
      cut.options.forEach(option => {
        finalsOptionsXML += `\n\t\t\t\t<value>${option}</value>`;
      });
      
      finalsOptionsXML += `\n\t\t\t</options>
\t\t\t<cut>${cut.cut}</cut>
\t\t\t<playercount>${cut.playercount}</playercount>
\t\t\t<paired3rd4th>${cut.paired3rd4th}</paired3rd4th>
\t\t</categorycut>`;
    });
    
    finalsOptionsXML += `\n\t</finalsoptions>`;
    
    return finalsOptionsXML;
  }

  /**
   * Calculate appropriate cut sizes for finals
   */
  private static calculateCuts(playerCount: number): Array<{
    key: string;
    options: number[];
    cut: number;
    playercount: number;
    paired3rd4th: boolean;
  }> {
    const cuts = [];
    
    if (playerCount >= 8) {
      cuts.push({
        key: '10',
        options: [0, 2, 4, 8],
        cut: Math.min(8, Math.floor(playerCount / 4)),
        playercount: playerCount,
        paired3rd4th: false
      });
    } else if (playerCount >= 4) {
      cuts.push({
        key: '10',
        options: [0, 2, 4],
        cut: 4,
        playercount: playerCount,
        paired3rd4th: false
      });
    } else {
      cuts.push({
        key: '10',
        options: [0],
        cut: 0,
        playercount: playerCount,
        paired3rd4th: false
      });
    }

    return cuts;
  }

  /**
   * Escape XML special characters
   */
  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Validate generated TDF
   */
  static validateGeneratedTDF(xmlContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, 'text/xml');
      
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        errors.push('Generated XML is not well-formed');
        return { isValid: false, errors };
      }

      // Check required elements
      const tournament = doc.querySelector('tournament');
      if (!tournament) {
        errors.push('Missing tournament element');
      }

      const data = doc.querySelector('data');
      if (!data) {
        errors.push('Missing data element');
      }

      const players = doc.querySelector('players');
      if (!players) {
        errors.push('Missing players element');
      }

      const pods = doc.querySelector('pods');
      if (!pods) {
        errors.push('Missing pods element');
      }

      const finalsoptions = doc.querySelector('finalsoptions');
      if (!finalsoptions) {
        errors.push('Missing finalsoptions element');
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a backup of the original TDF before modification
   */
  static createBackup(originalXML: string, tournamentId: string): {
    backupContent: string;
    backupTimestamp: string;
    backupId: string;
  } {
    const timestamp = new Date().toISOString();
    const backupId = `${tournamentId}_backup_${Date.now()}`;
    
    return {
      backupContent: originalXML,
      backupTimestamp: timestamp,
      backupId
    };
  }

  /**
   * Generate TDF filename based on tournament data
   */
  static generateFilename(metadata: TDFMetadata): string {
    // Clean tournament name for filename
    const cleanName = metadata.name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s/g, '_');
    
    return `${cleanName}_${metadata.id}.tdf`;
  }
}

// Export types
export type { GeneratedTDF, TournamentParticipant };