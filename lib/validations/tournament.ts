// Tournament Validation Schemas using Zod
// Provides runtime validation for all tournament-related data

import { z } from 'zod';
import { 
  TournamentType, 
  TournamentStatus, 
  ParticipantStatus, 
  MatchStatus, 
  MatchOutcome, 
  UserRole, 
  OrganizerRequestStatus, 
  FileType 
} from '@/lib/types/tournament';
import { 
  TOURNAMENT_LIMITS, 
  PLAYER_ID_CONFIG, 
  TOURNAMENT_ID_CONFIG
} from '@/lib/constants/tournament';

// Base validation schemas
export const PlayerIdSchema = z
  .string()
  .regex(PLAYER_ID_CONFIG.regex, `Player ID debe ser de ${PLAYER_ID_CONFIG.digits.min}-${PLAYER_ID_CONFIG.digits.max} dígitos`)
  .refine((val) => {
    const num = parseInt(val, 10);
    return num >= PLAYER_ID_CONFIG.min && num <= PLAYER_ID_CONFIG.max;
  }, `Player ID debe estar entre ${PLAYER_ID_CONFIG.min} y ${PLAYER_ID_CONFIG.max}`);

export const OfficialTournamentIdSchema = z
  .string()
  .regex(TOURNAMENT_ID_CONFIG.regex, `ID oficial debe tener formato ${TOURNAMENT_ID_CONFIG.format} (ej: ${TOURNAMENT_ID_CONFIG.example})`);

export const EmailSchema = z
  .string()
  .email('Email no válido')
  .optional()
  .or(z.literal(''));

export const PhoneSchema = z
  .string()
  .regex(/^[\+]?[0-9\s\-\(\)]{9,}$/, 'Teléfono no válido')
  .optional()
  .or(z.literal(''));

export const UrlSchema = z
  .string()
  .url('URL no válida')
  .optional()
  .or(z.literal(''));

// Enum validation schemas
export const TournamentTypeSchema = z.nativeEnum(TournamentType);
export const TournamentStatusSchema = z.nativeEnum(TournamentStatus);
export const ParticipantStatusSchema = z.nativeEnum(ParticipantStatus);
export const MatchStatusSchema = z.nativeEnum(MatchStatus);
export const MatchOutcomeSchema = z.nativeEnum(MatchOutcome);
export const UserRoleSchema = z.nativeEnum(UserRole);
export const OrganizerRequestStatusSchema = z.nativeEnum(OrganizerRequestStatus);
export const FileTypeSchema = z.nativeEnum(FileType);

// Core entity validation schemas
export const TournamentSchema = z.object({
  id: z.string().uuid(),
  official_tournament_id: OfficialTournamentIdSchema,
  name: z.string().min(TOURNAMENT_LIMITS.name.min, `Nombre debe tener al menos ${TOURNAMENT_LIMITS.name.min} caracteres`).max(TOURNAMENT_LIMITS.name.max),
  tournament_type: TournamentTypeSchema,
  city: z.string().min(TOURNAMENT_LIMITS.city.min, `Ciudad debe tener al menos ${TOURNAMENT_LIMITS.city.min} caracteres`).max(TOURNAMENT_LIMITS.city.max),
  country: z.string().min(TOURNAMENT_LIMITS.country.min, `País debe tener al menos ${TOURNAMENT_LIMITS.country.min} caracteres`).max(TOURNAMENT_LIMITS.country.max),
  state: z.string().max(TOURNAMENT_LIMITS.state.max).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  status: TournamentStatusSchema,
  organizer_id: z.string().uuid(),
  max_players: z.number().int().min(TOURNAMENT_LIMITS.players.min).max(TOURNAMENT_LIMITS.players.max).optional(),
  current_players: z.number().int().min(0).default(0),
  registration_open: z.boolean().default(true),
  description: z.string().max(TOURNAMENT_LIMITS.description.max).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TournamentParticipantSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  user_id: z.string().uuid(),
  player_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  player_id: PlayerIdSchema,
  player_birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD'),
  registration_date: z.string().datetime(),
  status: ParticipantStatusSchema,
});

