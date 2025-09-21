

export enum TournamentType {
  TCG_PRERELEASE = 'TCG Prerelease',
  TCG_LEAGUE_CHALLENGE = 'TCG League Challenge',
  TCG_LEAGUE_CUP = 'TCG League Cup',
  VGC_PREMIER_EVENT = 'VGC Premier Event',
  GO_PREMIER_EVENT = 'GO Premier Event'
}

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ParticipantStatus {
  REGISTERED = 'registered',
  CHECKED_IN = 'checked_in',
  DROPPED = 'dropped'
}

export enum MatchStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  COMPLETED = 'completed'
}

export enum MatchOutcome {
  PLAYER1_WINS = '1',
  PLAYER2_WINS = '2',
  DRAW = '3',
  DOUBLE_LOSS = '4',
  BYE = '5'
}

export enum UserRole {
  PLAYER = 'player',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

export enum OrganizerRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export enum AdminActionType {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
  NOTES_ADDED = 'notes_added',
  STATUS_CHANGED = 'status_changed',
  REQUEST_VIEWED = 'request_viewed'
}

export enum FileType {
  TDF = 'tdf',
  HTML = 'html',
  XML = 'xml'
}

// File Upload Status for UI consistency
export enum FileUploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Loading states for UI consistency
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Validation states
export enum ValidationState {
  VALID = 'valid',
  INVALID = 'invalid',
  PENDING = 'pending'
}

// Core Tournament Interface
export interface Tournament {
  id: string;
  official_tournament_id: string;
  name: string;
  tournament_type: TournamentType;
  city: string;
  country: string;
  state?: string;
  start_date: string;
  end_date?: string;
  status: TournamentStatus;
  organizer_id: string;
  max_players?: number;
  current_players: number;
  registration_open: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Tournament with organizer information
export interface TournamentWithOrganizer extends Tournament {
  organizer: {
    first_name: string;
    last_name: string;
    organization_name?: string;
  };
}

// Tournament Participant Interface
export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string; // Always required - only users with accounts can participate
  player_name: string;
  player_id: string; // Always required - TDF always provides this
  player_birthdate: string; // Always required - TDF always provides this
  registration_date: string;
  status: ParticipantStatus;
}

// Tournament Result Interface
export interface TournamentResult {
  id: string;
  tournament_id: string;
  participant_id: string;
  wins: number;
  losses: number;
  draws: number;
  byes: number;
  final_standing?: number;
  points: number;
  created_at: string;
}

// Tournament Result with participant info
export interface TournamentResultWithParticipant extends TournamentResult {
  participant: {
    player_name: string;
    player_id: string;
  };
}

// Tournament Match Interface
export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  table_number?: number;
  player1_id: string;
  player2_id?: string;
  outcome?: MatchOutcome;
  match_status: MatchStatus;
  created_at: string;
}

// Tournament Match with player info
export interface TournamentMatchWithPlayers extends TournamentMatch {
  player1: {
    player_name: string;
    player_id: string;
  };
  player2?: {
    player_name: string;
    player_id: string;
  };
}

// Tournament File Interface
export interface TournamentFile {
  id: string;
  tournament_id: string;
  file_name: string;
  file_path: string;
  file_type: FileType;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
}

// Extended User Profile Interface
export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  player_id?: string;
  birth_year?: number;
  user_role: UserRole;
  organization_name?: string;
  created_at: string;
  updated_at: string;
}

