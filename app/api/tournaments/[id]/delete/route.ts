import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: tournamentId } = await params;

    // First, verify that the user is the organizer of this tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, organizer_id, name')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Check user profile and organizer request status
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_role, organization_name')
      .eq('user_id', user.id)
      .single();

    const { data: organizerRequest } = await supabase
      .from('organizer_requests')
      .select('status, organization_name')
      .eq('user_id', user.id)
      .single();

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own tournaments' },
        { status: 403 }
      );
    }

    // Get participants to notify them
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select(`
        user_id,
        player_name,
        player_id
      `)
      .eq('tournament_id', tournamentId);

    if (participantsError) {
      // Log error but continue with deletion
    }

    // Delete tournament (this will cascade delete participants due to foreign key constraints)
    let deleteError: any = null;
    let deletionSuccessful = false;
    
    // Try to delete with regular client first
    const { error: regularDeleteError, data: regularDeletedData } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)
      .eq('organizer_id', user.id)
      .select('id');

    if (regularDeletedData && regularDeletedData.length > 0) {
      // Regular deletion was successful
      deleteError = regularDeleteError;
      deletionSuccessful = true;
    } else {
      // Regular deletion failed, try service role as fallback
      const { data: tournamentExists } = await supabase
        .from('tournaments')
        .select('id, organizer_id, name')
        .eq('id', tournamentId)
        .single();
        
      if (tournamentExists) {
        // Check if user has admin role or approved organizer status
        const isAdmin = userProfile?.user_role === 'admin';
        const hasApprovedRequest = organizerRequest?.status === 'approved';
        
        if (isAdmin || hasApprovedRequest) {
          // Try service role deletion
          const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL || 
                             process.env.NEXT_PUBLIC_API_URL || 
                             process.env.NEXT_PUBLIC_SUPABASE_URL;
          const serviceRoleKey = process.env.SERVER_AUTH || 
                                process.env.API_SECRET || 
                                process.env.DATABASE_SERVICE_KEY || 
                                process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (supabaseUrl && serviceRoleKey) {
            // Service role available, use it
            const { createClient: createServiceClient } = await import('@supabase/supabase-js');
            const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey);
            
            const { error: serviceDeleteError, data: serviceDeletedData } = await serviceSupabase
              .from('tournaments')
              .delete()
              .eq('id', tournamentId)
              .eq('organizer_id', user.id)
              .select('id');
            
            if (serviceDeleteError) {
              deleteError = serviceDeleteError;
            } else if (serviceDeletedData && serviceDeletedData.length > 0) {
              deletionSuccessful = true;
              deleteError = null;
            } else {
              deleteError = new Error('Service role could not delete tournament');
            }
          } else {
            // No service role available, try admin regular deletion
            if (isAdmin) {
              const { error: adminDeleteError, data: adminDeletedData } = await supabase
                .from('tournaments')
                .delete()
                .eq('id', tournamentId)
                .eq('organizer_id', user.id)
                .select('id');
              
              if (adminDeleteError) {
                deleteError = adminDeleteError;
              } else if (adminDeletedData && adminDeletedData.length > 0) {
                deletionSuccessful = true;
                deleteError = null;
              } else {
                deleteError = new Error('RLS policy blocking deletion even for admin user - service role required');
              }
            } else {
              deleteError = new Error('RLS policy blocking deletion - service role not available');
            }
          }
        } else {
          deleteError = new Error('Insufficient permissions to delete tournament');
        }
      } else {
        deleteError = new Error('Tournament not found');
      }
    }

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete tournament' },
        { status: 500 }
      );
    }

    if (!deletionSuccessful) {
      return NextResponse.json(
        { error: 'Tournament not found or no permission to delete' },
        { status: 404 }
      );
    }

    // TODO: Send notification emails to participants
    // This would be implemented with your email service (e.g., Resend, SendGrid, etc.)
    if (participants && participants.length > 0) {
      // Here you would implement the email notification logic
      // await sendTournamentDeletedNotification(participants, tournament);
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament deleted successfully',
      deletedParticipants: participants?.length || 0
    });

  } catch (error) {
    console.error('Error in delete tournament API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
