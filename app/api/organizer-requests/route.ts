/**
 * @fileoverview Organizer Request API endpoints
 * 
 * This module provides API endpoints for managing organizer access requests.
 * Users can submit requests to become tournament organizers and check their request status.
 * 
 * @version 1.0.0
 * @author RotomTracks Development Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateOrganizerRequest, ErrorCodes, OrganizerRequest } from '@/lib/types/tournament';
import { CreateOrganizerRequestSchema } from '@/lib/validations/tournament';
import { z } from 'zod';
import {
  withErrorHandling,
  generateRequestId,
  handleValidationError,
  handleSupabaseError,
  createErrorResponse,
  validateAuthentication
} from '@/lib/utils/api-error-handler';

/**
 * Standard API response format for organizer requests
 */
export interface OrganizerRequestAPIResponse {
  data: OrganizerRequest;
  message: string;
  timestamp: string;
  request_id: string;
}

/**
 * GET /api/organizer-requests
 * 
 * Retrieves the current authenticated user's most recent organizer request status.
 * 
 * @route GET /api/organizer-requests
 * @access Private - Requires authentication
 * @returns {OrganizerRequestAPIResponse} The user's organizer request data
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/organizer-requests', {
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * const result = await response.json();
 * ```
 * 
 * @throws {401} Unauthorized - User not authenticated
 * @throws {404} Not Found - No organizer request found for user
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

  // Fetch user's most recent organizer request
  const { data: organizerRequest, error } = await supabase
    .from('organizer_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No request found
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'No se encontró ninguna solicitud de organizador',
        undefined,
        undefined,
        requestId
      );
    }
    return handleSupabaseError(error, 'búsqueda de solicitud de organizador', requestId);
  }

  return NextResponse.json({
    data: organizerRequest,
    message: 'Solicitud de organizador obtenida exitosamente',
    timestamp: new Date().toISOString(),
    request_id: requestId
  }, { status: 200 });
});

/**
 * POST /api/organizer-requests
 * 
 * Submits a new organizer access request for the authenticated user.
 * 
 * @route POST /api/organizer-requests
 * @access Private - Requires authentication
 * @param {CreateOrganizerRequest} body - The organizer request data
 * @returns {OrganizerRequestAPIResponse} The created organizer request data
 * 
 * @example
 * ```typescript
 * const requestData = {
 *   organization_name: "My Pokemon League",
 *   business_email: "contact@myleague.com",
 *   phone_number: "+1234567890",
 *   address: "123 Main St, City, State",
 *   pokemon_league_url: "https://pokemon.com/league/my-league",
 *   experience_description: "I have been organizing tournaments for 5 years..."
 * };
 * 
 * const response = await fetch('/api/organizer-requests', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(requestData)
 * });
 * const result = await response.json();
 * ```
 * 
 * @throws {400} Bad Request - Invalid request data or validation errors
 * @throws {401} Unauthorized - User not authenticated
 * @throws {409} Conflict - User already has an existing organizer request
 * @throws {500} Internal Server Error - Database or server error
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const supabase = await createClient();

  // Validate authentication
  const authResult = await validateAuthentication(supabase, requestId);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  // Parse and validate request body
  const body = await request.json();
  let validatedData: CreateOrganizerRequest;
  
  try {
    validatedData = CreateOrganizerRequestSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error, requestId);
    }
    throw error;
  }

  // Check for existing request
  const { data: existingRequest, error: duplicateError } = await supabase
    .from('organizer_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .single();

  if (duplicateError && duplicateError.code !== 'PGRST116') {
    return handleSupabaseError(duplicateError, 'verificación de solicitud existente', requestId);
  }

  if (existingRequest) {
    return createErrorResponse(
      ErrorCodes.DUPLICATE_ORGANIZER_REQUEST,
      'Ya tienes una solicitud de organizador. Solo puedes tener una solicitud activa a la vez.',
      { existing_status: existingRequest.status },
      undefined,
      requestId
    );
  }

  // Create organizer request
  const requestData = {
    user_id: user.id,
    organization_name: validatedData.organization_name,
    business_email: validatedData.business_email || null,
    phone_number: validatedData.phone_number || null,
    address: validatedData.address || null,
    pokemon_league_url: validatedData.pokemon_league_url || null,
    experience_description: validatedData.experience_description || null,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: organizerRequest, error: createError } = await supabase
    .from('organizer_requests')
    .insert([requestData])
    .select()
    .single();

  if (createError) {
    return handleSupabaseError(createError, 'creación de solicitud de organizador', requestId);
  }

  return NextResponse.json({
    data: organizerRequest,
    message: 'Solicitud de organizador creada exitosamente',
    timestamp: new Date().toISOString(),
    request_id: requestId
  }, { status: 201 });
});