// Organizer Request Interface
export interface OrganizerRequest {
  id: string;
  user_id: string;
  organization_name: string;
  business_email?: string;
  phone_number?: string;
  address?: string;
  pokemon_league_url?: string;
  experience_description?: string;
  status: OrganizerRequestStatus;
  admin_notes?: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

// Organizer Request with user info
export interface OrganizerRequestWithUser extends OrganizerRequest {
  user_profile: {
    first_name?: string;
    last_name?: string;
    player_id?: string;
  };
}

// API Request/Response Types

// Tournament Search Parameters
export interface TournamentSearchParams {
  query?: string;
  city?: string;
  country?: string;
  tournament_type?: TournamentType;
  status?: TournamentStatus;
  date_from?: string;
  date_to?: string;
  organizer_id?: string;
  limit?: number;
  offset?: number;
}

// Tournament Search Response
export interface TournamentSearchResponse {
  tournaments: Tournament[];
  total: number;
  hasMore: boolean;
}

// Create Tournament Request
export interface CreateTournamentRequest {
  name: string;
  tournament_type: TournamentType;
  official_tournament_id: string; // Format: YY-MM-XXXXXX (e.g., 25-02-000001)
  city: string;
  country: string;
  state?: string;
  start_date: string;
  end_date?: string;
  max_players?: number;
  description?: string;
}

// Update Tournament Request
export interface UpdateTournamentRequest {
  name?: string;
  tournament_type?: TournamentType;
  city?: string;
  country?: string;
  state?: string;
  start_date?: string;
  end_date?: string;
  max_players?: number;
  registration_open?: boolean;
  status?: TournamentStatus;
  description?: string;
}

// Tournament Registration Request
export interface TournamentRegistrationRequest {
  tournament_id: string;
  player_name: string;
  player_id: string;
  player_birthdate: string;
}

// Tournament File Upload Request
export interface TournamentFileUploadRequest {
  tournament_id: string;
  file: File;
  file_type: FileType;
}

// Create Organizer Request
export interface CreateOrganizerRequest {
  organization_name: string;
  business_email?: string;
  phone_number?: string;
  address?: string;
  pokemon_league_url?: string;
  experience_description?: string;
}

// Update Organizer Request
export interface UpdateOrganizerRequest {
  organization_name?: string;
  business_email?: string;
  phone_number?: string;
  address?: string;
  pokemon_league_url?: string;
  experience_description?: string;
}

// Admin Activity Log
export interface AdminActivity {
  id: string;
  admin_id: string;
  admin_name: string;
  action: AdminActionType;
  request_id: string;
  organization_name: string;
  timestamp: string;
  notes?: string;
  previous_status?: OrganizerRequestStatus;
  new_status?: OrganizerRequestStatus;
}

// Admin Dashboard Metrics
export interface AdminDashboardMetrics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  underReviewRequests: number;
  recentActivity: AdminActivity[];
}

// Extended Organizer Request with Admin Fields
export interface AdminOrganizerRequest extends OrganizerRequest {
  user_profile: {
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
  };
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_history: AdminActivity[];
}

// Request Update Payload
export interface UpdateOrganizerRequestPayload {
  status: OrganizerRequestStatus;
  admin_notes?: string;
  reviewed_by: string;
}

// Tournament Processing Request
export interface ProcessTournamentRequest {
  tournament_id: string;
  file_id: string;
}

// Tournament Processing Response
export interface ProcessTournamentResponse {
  success: boolean;
  html_report_url?: string;
  participants_count: number;
  rounds_count: number;
  error?: string;
}

// TDF Import Report Interface
export interface TDFImportReport {
  total_participants: number;
  imported_participants: number;
  skipped_participants: number;
  imported_users: Array<{
    player_name: string;
    player_id: string; // Always required - TDF always provides this
    player_birthdate: string; // Always required - TDF always provides this
    user_id: string;
  }>;
  skipped_users: Array<{
    player_name: string;
    player_id: string; // Always required - TDF always provides this
    player_birthdate: string; // Always required - TDF always provides this
    reason: 'no_account' | 'duplicate' | 'invalid_data';
  }>;
}

// Tournament Statistics
export interface TournamentStatistics {
  total_tournaments: number;
  upcoming_tournaments: number;
  ongoing_tournaments: number;
  completed_tournaments: number;
  total_participants: number;
  tournaments_by_type: Record<TournamentType, number>;
  tournaments_by_country: Record<string, number>;
}

// Search Suggestion
export interface TournamentSuggestion {
  type: 'tournament' | 'city' | 'organizer';
  value: string;
  label: string;
  tournament_id?: string;
}

// Tournament Dashboard Data
export interface TournamentDashboardData {
  user_tournaments: Tournament[];
  organized_tournaments?: Tournament[];
  upcoming_tournaments: Tournament[];
  recent_results: TournamentResultWithParticipant[];
  statistics: TournamentStatistics;
}

// API Error Response (Enhanced)
export interface APIError {
  error: string;
  message: string;
  code: ErrorCodes;
  details?: Record<string, unknown>;
  field?: string;
  timestamp: string;
  request_id?: string;
}

// Standard API Response
export interface APIResponse<T = unknown> {
  data: T;
  message?: string;
  timestamp: string;
  request_id?: string;
}

// Paginated API Response
export interface PaginatedAPIResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    totalPages: number;
  };
  message?: string;
  timestamp: string;
  request_id?: string;
}

