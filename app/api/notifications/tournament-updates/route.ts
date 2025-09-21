import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notifications/tournament-updates - Get tournament notifications for organizers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's tournaments
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, current_players, max_players, registration_open, status')
      .eq('organizer_id', user.id);

    if (tournamentsError) {
      console.error('Error fetching tournaments:', tournamentsError);
      return NextResponse.json(
        { error: 'Failed to fetch tournaments' },
        { status: 500 }
      );
    }

    const notifications = [];

    // Generate notifications for each tournament
    for (const tournament of tournaments || []) {
      // Check for capacity reached
      if (tournament.max_players && tournament.current_players >= tournament.max_players) {
        notifications.push({
          id: `capacity-${tournament.id}`,
          type: 'capacity_reached',
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          message: `${tournament.name} has reached maximum capacity (${tournament.current_players}/${tournament.max_players})`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      // Check for tournaments nearing capacity (90%)
      if (tournament.max_players && tournament.current_players >= tournament.max_players * 0.9 && tournament.current_players < tournament.max_players) {
        notifications.push({
          id: `near-capacity-${tournament.id}`,
          type: 'near_capacity',
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          message: `${tournament.name} is nearing capacity (${tournament.current_players}/${tournament.max_players})`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      // Get recent registrations (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: recentRegistrations, error: registrationsError } = await supabase
        .from('tournament_participants')
        .select('id, player_name, registration_date, status')
        .eq('tournament_id', tournament.id)
        .gte('registration_date', oneHourAgo)
        .order('registration_date', { ascending: false });

      if (!registrationsError && recentRegistrations && recentRegistrations.length > 0) {
        // Group recent registrations
        if (recentRegistrations.length === 1) {
          notifications.push({
            id: `registration-${recentRegistrations[0].id}`,
            type: 'registration',
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            message: `${recentRegistrations[0].player_name} registered for ${tournament.name}`,
            timestamp: recentRegistrations[0].registration_date,
            read: false
          });
        } else {
          notifications.push({
            id: `registrations-${tournament.id}-${Date.now()}`,
            type: 'registration',
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            message: `${recentRegistrations.length} new registrations for ${tournament.name}`,
            timestamp: recentRegistrations[0].registration_date,
            read: false
          });
        }
      }

      // Check for status changes
      if (tournament.status === 'ongoing') {
        notifications.push({
          id: `status-ongoing-${tournament.id}`,
          type: 'status_change',
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          message: `${tournament.name} is now ongoing`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    }

    // Sort notifications by timestamp (most recent first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      notifications: notifications.slice(0, 50) // Limit to 50 most recent
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error fetching tournament notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}