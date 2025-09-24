/**
 * @fileoverview Admin Dashboard API endpoint
 * 
 * This module provides admin dashboard metrics and statistics for the admin panel.
 * 
 * @version 1.0.0
 * @author RotomTracks Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboardMetrics, AdminActivity, AdminActionType, OrganizerRequestStatus } from '@/lib/types/tournament';
import {
  withErrorHandling,
  generateRequestId,
  handleSupabaseError,
  validateAuthentication,
  validateAdminRole
} from '@/lib/utils/api-error-handler';

/**
 * Standard API response format for admin dashboard
 */
export interface AdminDashboardResponse {
  data: AdminDashboardMetrics;
  message: string;
  timestamp: string;
  request_id: string;
}

/**
 * GET /api/admin/dashboard
 * 
 * Retrieves admin dashboard metrics including request counts and recent activity.
 * 
 * @route GET /api/admin/dashboard
 * @access Admin only
 * @returns {AdminDashboardResponse} Dashboard metrics and recent activity
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/admin/dashboard', {
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * const result = await response.json();
 * ```
 * 
 * @throws {401} Unauthorized - User not authenticated
 * @throws {403} Forbidden - User is not an admin
 * @throws {500} Internal Server Error - Database or server error
 */
export const GET = withErrorHandling(async () => {
  const requestId = generateRequestId();
  const supabase = await createClient();

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
    // Get total request counts by status
    const { data: requestCounts, error: countsError } = await supabase
      .from('organizer_requests')
      .select('status')
      .order('created_at', { ascending: false });

    if (countsError) {
      console.warn('Error fetching request counts:', countsError);
      // If table doesn't exist, return empty data instead of error
      if (countsError.code === 'PGRST116' || countsError.message?.includes('relation') || countsError.message?.includes('does not exist')) {
        const dashboardMetrics: AdminDashboardMetrics = {
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          underReviewRequests: 0,
          recentActivity: []
        };

        const response: AdminDashboardResponse = {
          data: dashboardMetrics,
          message: 'No hay datos de solicitudes disponibles', // TODO: Implement server-side translations
          timestamp: new Date().toISOString(),
          request_id: requestId
        };

        return NextResponse.json(response, { status: 200 });
      }
      return handleSupabaseError(countsError, 'obtención de estadísticas de solicitudes', requestId);
    }

    // Calculate metrics
    const totalRequests = requestCounts?.length || 0;
    const pendingRequests = requestCounts?.filter(r => r.status === OrganizerRequestStatus.PENDING).length || 0;
    const approvedRequests = requestCounts?.filter(r => r.status === OrganizerRequestStatus.APPROVED).length || 0;
    const rejectedRequests = requestCounts?.filter(r => r.status === OrganizerRequestStatus.REJECTED).length || 0;
    const underReviewRequests = requestCounts?.filter(r => r.status === OrganizerRequestStatus.UNDER_REVIEW).length || 0;

    // Get recent admin activity (last 10 activities)
    const { data: recentActivity, error: activityError } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) {
      console.warn('Error fetching recent activity:', activityError);
      // If table doesn't exist, continue with empty activity
      if (activityError.code === 'PGRST116' || activityError.message?.includes('relation') || activityError.message?.includes('does not exist')) {
      }
    }

    // Format recent activity
    const formattedActivity: AdminActivity[] = (recentActivity || []).map(activity => ({
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
    }));

    // Prepare dashboard metrics
    const dashboardMetrics: AdminDashboardMetrics = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      underReviewRequests,
      recentActivity: formattedActivity
    };

    const response: AdminDashboardResponse = {
      data: dashboardMetrics,
      message: 'Métricas del panel de administración obtenidas exitosamente', // TODO: Implement server-side translations
      timestamp: new Date().toISOString(),
      request_id: requestId
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleSupabaseError(error, 'obtención de métricas del panel de administración', requestId);
  }
});