// Common error codes
export enum ErrorCodes {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TOURNAMENT_FULL = 'TOURNAMENT_FULL',
  DUPLICATE_REGISTRATION = 'DUPLICATE_REGISTRATION',
  DUPLICATE_TOURNAMENT_ID = 'DUPLICATE_TOURNAMENT_ID',
  DUPLICATE_ORGANIZER_REQUEST = 'DUPLICATE_ORGANIZER_REQUEST',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  // Admin-specific error codes
  ADMIN_ACCESS_REQUIRED = 'ADMIN_ACCESS_REQUIRED',
  INVALID_REQUEST_STATUS = 'INVALID_REQUEST_STATUS',
  REQUEST_ALREADY_PROCESSED = 'REQUEST_ALREADY_PROCESSED',
  ADMIN_NOTES_TOO_LONG = 'ADMIN_NOTES_TOO_LONG'
}

// Tournament XML Processing Types (for migrating Python logic)
export interface TournamentXMLData {
  id: string;
  name: string;
  startdate: string;
  players: XMLPlayer[];
  pods: XMLPod[];
}

export interface XMLPlayer {
  userid: string;
  firstname: string;
  lastname: string;
}

export interface XMLPod {
  rounds: XMLRound[];
}

export interface XMLRound {
  number: string;
  matches: XMLMatch[];
}

export interface XMLMatch {
  player1?: { userid: string };
  player2?: { userid: string };
  player?: { userid: string }; // For byes
  tablenumber?: string;
  outcome: MatchOutcome;
}

export interface PlayerResults {
  [playerId: string]: {
    wins: number;
    losses: number;
    draws: number;
    byes: number;
  };
}

// Tournament Round Interface
export interface TournamentRound {
  id: string;
  tournament_id: string;
  round_number: number;
  status: 'pending' | 'ongoing' | 'completed';
  matches: TournamentMatch[];
  created_at: string;
}

// Tournament Standings Interface
export interface TournamentStanding {
  participant_id: string;
  player_name: string;
  player_id: string;
  wins: number;
  losses: number;
  draws: number;
  byes: number;
  points: number;
  tiebreaker_points?: number;
  final_standing: number;
}

// Tournament Pairing Interface
export interface TournamentPairing {
  round_number: number;
  table_number: number;
  player1: {
    participant_id: string;
    player_name: string;
    player_id: string;
  };
  player2?: {
    participant_id: string;
    player_name: string;
    player_id: string;
  };
  is_bye: boolean;
}

// Tournament Report Interface
export interface TournamentReport {
  tournament: Tournament;
  participants: TournamentParticipant[];
  rounds: TournamentRound[];
  final_standings: TournamentStanding[];
  statistics: {
    total_participants: number;
    total_rounds: number;
    completion_rate: number;
    average_match_duration?: number;
  };
  generated_at: string;
}

// Form validation types
export interface TournamentFormErrors {
  name?: string;
  tournament_type?: string;
  official_tournament_id?: string;
  city?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  max_players?: string;
  description?: string;
}

export interface RegistrationFormErrors {
  player_name?: string;
  player_id?: string;
}

// Component Props Types
export interface TournamentCardProps {
  tournament: Tournament;
  userRole: UserRole;
  onRegister?: (tournamentId: string) => void;
  onManage?: (tournamentId: string) => void;
  showActions?: boolean;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: TournamentSuggestion[];
  loading?: boolean;
}

