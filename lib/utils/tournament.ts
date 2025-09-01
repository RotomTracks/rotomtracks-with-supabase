// Tournament Utility Functions
// Helper functions for working with tournament data and types

import { 
  Tournament, 
  TournamentType, 
  TournamentStatus, 
  TournamentParticipant, 
  TournamentResult, 
  TournamentStanding,
  MatchOutcome,
  PlayerResults
} from '@/lib/types/tournament';

// Tournament Type Utilities
export const getTournamentTypeLabel = (type: TournamentType): string => {
  const labels: Record<TournamentType, string> = {
    [TournamentType.TCG_PRERELEASE]: 'TCG Prerelease',
    [TournamentType.TCG_LEAGUE_CHALLENGE]: 'TCG League Challenge',
    [TournamentType.TCG_LEAGUE_CUP]: 'TCG League Cup',
    [TournamentType.VGC_PREMIER_EVENT]: 'VGC Premier Event',
    [TournamentType.GO_PREMIER_EVENT]: 'GO Premier Event',
  };
  return labels[type] || type;
};

export const getTournamentTypeColor = (type: TournamentType): string => {
  const colors: Record<TournamentType, string> = {
    [TournamentType.TCG_PRERELEASE]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    [TournamentType.TCG_LEAGUE_CHALLENGE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    [TournamentType.TCG_LEAGUE_CUP]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    [TournamentType.VGC_PREMIER_EVENT]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    [TournamentType.GO_PREMIER_EVENT]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

// Tournament Status Utilities
export const getTournamentStatusLabel = (status: TournamentStatus): string => {
  const labels: Record<TournamentStatus, string> = {
    [TournamentStatus.UPCOMING]: 'Próximo',
    [TournamentStatus.ONGOING]: 'En Curso',
    [TournamentStatus.COMPLETED]: 'Completado',
    [TournamentStatus.CANCELLED]: 'Cancelado',
  };
  return labels[status] || status;
};

export const getTournamentStatusColor = (status: TournamentStatus): string => {
  const colors: Record<TournamentStatus, string> = {
    [TournamentStatus.UPCOMING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    [TournamentStatus.ONGOING]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    [TournamentStatus.COMPLETED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    [TournamentStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

// Date Utilities
export const formatTournamentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTournamentDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isUpcoming = (tournament: Tournament): boolean => {
  return tournament.status === TournamentStatus.UPCOMING && 
         new Date(tournament.start_date) > new Date();
};

export const isOngoing = (tournament: Tournament): boolean => {
  return tournament.status === TournamentStatus.ONGOING;
};

export const isCompleted = (tournament: Tournament): boolean => {
  return tournament.status === TournamentStatus.COMPLETED;
};

export const canRegister = (tournament: Tournament): boolean => {
  return tournament.registration_open && 
         tournament.status === TournamentStatus.UPCOMING &&
         (!tournament.max_players || tournament.current_players < tournament.max_players);
};

// Tournament ID Utilities
export const generateTournamentId = (date: Date = new Date()): string => {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${year}-${month}-${random}`;
};

export const validateTournamentId = (id: string): boolean => {
  const regex = /^\d{2}-\d{2}-\d{6}$/;
  return regex.test(id);
};

// Results Calculation Utilities
export const calculatePoints = (wins: number, losses: number, draws: number): number => {
  // Standard Pokemon tournament scoring: 3 points for win, 1 for draw, 0 for loss
  return (wins * 3) + (draws * 1);
};

export const calculatePlayerResults = (matches: any[], playerId: string): PlayerResults[string] => {
  const results = {
    wins: 0,
    losses: 0,
    draws: 0,
    byes: 0,
  };

  matches.forEach(match => {
    if (match.player1_id === playerId || match.player2_id === playerId) {
      switch (match.outcome) {
        case MatchOutcome.PLAYER1_WINS:
          if (match.player1_id === playerId) results.wins++;
          else results.losses++;
          break;
        case MatchOutcome.PLAYER2_WINS:
          if (match.player2_id === playerId) results.wins++;
          else results.losses++;
          break;
        case MatchOutcome.DRAW:
          results.draws++;
          break;
        case MatchOutcome.BYE:
          results.byes++;
          break;
        case MatchOutcome.DOUBLE_LOSS:
          results.losses++;
          break;
      }
    }
  });

  return results;
};

export const generateStandings = (
  participants: TournamentParticipant[], 
  results: TournamentResult[]
): TournamentStanding[] => {
  const standings: TournamentStanding[] = participants.map(participant => {
    const result = results.find(r => r.participant_id === participant.id);
    
    return {
      participant_id: participant.id,
      player_name: participant.player_name,
      player_id: participant.player_id,
      wins: result?.wins || 0,
      losses: result?.losses || 0,
      draws: result?.draws || 0,
      byes: result?.byes || 0,
      points: result?.points || 0,
      final_standing: result?.final_standing || 0,
    };
  });

  // Sort by points (descending), then by wins (descending)
  standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.wins !== b.wins) return b.wins - a.wins;
    return a.losses - b.losses; // Fewer losses is better
  });

  // Assign standings
  standings.forEach((standing, index) => {
    standing.final_standing = index + 1;
  });

  return standings;
};

// Tournament Capacity Utilities
export const getCapacityInfo = (tournament: Tournament) => {
  const { current_players, max_players } = tournament;
  const hasLimit = max_players && max_players > 0;
  const isFull = hasLimit && current_players >= max_players;
  const spotsLeft = hasLimit ? max_players - current_players : null;
  const capacityPercentage = hasLimit ? (current_players / max_players) * 100 : 0;

  return {
    current: current_players,
    max: max_players,
    hasLimit,
    isFull,
    spotsLeft,
    capacityPercentage,
    capacityText: hasLimit 
      ? `${current_players}/${max_players} jugadores`
      : `${current_players} jugadores`,
  };
};

// Search and Filter Utilities
export const filterTournaments = (
  tournaments: Tournament[],
  filters: {
    query?: string;
    type?: TournamentType;
    status?: TournamentStatus;
    city?: string;
    country?: string;
  }
): Tournament[] => {
  return tournaments.filter(tournament => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchText = `${tournament.name} ${tournament.city} ${tournament.country}`.toLowerCase();
      if (!searchText.includes(query)) return false;
    }

    // Type filter
    if (filters.type && tournament.tournament_type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status && tournament.status !== filters.status) {
      return false;
    }

    // Location filters
    if (filters.city && tournament.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.country && tournament.country.toLowerCase() !== filters.country.toLowerCase()) {
      return false;
    }

    return true;
  });
};

// Tournament URL Utilities
export const getTournamentUrl = (tournamentId: string): string => {
  return `/tournaments/${tournamentId}`;
};

export const getTournamentManageUrl = (tournamentId: string): string => {
  return `/tournaments/${tournamentId}/manage`;
};

export const getTournamentResultsUrl = (tournamentId: string): string => {
  return `/tournaments/${tournamentId}/results`;
};

// Validation Utilities
export const isValidPlayerCount = (count: number, tournamentType: TournamentType): boolean => {
  // Minimum 4 players for any tournament
  if (count < 4) return false;
  
  // Maximum varies by tournament type
  const maxPlayers: Record<TournamentType, number> = {
    [TournamentType.TCG_PRERELEASE]: 64,
    [TournamentType.TCG_LEAGUE_CHALLENGE]: 32,
    [TournamentType.TCG_LEAGUE_CUP]: 128,
    [TournamentType.VGC_PREMIER_EVENT]: 256,
    [TournamentType.GO_PREMIER_EVENT]: 128,
  };
  
  return count <= maxPlayers[tournamentType];
};

export const getRecommendedRounds = (playerCount: number): number => {
  // Swiss tournament round recommendations
  if (playerCount <= 8) return 3;
  if (playerCount <= 16) return 4;
  if (playerCount <= 32) return 5;
  if (playerCount <= 64) return 6;
  if (playerCount <= 128) return 7;
  return 8;
};

// Export all utilities as a single object for easier importing
export const TournamentUtils = {
  getTournamentTypeLabel,
  getTournamentTypeColor,
  getTournamentStatusLabel,
  getTournamentStatusColor,
  formatTournamentDate,
  formatTournamentDateTime,
  isUpcoming,
  isOngoing,
  isCompleted,
  canRegister,
  generateTournamentId,
  validateTournamentId,
  calculatePoints,
  calculatePlayerResults,
  generateStandings,
  getCapacityInfo,
  filterTournaments,
  getTournamentUrl,
  getTournamentManageUrl,
  getTournamentResultsUrl,
  isValidPlayerCount,
  getRecommendedRounds,
};