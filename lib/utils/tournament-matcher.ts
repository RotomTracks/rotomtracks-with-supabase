// Tournament Matcher - Detecta automáticamente torneos existentes
import { Tournament } from '../types/tournament';
import { extractTournamentSummary, validateTDFFile } from './tdf-parser';
import { createClient } from '@/lib/supabase/client';

export interface TournamentMatch {
  tournamentId: string;
  confidence: number;
  reasons: string[];
  existingTournament: {
    id: string;
    name: string;
    official_tournament_id: string;
    city: string;
    country: string;
    start_date: string;
    organizer_id: string;
  };
  shouldUpdate: boolean;
  isNewer: boolean;
}

export interface MatchResult {
  matches: TournamentMatch[];
  bestMatch?: TournamentMatch;
  shouldCreateNew: boolean;
  recommendations: string[];
}

// Detectar si un archivo TDF corresponde a un torneo existente
export async function matchTournamentFile(
  fileContent: string,
  userId: string
): Promise<MatchResult> {
  try {
    // Validar archivo TDF
    const validation = validateTDFFile(fileContent);
    if (!validation.valid) {
      throw new Error('Archivo TDF no válido');
    }

    // Extraer información del torneo
    const summary = extractTournamentSummary(fileContent);
    
    // Buscar torneos existentes del usuario
    const supabase = createClient();
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error al buscar torneos existentes');
    }

    const matches: TournamentMatch[] = [];
    
    // Evaluar cada torneo existente
    for (const tournament of tournaments || []) {
      const match = evaluateTournamentMatch(summary, tournament);
      if (match.confidence > 0) {
        matches.push(match);
      }
    }

    // Ordenar por confianza
    matches.sort((a, b) => b.confidence - a.confidence);
    
    const bestMatch = matches.length > 0 ? matches[0] : undefined;
    const shouldCreateNew = !bestMatch || bestMatch.confidence < 0.7;
    
    const recommendations = generateRecommendations(summary, matches, shouldCreateNew);

    return {
      matches,
      bestMatch,
      shouldCreateNew,
      recommendations,
    };

  } catch (error) {
    throw new Error(`Error al analizar archivo: ${error}`);
  }
}

// Evaluar qué tan probable es que un archivo corresponda a un torneo
function evaluateTournamentMatch(
  summary: ReturnType<typeof extractTournamentSummary>,
  tournament: Tournament
): TournamentMatch {
  let confidence = 0;
  const reasons: string[] = [];

  // 1. Coincidencia exacta de Tournament ID (peso: 50%)
  if (summary.id === tournament.official_tournament_id) {
    confidence += 0.5;
    reasons.push('ID de torneo coincide exactamente');
  }

  // 2. Coincidencia de nombre (peso: 30%)
  const nameMatch = calculateStringSimilarity(summary.name, tournament.name);
  if (nameMatch > 0.8) {
    confidence += 0.3 * nameMatch;
    reasons.push(`Nombre muy similar (${Math.round(nameMatch * 100)}%)`);
  } else if (nameMatch > 0.6) {
    confidence += 0.15 * nameMatch;
    reasons.push(`Nombre parcialmente similar (${Math.round(nameMatch * 100)}%)`);
  }

  // 3. Coincidencia de ubicación (peso: 15%)
  if (summary.city.toLowerCase() === tournament.city.toLowerCase() &&
      summary.country.toLowerCase() === tournament.country.toLowerCase()) {
    confidence += 0.15;
    reasons.push('Ubicación coincide');
  } else if (summary.city.toLowerCase() === tournament.city.toLowerCase()) {
    confidence += 0.1;
    reasons.push('Ciudad coincide');
  }

  // 4. Coincidencia de fecha (peso: 5%)
  const tournamentDate = new Date(tournament.start_date);
  const fileDate = parseTDFDate(summary.date);
  const daysDiff = Math.abs((tournamentDate.getTime() - fileDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    confidence += 0.05;
    reasons.push('Fecha coincide exactamente');
  } else if (daysDiff <= 1) {
    confidence += 0.03;
    reasons.push('Fecha muy cercana');
  }

  // Determinar si debería actualizarse
  const shouldUpdate = confidence > 0.7;
  
  // Determinar si el archivo es más nuevo
  const isNewer = fileDate >= tournamentDate;

  return {
    tournamentId: tournament.id,
    confidence,
    reasons,
    existingTournament: tournament,
    shouldUpdate,
    isNewer,
  };
}

// Calcular similitud entre strings usando algoritmo de Levenshtein
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Algoritmo de distancia de Levenshtein
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Parsear fecha TDF (MM/DD/YYYY)
function parseTDFDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// Generar recomendaciones para el usuario
function generateRecommendations(
  summary: ReturnType<typeof extractTournamentSummary>,
  matches: TournamentMatch[],
  shouldCreateNew: boolean
): string[] {
  const recommendations: string[] = [];

  if (shouldCreateNew) {
    recommendations.push('Se recomienda crear un nuevo torneo con este archivo');
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      if (bestMatch.confidence > 0.3) {
        recommendations.push(
          `Existe un torneo similar "${bestMatch.existingTournament.name}" ` +
          `(${Math.round(bestMatch.confidence * 100)}% de similitud)`
        );
      }
    }
  } else {
    const bestMatch = matches[0];
    recommendations.push(
      `Se recomienda actualizar el torneo existente "${bestMatch.existingTournament.name}"`
    );
    
    if (!bestMatch.isNewer) {
      recommendations.push(
        'ADVERTENCIA: El archivo parece ser más antiguo que el torneo existente'
      );
    }
    
    recommendations.push(`Razones: ${bestMatch.reasons.join(', ')}`);
  }

  return recommendations;
}

// Función para actualizar torneo existente con nuevo archivo
export async function updateExistingTournament(
  tournamentId: string,
  fileContent: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient();
    
    // Verificar permisos
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('organizer_id')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return { success: false, message: 'Torneo no encontrado' };
    }

    if (tournament.organizer_id !== userId) {
      return { success: false, message: 'No tienes permisos para actualizar este torneo' };
    }

    // Extraer nueva información del archivo
    const summary = extractTournamentSummary(fileContent);
    
    // Actualizar información del torneo si es necesario
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Solo actualizar campos si han cambiado significativamente
    const { data: currentTournament } = await supabase
      .from('tournaments')
      .select('name, city, country, start_date')
      .eq('id', tournamentId)
      .single();

    if (currentTournament) {
      if (summary.name !== currentTournament.name) {
        updates.name = summary.name;
      }
      
      if (summary.city !== currentTournament.city) {
        updates.city = summary.city;
      }
      
      if (summary.country !== currentTournament.country) {
        updates.country = summary.country;
      }
    }

    // Actualizar torneo si hay cambios
    if (Object.keys(updates).length > 1) { // Más que solo updated_at
      const { error: updateError } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', tournamentId);

      if (updateError) {
        return { success: false, message: 'Error al actualizar torneo' };
      }
    }

    return { 
      success: true, 
      message: 'Torneo actualizado exitosamente' 
    };

  } catch (error) {
    return { 
      success: false, 
      message: `Error: ${error}` 
    };
  }
}

export const TournamentMatcher = {
  matchFile: matchTournamentFile,
  updateExisting: updateExistingTournament,
};