export const TournamentResultSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  draws: z.number().int().min(0),
  byes: z.number().int().min(0),
  final_standing: z.number().int().min(1).optional(),
  points: z.number().min(0),
  created_at: z.string().datetime(),
});

export const TournamentMatchSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  round_number: z.number().int().min(1),
  table_number: z.number().int().min(1).optional(),
  player1_id: z.string().uuid(),
  player2_id: z.string().uuid().optional(),
  outcome: MatchOutcomeSchema.optional(),
  match_status: MatchStatusSchema,
  created_at: z.string().datetime(),
});

export const TournamentFileSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1),
  file_type: FileTypeSchema,
  file_size: z.number().int().min(0).optional(),
  uploaded_by: z.string().uuid(),
  created_at: z.string().datetime(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(50).optional(),
  last_name: z.string().min(2, 'Apellidos deben tener al menos 2 caracteres').max(50).optional(),
  player_id: PlayerIdSchema.optional(),
  birth_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  user_role: UserRoleSchema,
  organization_name: z.string().min(3).max(255).optional(),
  pokemon_league_url: UrlSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const OrganizerRequestSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  organization_name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(255),
  business_email: EmailSchema,
  phone_number: PhoneSchema,
  address: z.string().max(500).optional(),
  pokemon_league_url: UrlSchema,
  experience_description: z.string().min(50, 'Descripción debe tener al menos 50 caracteres').max(2000).optional(),
  status: OrganizerRequestStatusSchema,
  admin_notes: z.string().max(1000).optional(),
  requested_at: z.string().datetime(),
  reviewed_at: z.string().datetime().optional(),
  reviewed_by: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// API Request validation schemas
export const TournamentSearchParamsSchema = z.object({
  query: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  tournament_type: TournamentTypeSchema.optional(),
  status: TournamentStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  organizer_id: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const CreateTournamentRequestSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(255),
  tournament_type: TournamentTypeSchema,
  official_tournament_id: OfficialTournamentIdSchema,
  city: z.string().min(2, 'Ciudad debe tener al menos 2 caracteres').max(100),
  country: z.string().min(2, 'País debe tener al menos 2 caracteres').max(100),
  state: z.string().max(100).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  max_players: z.number().int().min(4, 'Mínimo 4 jugadores').max(1000, 'Máximo 1000 jugadores').optional(),
  description: z.string().max(1000).optional(),
}).refine((data) => {
  if (data.end_date && data.start_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: 'Fecha de fin debe ser posterior a fecha de inicio',
  path: ['end_date'],
});

export const UpdateTournamentRequestSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  tournament_type: TournamentTypeSchema.optional(),
  city: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  state: z.string().max(100).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  max_players: z.number().int().min(4).max(1000).optional(),
  registration_open: z.boolean().optional(),
  status: TournamentStatusSchema.optional(),
  description: z.string().max(1000).optional(),
}).refine((data) => {
  if (data.end_date && data.start_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: 'Fecha de fin debe ser posterior a fecha de inicio',
  path: ['end_date'],
});

export const TournamentRegistrationRequestSchema = z.object({
  tournament_id: z.string().uuid(),
  player_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  player_id: PlayerIdSchema,
  player_birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD'),
});

export const CreateOrganizerRequestSchema = z.object({
  organization_name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(255),
  business_email: EmailSchema,
  phone_number: PhoneSchema,
  address: z.string().max(500).optional(),
  pokemon_league_url: UrlSchema,
  experience_description: z.string().min(50, 'Descripción debe tener al menos 50 caracteres').max(2000),
});

export const UpdateOrganizerRequestSchema = z.object({
  organization_name: z.string().min(3).max(255).optional(),
  business_email: EmailSchema,
  phone_number: PhoneSchema,
  address: z.string().max(500).optional(),
  pokemon_league_url: UrlSchema,
  experience_description: z.string().min(50).max(2000).optional(),
});

export const ProcessTournamentRequestSchema = z.object({
  tournament_id: z.string().uuid(),
  file_id: z.string().uuid(),
});

// File upload validation
export const TournamentFileUploadSchema = z.object({
  tournament_id: z.string().uuid(),
  file_type: FileTypeSchema,
}).and(z.object({
  file: z.instanceof(File).refine((file) => {
    // Validate file size (max 10MB)
    return file.size <= 10 * 1024 * 1024;
  }, 'Archivo debe ser menor a 10MB').refine((file) => {
    // Validate file extensions
    const allowedExtensions = ['.tdf', '.xml', '.html'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(extension);
  }, 'Tipo de archivo no válido. Solo se permiten .tdf, .xml, .html'),
}));

// XML Processing validation schemas
export const XMLPlayerSchema = z.object({
  userid: z.string(),
  firstname: z.string(),
  lastname: z.string(),
});

export const XMLMatchSchema = z.object({
  player1: z.object({ userid: z.string() }).optional(),
  player2: z.object({ userid: z.string() }).optional(),
  player: z.object({ userid: z.string() }).optional(), // For byes
  tablenumber: z.string().optional(),
  outcome: MatchOutcomeSchema,
});

export const XMLRoundSchema = z.object({
  number: z.string(),
  matches: z.array(XMLMatchSchema),
});

export const XMLPodSchema = z.object({
  rounds: z.array(XMLRoundSchema),
});

export const TournamentXMLDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  startdate: z.string(),
  players: z.array(XMLPlayerSchema),
  pods: z.array(XMLPodSchema),
});

