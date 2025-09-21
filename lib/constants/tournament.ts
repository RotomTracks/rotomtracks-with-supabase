// Tournament Constants
// Defines constants and configuration values for the tournament system

import { TournamentType, FileType } from '@/lib/types/tournament';

// Tournament Type Configurations
export const TOURNAMENT_TYPE_CONFIG = {
  [TournamentType.TCG_PRERELEASE]: {
    label: 'TCG Prerelease',
    description: 'Evento de prelanzamiento de TCG',
    maxPlayers: 64,
    minPlayers: 4,
    defaultRounds: 4,
    color: 'purple',
    icon: '🎴',
  },
  [TournamentType.TCG_LEAGUE_CHALLENGE]: {
    label: 'TCG League Challenge',
    description: 'Desafío de Liga TCG',
    maxPlayers: 32,
    minPlayers: 4,
    defaultRounds: 4,
    color: 'blue',
    icon: '⚔️',
  },
  [TournamentType.TCG_LEAGUE_CUP]: {
    label: 'TCG League Cup',
    description: 'Copa de Liga TCG',
    maxPlayers: 128,
    minPlayers: 8,
    defaultRounds: 6,
    color: 'green',
    icon: '🏆',
  },
  [TournamentType.VGC_PREMIER_EVENT]: {
    label: 'VGC Premier Event',
    description: 'Evento Premier de VGC',
    maxPlayers: 256,
    minPlayers: 8,
    defaultRounds: 7,
    color: 'red',
    icon: '🎮',
  },
  [TournamentType.GO_PREMIER_EVENT]: {
    label: 'GO Premier Event',
    description: 'Evento Premier de Pokémon GO',
    maxPlayers: 128,
    minPlayers: 8,
    defaultRounds: 6,
    color: 'yellow',
    icon: '📱',
  },
} as const;

// File Upload Configurations
export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [FileType.TDF, FileType.XML, FileType.HTML],
  allowedExtensions: ['.tdf', '.xml', '.html'],
  allowedMimeTypes: [
    'application/xml',
    'text/xml',
    'text/html',
    'application/octet-stream', // For .tdf files
  ],
} as const;

// Tournament Limits
export const TOURNAMENT_LIMITS = {
  name: {
    min: 3,
    max: 255,
  },
  description: {
    max: 1000,
  },
  city: {
    min: 2,
    max: 100,
  },
  country: {
    min: 2,
    max: 100,
  },
  state: {
    max: 100,
  },
  players: {
    min: 4,
    max: 1000,
  },
  organizationName: {
    min: 3,
    max: 255,
  },
  experienceDescription: {
    min: 50,
    max: 2000,
  },
  address: {
    max: 500,
  },
  adminNotes: {
    max: 1000,
  },
} as const;

// Player ID Configuration
export const PLAYER_ID_CONFIG = {
  min: 1,
  max: 9999999,
  digits: {
    min: 1,
    max: 7,
  },
  regex: /^\d{1,7}$/,
} as const;

// Tournament ID Configuration
export const TOURNAMENT_ID_CONFIG = {
  format: 'YY-MM-XXXXXX',
  regex: /^\d{2}-\d{2}-\d{6}$/,
  example: '25-02-000001',
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
  minQueryLength: 2,
  debounceMs: 300,
} as const;

// Tournament Status Colors - Updated to use centralized status management
// These are kept for backward compatibility but should use TournamentStatusManager
export const STATUS_COLORS = {
  upcoming: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    full: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  },
  ongoing: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    full: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  },
  completed: {
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-800 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    full: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    full: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  },
} as const;

// Tournament Type Colors - Updated to include full classes and icons
export const TYPE_COLORS = {
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    full: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    icon: '🎴',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    full: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: '⚔️',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    full: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: '🏆',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    full: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: '🎮',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
    full: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    icon: '📱',
  },
} as const;

// Scoring System
export const SCORING = {
  win: 3,
  draw: 1,
  loss: 0,
  bye: 3, // Byes count as wins
} as const;

// Round Recommendations based on player count
export const ROUND_RECOMMENDATIONS = [
  { minPlayers: 4, maxPlayers: 8, rounds: 3 },
  { minPlayers: 9, maxPlayers: 16, rounds: 4 },
  { minPlayers: 17, maxPlayers: 32, rounds: 5 },
  { minPlayers: 33, maxPlayers: 64, rounds: 6 },
  { minPlayers: 65, maxPlayers: 128, rounds: 7 },
  { minPlayers: 129, maxPlayers: 256, rounds: 8 },
  { minPlayers: 257, maxPlayers: 512, rounds: 9 },
  { minPlayers: 513, maxPlayers: 1000, rounds: 10 },
] as const;

