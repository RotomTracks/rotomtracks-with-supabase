// Tournament Database Operations
// Provides database access functions for tournament management

import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type {
  Tournament,
  TournamentSearchParams,
  TournamentSearchResponse,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentParticipant,
  TournamentResult,
  TournamentMatch,
  TournamentFile,
  TournamentRegistrationRequest
} from '@/lib/types/tournament';
import { UserRole } from '@/lib/types/tournament';

// Get Supabase client (server-side)
export async function getServerSupabaseClient() {
  return await createServerClient();
}

// Get Supabase client (client-side)
export function getClientSupabaseClient() {
  return createClient();
}

// Tournament CRUD Operations
export class TournamentDatabase {
  
  // Search tournaments with filters and pagination
  static async searchTournaments(params: TournamentSearchParams): Promise<TournamentSearchResponse> {
    const supabase = getClientSupabaseClient();
    const {
      query,
      city,
      country,
      tournament_type,
      status,
      date_from,
      date_to,
      organizer_id,
      limit = 20,
      offset = 0
    } = params;

    let queryBuilder = supabase
      .from('tournaments')
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name
        )
      `, { count: 'exact' });

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`);
    }
    
    if (city) {
      queryBuilder = queryBuilder.eq('city', city);
    }
    
    if (country) {
      queryBuilder = queryBuilder.eq('country', country);
    }
    
    if (tournament_type) {
      queryBuilder = queryBuilder.eq('tournament_type', tournament_type);
    }
    
    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }
    
    if (organizer_id) {
      queryBuilder = queryBuilder.eq('organizer_id', organizer_id);
    }
    
    if (date_from) {
      queryBuilder = queryBuilder.gte('start_date', date_from);
    }
    
    if (date_to) {
      queryBuilder = queryBuilder.lte('start_date', date_to);
    }

    // Apply pagination and ordering
    queryBuilder = queryBuilder
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to search tournaments: ${error.message}`);
    }

    return {
      tournaments: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  }

  // Get tournament by ID
  static async getTournamentById(id: string): Promise<Tournament | null> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        organizer:user_profiles!tournaments_organizer_id_fkey(
          first_name,
          last_name,
          organization_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Tournament not found
      }
      throw new Error(`Failed to get tournament: ${error.message}`);
    }

    return data;
  }

  // Create new tournament
  static async createTournament(tournament: CreateTournamentRequest, organizerId: string): Promise<Tournament> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{
        ...tournament,
        organizer_id: organizerId
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Tournament with this official ID already exists');
      }
      throw new Error(`Failed to create tournament: ${error.message}`);
    }

    return data;
  }

  // Update tournament
  static async updateTournament(id: string, updates: UpdateTournamentRequest): Promise<Tournament> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update tournament: ${error.message}`);
    }

    return data;
  }

  // Delete tournament
  static async deleteTournament(id: string): Promise<void> {
    const supabase = getClientSupabaseClient();
    
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete tournament: ${error.message}`);
    }
  }

  // Get tournaments for user (as participant or organizer)
  static async getUserTournaments(userId: string, role: UserRole): Promise<Tournament[]> {
    const supabase = getClientSupabaseClient();
    
    if (role === UserRole.ORGANIZER) {
      // Get tournaments organized by user
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('organizer_id', userId)
        .order('start_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to get organized tournaments: ${error.message}`);
      }

      return data || [];
    } else {
      // Get tournaments user is participating in
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          tournament:tournaments(*)
        `)
        .eq('user_id', userId)
        .order('registration_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user tournaments: ${error.message}`);
      }

      return (data?.map(item => item.tournament).filter(Boolean) as unknown as Tournament[]) || [];
    }
  }
}

// Tournament Participants Operations
export class ParticipantDatabase {
  
  // Register user for tournament
  static async registerForTournament(registration: TournamentRegistrationRequest, userId: string): Promise<TournamentParticipant> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournament_participants')
      .insert([{
        tournament_id: registration.tournament_id,
        user_id: userId,
        player_name: registration.player_name,
        player_id: registration.player_id
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('User is already registered for this tournament');
      }
      throw new Error(`Failed to register for tournament: ${error.message}`);
    }

    return data;
  }

  // Get tournament participants
  static async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('registration_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get tournament participants: ${error.message}`);
    }

    return data || [];
  }

  // Update participant status
  static async updateParticipantStatus(participantId: string, status: string): Promise<TournamentParticipant> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournament_participants')
      .update({ status })
      .eq('id', participantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update participant status: ${error.message}`);
    }

    return data;
  }

  // Remove participant from tournament
  static async removeParticipant(participantId: string): Promise<void> {
    const supabase = getClientSupabaseClient();
    
    const { error } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('id', participantId);

    if (error) {
      throw new Error(`Failed to remove participant: ${error.message}`);
    }
  }
}

// Tournament Results Operations
export class ResultsDatabase {
  
  // Get tournament results
  static async getTournamentResults(tournamentId: string): Promise<TournamentResult[]> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournament_results')
      .select(`
        *,
        participant:tournament_participants(
          player_name,
          player_id
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('final_standing', { ascending: true, nullsFirst: false });

    if (error) {
      throw new Error(`Failed to get tournament results: ${error.message}`);
    }

    return data || [];
  }

  // Update tournament results
  static async updateTournamentResults(results: Partial<TournamentResult>[]): Promise<void> {
    const supabase = getClientSupabaseClient();
    
    const { error } = await supabase
      .from('tournament_results')
      .upsert(results);

    if (error) {
      throw new Error(`Failed to update tournament results: ${error.message}`);
    }
  }
}

// Tournament Files Operations
export class FilesDatabase {
  
  // Upload tournament file
  static async uploadTournamentFile(file: TournamentFile): Promise<TournamentFile> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournament_files')
      .insert([file])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upload tournament file: ${error.message}`);
    }

    return data;
  }

  // Get tournament files
  static async getTournamentFiles(tournamentId: string): Promise<TournamentFile[]> {
    const supabase = getClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('tournament_files')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get tournament files: ${error.message}`);
    }

    return data || [];
  }
}