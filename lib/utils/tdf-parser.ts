// TDF Parser - Analizador de archivos Tournament Data Format
export interface TDFValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TournamentSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  date: string;
  format: string;
  playerCount: number;
  rounds: number;
  status: 'completed' | 'ongoing' | 'upcoming';
}

export interface PlayerResult {
  id: string;
  name: string;
  placement: number;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  dropped: boolean;
}

export interface MatchResult {
  round: number;
  table: number;
  player1: string;
  player2: string;
  result: '1-0' | '0-1' | '0.5-0.5' | 'bye';
  player1Score?: number;
  player2Score?: number;
}

export interface TDFData {
  tournament: TournamentSummary;
  players: PlayerResult[];
  matches: MatchResult[];
  standings: PlayerResult[];
}

// Validar formato TDF
export function validateTDFFile(content: string): TDFValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
      errors.push('Archivo vacío');
      return { valid: false, errors, warnings };
    }

    // Verificar encabezados requeridos
    const requiredSections = ['[Tournament]', '[Players]', '[Standings]'];
    const foundSections = requiredSections.filter(section => 
      lines.some(line => line.startsWith(section))
    );

    if (foundSections.length < requiredSections.length) {
      const missingSections = requiredSections.filter(section => !foundSections.includes(section));
      errors.push(`Secciones faltantes: ${missingSections.join(', ')}`);
    }

    // Validar sección Tournament
    const tournamentSection = extractSection(lines, '[Tournament]');
    if (tournamentSection.length === 0) {
      errors.push('Sección [Tournament] vacía');
    } else {
      const requiredFields = ['Name', 'Date', 'City', 'Country'];
      const foundFields = requiredFields.filter(field =>
        tournamentSection.some(line => line.startsWith(`${field}=`))
      );
      
      if (foundFields.length < requiredFields.length) {
        const missingFields = requiredFields.filter(field => !foundFields.includes(field));
        errors.push(`Campos faltantes en Tournament: ${missingFields.join(', ')}`);
      }
    }

    // Validar formato de fecha
    const dateLine = tournamentSection.find(line => line.startsWith('Date='));
    if (dateLine) {
      const dateValue = dateLine.split('=')[1];
      if (!isValidDate(dateValue)) {
        errors.push('Formato de fecha inválido (debe ser MM/DD/YYYY)');
      }
    }

    // Validar sección Players
    const playersSection = extractSection(lines, '[Players]');
    if (playersSection.length === 0) {
      warnings.push('No se encontraron jugadores registrados');
    }

    // Validar sección Standings
    const standingsSection = extractSection(lines, '[Standings]');
    if (standingsSection.length === 0) {
      warnings.push('No se encontraron clasificaciones finales');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    errors.push(`Error al parsear archivo: ${error}`);
    return { valid: false, errors, warnings };
  }
}

// Extraer resumen del torneo
export function extractTournamentSummary(content: string): TournamentSummary {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const tournamentSection = extractSection(lines, '[Tournament]');
  
  const getValue = (key: string): string => {
    const line = tournamentSection.find(line => line.startsWith(`${key}=`));
    return line ? line.split('=')[1].trim() : '';
  };

  const playersSection = extractSection(lines, '[Players]');
  const standingsSection = extractSection(lines, '[Standings]');
  
  // Determinar estado del torneo
  let status: 'completed' | 'ongoing' | 'upcoming' = 'upcoming';
  if (standingsSection.length > 0) {
    status = 'completed';
  } else if (playersSection.length > 0) {
    status = 'ongoing';
  }

  return {
    id: getValue('ID') || generateTournamentId(),
    name: getValue('Name'),
    city: getValue('City'),
    country: getValue('Country'),
    date: getValue('Date'),
    format: getValue('Format') || 'Swiss',
    playerCount: playersSection.length,
    rounds: parseInt(getValue('Rounds')) || calculateRounds(playersSection.length),
    status
  };
}

// Parsear datos completos del TDF
export function parseTDFFile(content: string): TDFData {
  const validation = validateTDFFile(content);
  if (!validation.valid) {
    throw new Error(`Archivo TDF inválido: ${validation.errors.join(', ')}`);
  }

  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  const tournament = extractTournamentSummary(content);
  const players = parsePlayersSection(lines);
  const matches = parseMatchesSection(lines);
  const standings = parseStandingsSection(lines);

  return {
    tournament,
    players,
    matches,
    standings
  };
}