export interface SearchResultsProps {
  tournaments: Tournament[];
  loading: boolean;
  onTournamentSelect: (tournament: Tournament) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export interface SearchFiltersProps {
  filters: TournamentSearchParams;
  onFiltersChange: (filters: TournamentSearchParams) => void;
  tournamentTypes: TournamentType[];
  countries: string[];
}

export interface CreateTournamentFormProps {
  onSubmit: (tournament: CreateTournamentRequest) => void;
  loading: boolean;
  errors?: TournamentFormErrors;
}

export interface TournamentDetailsProps {
  tournament: Tournament;
  participants: TournamentParticipant[];
  results?: TournamentResult[];
  matches?: TournamentMatch[];
  userRole: UserRole;
  canManage: boolean;
}

export interface FileUploadProps {
  tournamentId: string;
  onUploadComplete: (fileId: string) => void;
  acceptedTypes: FileType[];
  maxSize?: number;
  loading?: boolean;
}

export interface ResultsViewerProps {
  tournamentId: string;
  htmlReportUrl?: string;
  participants: TournamentParticipant[];
  results: TournamentResult[];
  matches?: TournamentMatch[];
}

export interface TournamentStandingsProps {
  standings: TournamentStanding[];
  loading?: boolean;
  showTiebreakers?: boolean;
}

export interface TournamentPairingsProps {
  pairings: TournamentPairing[];
  currentRound: number;
  onSubmitResult?: (matchId: string, outcome: MatchOutcome) => void;
  canSubmitResults?: boolean;
}

export interface TournamentRoundProps {
  round: TournamentRound;
  onStartRound?: (roundId: string) => void;
  onCompleteRound?: (roundId: string) => void;
  canManage?: boolean;
}

// Utility Types
export type TournamentWithDetails = Tournament & {
  organizer: UserProfile;
  participants: TournamentParticipant[];
  current_round?: number;
  total_rounds?: number;
};

export type ParticipantWithResults = TournamentParticipant & {
  results?: TournamentResult;
  current_standing?: number;
};

export type MatchWithPlayers = TournamentMatch & {
  player1: Pick<TournamentParticipant, 'player_name' | 'player_id'>;
  player2?: Pick<TournamentParticipant, 'player_name' | 'player_id'>;
};

// Hook return types
export interface UseTournamentReturn {
  tournament: Tournament | null;
  participants: TournamentParticipant[];
  results: TournamentResult[];
  matches: TournamentMatch[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseTournamentSearchReturn {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  search: (params: TournamentSearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export interface UseTournamentRegistrationReturn {
  register: (data: TournamentRegistrationRequest) => Promise<boolean>;
  unregister: (tournamentId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// Context Types
export interface TournamentContextValue {
  currentTournament: Tournament | null;
  userRole: UserRole;
  canManage: boolean;
  isRegistered: boolean;
  setCurrentTournament: (tournament: Tournament | null) => void;
}

export interface UserContextValue {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Formatted Error Interface for consistent error handling
export interface FormattedError {
  code: string;
  message: string;
  field?: string;
  severity: 'info' | 'warning' | 'error';
  action?: {
    label: string;
    handler: () => void;
  };
}

// TDF-specific types for better TDF-Web integration
export interface TDFParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  player_name: string;
  player_id: string; // Always required - TDF always provides this
  player_birthdate: string; // Always required - TDF always provides this
  tdf_userid?: string; // TDF-specific user ID
  registration_date: string;
  registration_source: 'web' | 'tdf';
  status: ParticipantStatus;
}

// Extended Tournament interface with TDF metadata
export interface TournamentWithTDF extends Tournament {
  tdf_metadata?: Record<string, unknown>;
  original_tdf_file_path?: string;
  has_tdf_data: boolean;
}

// TDF Conversion utilities types
export interface TDFConversionResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors: string[];
  warnings: string[];
}

// Status configuration for UI components
export interface StatusDisplayConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
  badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
}

// File upload with progress tracking
export interface FileUploadProgress {
  file: File;
  status: FileUploadStatus;
  progress: number;
  error?: string;
  uploadedAt?: string;
}

// Tournament capacity information
export interface TournamentCapacityInfo {
  current: number;
  max?: number;
  hasLimit: boolean;
  isFull: boolean;
  spotsLeft?: number;
  capacityPercentage: number;
  capacityText: string;
}

// Date formatting options
export interface DateFormatOptions {
  style: 'short' | 'medium' | 'long';
  includeTime?: boolean;
  relative?: boolean;
  locale?: string;
}

// Tournament filtering options
export interface TournamentFilterOptions {
  query?: string;
  type?: TournamentType;
  status?: TournamentStatus;
  city?: string;
  country?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Component state types for better type safety
export type ComponentLoadingState = LoadingState;
export type ComponentValidationState = ValidationState;

// Re-export commonly used types for easier imports
// Note: FileUploadStatus is defined in this file as an enum

// Type guards for runtime type checking
export const isTournamentStatus = (value: string): value is TournamentStatus => {
  return Object.values(TournamentStatus).includes(value as TournamentStatus);
};

export const isParticipantStatus = (value: string): value is ParticipantStatus => {
  return Object.values(ParticipantStatus).includes(value as ParticipantStatus);
};

export const isTournamentType = (value: string): value is TournamentType => {
  return Object.values(TournamentType).includes(value as TournamentType);
};

export const isFileUploadStatus = (value: string): value is FileUploadStatus => {
  return Object.values(FileUploadStatus).includes(value as FileUploadStatus);
};