// Countries list (common ones for tournaments)
export const COUNTRIES = [
  'España',
  'México',
  'Argentina',
  'Colombia',
  'Chile',
  'Perú',
  'Venezuela',
  'Ecuador',
  'Bolivia',
  'Paraguay',
  'Uruguay',
  'Costa Rica',
  'Panamá',
  'Guatemala',
  'Honduras',
  'El Salvador',
  'Nicaragua',
  'República Dominicana',
  'Puerto Rico',
  'Estados Unidos',
  'Canadá',
  'Brasil',
  'Portugal',
  'Francia',
  'Italia',
  'Alemania',
  'Reino Unido',
  'Países Bajos',
  'Bélgica',
  'Suiza',
  'Austria',
  'Suecia',
  'Noruega',
  'Dinamarca',
  'Finlandia',
  'Polonia',
  'República Checa',
  'Hungría',
  'Rumania',
  'Bulgaria',
  'Grecia',
  'Turquía',
  'Japón',
  'Corea del Sur',
  'China',
  'Taiwán',
  'Hong Kong',
  'Singapur',
  'Malasia',
  'Tailandia',
  'Filipinas',
  'Indonesia',
  'Vietnam',
  'India',
  'Australia',
  'Nueva Zelanda',
  'Sudáfrica',
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  TOURNAMENT_NOT_FOUND: 'Torneo no encontrado',
  TOURNAMENT_FULL: 'El torneo está completo',
  REGISTRATION_CLOSED: 'Las inscripciones están cerradas',
  ALREADY_REGISTERED: 'Ya estás registrado en este torneo',
  NOT_REGISTERED: 'No estás registrado en este torneo',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  INVALID_TOURNAMENT_ID: 'ID de torneo no válido',
  INVALID_PLAYER_ID: 'Player ID no válido',
  DUPLICATE_TOURNAMENT_ID: 'Ya existe un torneo con este ID',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  PROCESSING_ERROR: 'Error al procesar el archivo',
  VALIDATION_ERROR: 'Error de validación',
  NETWORK_ERROR: 'Error de conexión',
  UNKNOWN_ERROR: 'Error desconocido',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TOURNAMENT_CREATED: 'Torneo creado exitosamente',
  TOURNAMENT_UPDATED: 'Torneo actualizado exitosamente',
  TOURNAMENT_DELETED: 'Torneo eliminado exitosamente',
  REGISTRATION_SUCCESS: 'Inscripción exitosa',
  UNREGISTRATION_SUCCESS: 'Inscripción cancelada exitosamente',
  FILE_UPLOADED: 'Archivo subido exitosamente',
  FILE_PROCESSED: 'Archivo procesado exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  ORGANIZER_REQUEST_SENT: 'Solicitud de organizador enviada exitosamente',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  tournaments: '/api/tournaments',
  tournamentSearch: '/api/tournaments/search',
  tournamentById: (id: string) => `/api/tournaments/${id}`,
  tournamentParticipants: (id: string) => `/api/tournaments/${id}/participants`,
  tournamentResults: (id: string) => `/api/tournaments/${id}/results`,
  tournamentFiles: (id: string) => `/api/tournaments/${id}/files`,
  tournamentProcess: (id: string) => `/api/tournaments/${id}/process`,
  userProfile: '/api/user/profile',
  organizerRequests: '/api/organizer-requests',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  searchFilters: 'tournament_search_filters',
  recentSearches: 'tournament_recent_searches',
  userPreferences: 'user_preferences',
  draftTournament: 'draft_tournament',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Date Format Constants
export const DATE_FORMATS = {
  TDF: 'MM/DD/YYYY', // TDF file format
  DISPLAY_SHORT: 'DD/MM/YYYY', // Short display format
  DISPLAY_LONG: 'DD de MMMM de YYYY', // Long display format
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ', // ISO format
  API: 'YYYY-MM-DD', // API date format
} as const;

// TDF Constants
export const TDF_CONSTANTS = {
  DATE_FORMAT: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
  TOURNAMENT_ID_FORMAT: /^\d{2}-\d{2}-\d{6}$/,
  PLAYER_ID_FORMAT: /^\d{1,7}$/,
  ENCODING: 'UTF-8',
  VERSION: '1.80',
  SUPPORTED_GAMETYPES: ['TRADING_CARD_GAME', 'VIDEO_GAME', 'GO'],
  SUPPORTED_MODES: ['PRERELEASE', 'LEAGUECHALLENGE', 'TCG1DAY', 'VGCPREMIER', 'GOPREMIER'],
} as const;

// Status Translation Constants
export const STATUS_LABELS = {
  TOURNAMENT: {
    upcoming: 'Próximo',
    ongoing: 'En Curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  },
  PARTICIPANT: {
    registered: 'Registrado',
    checked_in: 'Confirmado',
    dropped: 'Retirado',
  },
  FILE: {
    pending: 'Pendiente',
    uploading: 'Subiendo',
    completed: 'Completado',
    error: 'Error',
  },
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;