// Extraer sección específica del archivo
function extractSection(lines: string[], sectionName: string): string[] {
  const startIndex = lines.findIndex(line => line.startsWith(sectionName));
  if (startIndex === -1) return [];

  const endIndex = lines.findIndex((line, index) => 
    index > startIndex && line.startsWith('[') && line.endsWith(']')
  );

  return lines.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex);
}

// Parsear sección de jugadores
function parsePlayersSection(lines: string[]): PlayerResult[] {
  const playersSection = extractSection(lines, '[Players]');
  
  return playersSection.map((line, index) => {
    const parts = line.split('\t');
    return {
      id: parts[0] || `player_${index + 1}`,
      name: parts[1] || `Jugador ${index + 1}`,
      placement: 0, // Se calculará en standings
      points: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      dropped: false
    };
  });
}

// Parsear sección de partidas
function parseMatchesSection(lines: string[]): MatchResult[] {
  const matchesSection = extractSection(lines, '[Matches]');
  
  return matchesSection.map(line => {
    const parts = line.split('\t');
    return {
      round: parseInt(parts[0]) || 1,
      table: parseInt(parts[1]) || 1,
      player1: parts[2] || '',
      player2: parts[3] || '',
      result: (parts[4] as '1-0' | '0-1' | '0.5-0.5' | 'bye') || '1-0',
      player1Score: parts[5] ? parseInt(parts[5]) : undefined,
      player2Score: parts[6] ? parseInt(parts[6]) : undefined
    };
  });
}

// Parsear sección de clasificaciones
function parseStandingsSection(lines: string[]): PlayerResult[] {
  const standingsSection = extractSection(lines, '[Standings]');
  
  return standingsSection.map((line, index) => {
    const parts = line.split('\t');
    return {
      id: parts[0] || `player_${index + 1}`,
      name: parts[1] || `Jugador ${index + 1}`,
      placement: parseInt(parts[2]) || index + 1,
      points: parseFloat(parts[3]) || 0,
      wins: parseInt(parts[4]) || 0,
      losses: parseInt(parts[5]) || 0,
      draws: parseInt(parts[6]) || 0,
      dropped: parts[7] === 'true' || parts[7] === '1'
    };
  });
}

// Validar formato de fecha MM/DD/YYYY
function isValidDate(dateStr: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
  if (!regex.test(dateStr)) return false;
  
  const [month, day, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

// Generar ID único para torneo
function generateTournamentId(): string {
  return `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calcular número de rondas sugeridas para Swiss
function calculateRounds(playerCount: number): number {
  if (playerCount <= 8) return 3;
  if (playerCount <= 16) return 4;
  if (playerCount <= 32) return 5;
  if (playerCount <= 64) return 6;
  if (playerCount <= 128) return 7;
  return 8;
}

// Convertir datos a formato TDF
export function generateTDFContent(data: TDFData): string {
  const lines: string[] = [];
  
  // Sección Tournament
  lines.push('[Tournament]');
  lines.push(`ID=${data.tournament.id}`);
  lines.push(`Name=${data.tournament.name}`);
  lines.push(`Date=${data.tournament.date}`);
  lines.push(`City=${data.tournament.city}`);
  lines.push(`Country=${data.tournament.country}`);
  lines.push(`Format=${data.tournament.format}`);
  lines.push(`Rounds=${data.tournament.rounds}`);
  lines.push('');
  
  // Sección Players
  if (data.players.length > 0) {
    lines.push('[Players]');
    data.players.forEach(player => {
      lines.push(`${player.id}\t${player.name}`);
    });
    lines.push('');
  }
  
  // Sección Matches
  if (data.matches.length > 0) {
    lines.push('[Matches]');
    data.matches.forEach(match => {
      const scorePart = match.player1Score !== undefined && match.player2Score !== undefined
        ? `\t${match.player1Score}\t${match.player2Score}`
        : '';
      lines.push(`${match.round}\t${match.table}\t${match.player1}\t${match.player2}\t${match.result}${scorePart}`);
    });
    lines.push('');
  }
  
  // Sección Standings
  if (data.standings.length > 0) {
    lines.push('[Standings]');
    data.standings.forEach(player => {
      lines.push(`${player.id}\t${player.name}\t${player.placement}\t${player.points}\t${player.wins}\t${player.losses}\t${player.draws}\t${player.dropped ? '1' : '0'}`);
    });
  }
  
  return lines.join('\n');
}

// Utilidades de exportación
export const TDFParser = {
  validate: validateTDFFile,
  parse: parseTDFFile,
  extractSummary: extractTournamentSummary,
  generate: generateTDFContent
};