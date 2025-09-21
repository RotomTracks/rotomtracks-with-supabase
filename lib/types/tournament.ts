// Tournament Management System Types
// Defines all TypeScript interfaces and types for the tournament system

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
  ORGANIZER = 'organizer'
}

export enum OrganizerRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export enum FileType {
  TDF = 'tdf',
  HTML = 'html',
  XML = 'xml'
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
  user_id: string;
  player_name: string;
  player_id: string;
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
  player_id: string; // Format: 1-7 digits, range 1-9999999
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

// API Error Response
export interface APIError {
  error: string;
  message: string;
  code: string;
  details?: any;
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
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR'
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