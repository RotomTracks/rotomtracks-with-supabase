# Tournament System Consistency Guide

## Overview

This guide documents the consistent patterns, utilities, and best practices implemented across the tournament management system. All components and API routes now use centralized utilities for formatting, status management, and error handling.

## Architecture Overview

The system is organized into several key utility modules:

- **TournamentStatusManager**: Centralized status handling and translations
- **useTournamentFormatting**: React hook for date/time formatting
- **API Error Handler**: Consistent error responses across all API routes
- **API Response Formatter**: Standardized success response formatting
- **Tournament Constants**: Configuration values and limits

## Error Handling

### Error Codes

All API errors use the standardized `ErrorCodes` enum defined in `lib/types/tournament.ts`:

```typescript
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
```

### Error Response Format

All error responses follow this consistent structure:

```typescript
interface APIErrorResponse {
  error: string;           // Error code (from ErrorCodes enum)
  message: string;         // Human-readable message in Spanish
  code: ErrorCodes;        // Same as error field
  details?: any;           // Additional error context
  field?: string;          // Field that caused the error (for validation)
  timestamp: string;       // ISO timestamp
  request_id?: string;     // Unique request identifier
}
```

### Error Handling Utilities

#### `createErrorResponse()`
Creates standardized error responses:

```typescript
import { createErrorResponse, ErrorCodes } from '@/lib/utils/api-error-handler';

return createErrorResponse(
  ErrorCodes.NOT_FOUND,
  'Torneo no encontrado',
  undefined,
  undefined,
  requestId
);
```

#### `handleSupabaseError()`
Handles Supabase database errors consistently:

```typescript
import { handleSupabaseError } from '@/lib/utils/api-error-handler';

if (error) {
  return handleSupabaseError(error, 'búsqueda de torneo', requestId);
}
```

#### `handleValidationError()`
Handles Zod validation errors:

```typescript
import { handleValidationError } from '@/lib/utils/api-error-handler';

try {
  const validatedData = schema.parse(body);
} catch (error) {
  if (error instanceof z.ZodError) {
    return handleValidationError(error, requestId);
  }
}
```

## Success Response Format

### Standard Response

```typescript
interface APIResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
  request_id?: string;
}
```

### Paginated Response

```typescript
interface PaginatedAPIResponse<T> {
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
```

## Response Formatting Utilities

### `createSuccessResponse()`
Creates standardized success responses:

```typescript
import { createSuccessResponse } from '@/lib/utils/api-response-formatter';

return createSuccessResponse(
  tournament,
  'Torneo creado exitosamente',
  201,
  requestId
);
```

### `createPaginatedResponse()`
Creates paginated responses:

```typescript
import { createPaginatedResponse } from '@/lib/utils/api-response-formatter';

return createPaginatedResponse(
  tournaments,
  total,
  page,
  limit,
  'Torneos obtenidos exitosamente',
  requestId
);
```

## Authentication and Authorization

### `validateAuthentication()`
Validates user authentication:

```typescript
import { validateAuthentication } from '@/lib/utils/api-error-handler';

const authResult = await validateAuthentication(supabase, requestId);
if (authResult instanceof NextResponse) {
  return authResult; // Error response
}
const { user } = authResult;
```

### `validateUserRole()`
Validates user role for role-based operations:

```typescript
import { validateUserRole } from '@/lib/utils/api-error-handler';

const roleResult = await validateUserRole(supabase, user.id, 'organizer', requestId);
if (roleResult instanceof NextResponse) {
  return roleResult; // Error response
}
```

### `validateTournamentOwnership()`
Validates tournament ownership for organizer-only operations:

```typescript
import { validateTournamentOwnership } from '@/lib/utils/api-error-handler';

const ownershipResult = await validateTournamentOwnership(supabase, tournamentId, user.id, requestId);
if (ownershipResult instanceof NextResponse) {
  return ownershipResult; // Error response
}
const { tournament } = ownershipResult;
```

## Error Handling Wrapper

### `withErrorHandling()`
Wraps API handlers with consistent error handling:

```typescript
import { withErrorHandling } from '@/lib/utils/api-error-handler';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Your API logic here
  // Automatic error handling for unhandled exceptions
});
```

## Data Formatting

### Tournament Formatting
All tournament responses use consistent formatting:

```typescript
import { formatTournamentResponse, formatTournamentWithOrganizerResponse } from '@/lib/utils/api-response-formatter';

// Format single tournament
const formatted = formatTournamentResponse(tournament);

// Format tournament with organizer info
const withOrganizer = formatTournamentWithOrganizerResponse(tournament);
```

### Participant Formatting
All participant responses use consistent formatting:

```typescript
import { formatParticipantResponse } from '@/lib/utils/api-response-formatter';

const formatted = formatParticipantResponse(participant);
```

## Request ID Generation

All API responses include a unique request ID for tracking:

```typescript
import { generateRequestId } from '@/lib/utils/api-error-handler';

const requestId = generateRequestId(); // Format: req_timestamp_randomstring
```

## Validation Utilities

### Pagination Parameters
```typescript
import { validatePaginationParams } from '@/lib/utils/api-response-formatter';

const { page, limit, offset } = validatePaginationParams(searchParams);
```

### Search Parameters
```typescript
import { validateSearchParams } from '@/lib/utils/api-response-formatter';

const searchFilters = validateSearchParams(searchParams);
```

## Best Practices

1. **Always use error codes**: Use the `ErrorCodes` enum instead of string literals
2. **Consistent messages**: Error messages should be in Spanish and user-friendly
3. **Include context**: Add relevant details to error responses for debugging
4. **Request tracking**: Always include request IDs for error tracking
5. **Validation**: Use the validation utilities for consistent parameter handling
6. **Authentication**: Use the authentication utilities for consistent auth checks
7. **Response formatting**: Use the formatting utilities for consistent data structure

## Migration Notes

When updating existing API routes:

1. Import the error handling utilities
2. Replace manual error responses with utility functions
3. Use `withErrorHandling()` wrapper for automatic exception handling
4. Update response formatting to use the new utilities
5. Add request ID generation
6. Update TypeScript interfaces to use the new response types

## Testing

The error handling utilities include comprehensive tests in `lib/utils/__tests__/api-error-handler.test.ts` to ensure consistency and reliability.