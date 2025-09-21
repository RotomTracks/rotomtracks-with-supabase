/**
 * @fileoverview Admin Individual Organizer Request API endpoints
 * 
 * This module provides admin-only API endpoints for managing individual organizer requests.
 * Admins can view detailed request information and update request status.
 * 
 * @version 1.0.0
 * @author RotomTracks Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  AdminOrganizerRequest, 
  OrganizerRequestStatus, 
  UpdateOrganizerRequestPayload,
  AdminActionType,
  UserRole,
  ErrorCodes
} from '@/lib/types/tournament';
import {
  withErrorHandling,
  generateRequestId,
  handleSupabaseError,
  createErrorResponse,
  validateAuthentication,
  validateAdminRole
} from '@/lib/utils/api-error-handler';

/**
 * Standard API response format for individual admin organizer request
 */
export interface AdminOrganizerRequestResponse {
  data: AdminOrganizerRequest;
  message: string;
  timestamp: string;
  request_id: string;
}

/**
 * GET /api/admin/organizer-requests/[id]
 * 
 * Retrieves detailed information for a specific organizer request including review history.
 * 
 * @route GET /api/admin/organizer-requests/[id]
 * @access Admin only
 * @param {string} id - The organizer request ID
 * @returns {AdminOrganizerRequestResponse} Detailed organizer request information
 * 
 * @throws {401} Unauthorized - User not authenticated
 * @throws {403} Forbidden - User is not an admin
 * @throws {404} Not Found - Organizer request not found
 * @throws {500} Internal Server Error - Database or server error
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { id } = await params;

  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  // Validate admin role
  const adminResult = await validateAdminRole(supabase, user.id as string, requestId);
  if (adminResult instanceof NextResponse) {
    return adminResult;
  }

  try {
    // Get the organizer request with user profile information
    const { data: request, error } = await supabase
      .from('organizer_requests')
      .select(`
        *,
        user_profile:user_profiles!organizer_requests_user_id_fkey(
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse(
          ErrorCodes.NOT_FOUND,
          'Solicitud de organizador no encontrada',
          undefined,
          undefined,
          requestId
        );
      }
      return handleSupabaseError(error, 'búsqueda de solicitud de organizador', requestId);
    }

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(request.user_id);
    const userEmail = authUser.user?.email || '';

    // Get review history from admin activity log
    const { data: reviewHistory, error: historyError } = await supabase
      .from('admin_activity_log')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: false });

    if (historyError) {
      console.warn('Error fetching review history:', historyError);
    }

    // Format the response
    const formattedRequest: AdminOrganizerRequest = {
      ...request,
      user_profile: {
        first_name: request.user_profile?.first_name || '',
        last_name: request.user_profile?.last_name || '',
        email: userEmail,
        created_at: request.created_at
      },
      review_history: (reviewHistory || []).map(activity => ({
        id: activity.id,
        admin_id: activity.admin_id,
        admin_name: activity.admin_name,
        action: activity.action as AdminActionType,
        request_id: activity.request_id,
        organization_name: activity.organization_name,
        timestamp: activity.created_at,
        notes: activity.notes,
        previous_status: activity.previous_status as OrganizerRequestStatus,
        new_status: activity.new_status as OrganizerRequestStatus
      }))
    };

    const response: AdminOrganizerRequestResponse = {
      data: formattedRequest,
      message: 'Solicitud de organizador obtenida exitosamente',
      timestamp: new Date().toISOString(),
      request_id: requestId
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleSupabaseError(error, 'obtención de solicitud de organizador', requestId);
  }
});

/**
 * PATCH /api/admin/organizer-requests/[id]
 * 
 * Updates an organizer request status and adds admin notes.
 * When approving a request, automatically updates the user's role to ORGANIZER.
 * 
 * @route PATCH /api/admin/organizer-requests/[id]
 * @access Admin only
 * @param {string} id - The organizer request ID
 * @param {UpdateOrganizerRequestPayload} body - Update payload with status and notes
 * @returns {AdminOrganizerRequestResponse} Updated organizer request
 * 
 * @throws {401} Unauthorized - User not authenticated
 * @throws {403} Forbidden - User is not an admin
 * @throws {404} Not Found - Organizer request not found
 * @throws {400} Bad Request - Invalid request data
 * @throws {409} Conflict - Request already processed
 * @throws {500} Internal Server Error - Database or server error
 */
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { id } = await params;

  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  // Validate admin role
  const adminResult = await validateAdminRole(supabase, user.id as string, requestId);
  if (adminResult instanceof NextResponse) {
    return adminResult;
  }
  const { profile: adminProfile } = adminResult;

  // Parse request body
  const body: UpdateOrganizerRequestPayload = await request.json();
  const { status, admin_notes } = body;

  // Validate status
  if (!Object.values(OrganizerRequestStatus).includes(status)) {
    return createErrorResponse(
      ErrorCodes.INVALID_REQUEST_STATUS,
      'Estado de solicitud inválido',
      { validStatuses: Object.values(OrganizerRequestStatus) },
      'status',
      requestId
    );
  }

  // Validate admin notes length
  if (admin_notes && admin_notes.length > 1000) {
    return createErrorResponse(
      ErrorCodes.ADMIN_NOTES_TOO_LONG,
      'Las notas del administrador no pueden exceder 1000 caracteres',
      { maxLength: 1000, currentLength: admin_notes.length },
      'admin_notes',
      requestId
    );
  }

  try {
    // Get current request to check if it can be updated
    const { data: currentRequest, error: fetchError } = await supabase
      .from('organizer_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse(
          ErrorCodes.NOT_FOUND,
          'Solicitud de organizador no encontrada',
          undefined,
          undefined,
          requestId
        );
      }
      return handleSupabaseError(fetchError, 'búsqueda de solicitud de organizador', requestId);
    }

    const previousStatus = currentRequest.status as OrganizerRequestStatus;

    // Update the organizer request
    const updateData = {
      status,
      admin_notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: updatedRequest, error: updateError } = await supabase
      .from('organizer_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user_profile:user_profiles!organizer_requests_user_id_fkey(
          first_name,
          last_name
        )
      `)
      .single();

    if (updateError) {
      return handleSupabaseError(updateError, 'actualización de solicitud de organizador', requestId);
    }

    // If approved, update user role to ORGANIZER
    if (status === OrganizerRequestStatus.APPROVED && previousStatus !== OrganizerRequestStatus.APPROVED) {
      const { error: roleUpdateError } = await supabase
        .from('user_profiles')
        .update({ user_role: UserRole.ORGANIZER })
        .eq('user_id', updatedRequest.user_id);

      if (roleUpdateError) {
        console.error('Error updating user role:', roleUpdateError);
        // Don't fail the request, but log the error
      }
    }

    // Log admin activity
    const adminName = `${adminProfile.first_name || ''} ${adminProfile.last_name || ''}`.trim() || 'Admin';
    const activityData = {
      admin_id: user.id,
      admin_name: adminName,
      action: status === previousStatus ? AdminActionType.NOTES_ADDED : AdminActionType.STATUS_CHANGED,
      request_id: id,
      organization_name: updatedRequest.organization_name,
      notes: admin_notes,
      previous_status: previousStatus,
      new_status: status
    };

    const { error: activityError } = await supabase
      .from('admin_activity_log')
      .insert([activityData]);

    if (activityError) {
      console.error('Error logging admin activity:', activityError);
      // Don't fail the request, but log the error
    }

    // Get user email for response
    const { data: authUser } = await supabase.auth.admin.getUserById(updatedRequest.user_id);
    const userEmail = authUser.user?.email || '';

    // Format response
    const formattedRequest: AdminOrganizerRequest = {
      ...updatedRequest,
      user_profile: {
        first_name: updatedRequest.user_profile?.first_name || '',
        last_name: updatedRequest.user_profile?.last_name || '',
        email: userEmail,
        created_at: updatedRequest.created_at
      },
      review_history: [] // Will be fetched separately if needed
    };

    const response: AdminOrganizerRequestResponse = {
      data: formattedRequest,
      message: `Solicitud de organizador ${status === OrganizerRequestStatus.APPROVED ? 'aprobada' : 
                status === OrganizerRequestStatus.REJECTED ? 'rechazada' : 'actualizada'} exitosamente`,
      timestamp: new Date().toISOString(),
      request_id: requestId
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleSupabaseError(error, 'actualización de solicitud de organizador', requestId);
  }
});