// Form validation helpers
export const validateTournamentForm = (data: unknown) => {
  return CreateTournamentRequestSchema.safeParse(data);
};

export const validateRegistrationForm = (data: unknown) => {
  return TournamentRegistrationRequestSchema.safeParse(data);
};

export const validateOrganizerRequestForm = (data: unknown) => {
  return CreateOrganizerRequestSchema.safeParse(data);
};

export const validateUserProfileForm = (data: unknown) => {
  return UserProfileSchema.omit({ 
    id: true, 
    user_id: true, 
    created_at: true, 
    updated_at: true 
  }).safeParse(data);
};

export const validateSearchParams = (data: unknown) => {
  return TournamentSearchParamsSchema.safeParse(data);
};

// Type inference helpers
export type ValidatedTournament = z.infer<typeof TournamentSchema>;
export type ValidatedCreateTournamentRequest = z.infer<typeof CreateTournamentRequestSchema>;
export type ValidatedUpdateTournamentRequest = z.infer<typeof UpdateTournamentRequestSchema>;
export type ValidatedTournamentParticipant = z.infer<typeof TournamentParticipantSchema>;
export type ValidatedTournamentResult = z.infer<typeof TournamentResultSchema>;
export type ValidatedTournamentMatch = z.infer<typeof TournamentMatchSchema>;
export type ValidatedUserProfile = z.infer<typeof UserProfileSchema>;
export type ValidatedOrganizerRequest = z.infer<typeof OrganizerRequestSchema>;
export type ValidatedCreateOrganizerRequest = z.infer<typeof CreateOrganizerRequestSchema>;
export type ValidatedTournamentSearchParams = z.infer<typeof TournamentSearchParamsSchema>;
export type ValidatedTournamentRegistrationRequest = z.infer<typeof TournamentRegistrationRequestSchema>;
export type ValidatedTournamentFileUpload = z.infer<typeof TournamentFileUploadSchema>;
export type ValidatedTournamentXMLData = z.infer<typeof TournamentXMLDataSchema>;

// Error formatting helper
export const formatZodError = (error: z.ZodError) => {
  const formattedErrors: Record<string, string> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
};

// Validation middleware helper for API routes
export const validateRequestBody = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: formatZodError(result.error) };
    }
  };
};