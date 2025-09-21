/**
 * @fileoverview Admin Organizer Requests API endpoints
 * 
 * This module provides admin-only API endpoints for managing organizer access requests.
 * Admins can view all requests, filter them, and get detailed statistics.
 * 
 * @version 1.0.0
 * @author RotomTracks Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AdminOrganizerRequest, OrganizerRequestStatus, ErrorCodes } from '@/lib/types/tournament';
import {
  withErrorHandling,
  generateRequestId,
  handleSupabaseError,
  createErrorResponse,
  validateAuthentication,
  validateAdminRole
} from '@/lib/utils/api-error-handler';

/**
 * Standard API response format for admin organizer requests list
 */
export interface AdminOrganizerRequestsResponse {
  data: AdminOrganizerRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: OrganizerRequestStatus;
    search?: string;
  };
  message: string;
  timestamp: string;
  request_id: string;
}

/**
 * GET /api/admin/organizer-requests
 * 
 * Retrieves all organizer requests with filtering and pagination for admin users.
 * 
 * @route GET /api/admin/organizer-requests
 * @access Admin only
 * @param {string} status - Filter by request status (pending, approved, rejected, under_review)
 * @param {string} search - Search by organization name or applicant name
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of items per page (default: 20, max: 100)
 * @returns {AdminOrganizerRequestsResponse} Paginated list of organizer requests
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/admin/organizer-requests?status=pending&page=1&limit=20', {
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * const result = await response.json();
 * ```
 * 
 * @throws {401} Unauthorized - User not authenticated
 * @throws {403} Forbidden - User is not an admin
 * @throws {400} Bad Request - Invalid query parameters
 * @throws {500} Internal Server Error - Database or server error
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

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

  // Parse and validate query parameters
  const status = searchParams.get('status') as OrganizerRequestStatus | null;
  const search = searchParams.get('search') || undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  // Validate status parameter if provided
  if (status && !Object.values(OrganizerRequestStatus).includes(status)) {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid status parameter. Must be one of: pending, approved, rejected, under_review',
      { validStatuses: Object.values(OrganizerRequestStatus) },
      'status',
      requestId
    );
  }

  try {
    // Build the query with joins to get user profile information
    let query = supabase
      .from('organizer_requests')
      .select(`
        *,
        user_profile:user_profiles!organizer_requests_user_id_fkey(
          first_name,
          last_name,
          email:user_id
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 2) {
        query = query.or(`organization_name.ilike.%${searchTerm}%`);
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error, count } = await query;

    if (error) {
      return handleSupabaseError(error, 'búsqueda de solicitudes de organizador', requestId);
    }

    // Get user emails for the requests (since we can't directly join with auth.users)
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userEmailMap = new Map(
      authUsers.users.map(user => [user.id, user.email])
    );

    // Format the response data
    const formattedRequests: AdminOrganizerRequest[] = (requests || []).map(request => ({
      ...request,
      user_profile: {
        first_name: request.user_profile?.first_name || '',
        last_name: request.user_profile?.last_name || '',
        email: userEmailMap.get(request.user_id) || '',
        created_at: request.created_at
      },
      review_history: [] // Will be populated in individual request view
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    const response: AdminOrganizerRequestsResponse = {
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      },
      filters: {
        ...(status && { status }),
        ...(search && { search })
      },
      message: `Se encontraron ${count || 0} solicitudes de organizador`,
      timestamp: new Date().toISOString(),
      request_id: requestId
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleSupabaseError(error, 'obtención de solicitudes de organizador', requestId);
  }
});