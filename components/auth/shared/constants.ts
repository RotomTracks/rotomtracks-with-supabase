// Authentication component constants

// Validation timing
export const VALIDATION_DEBOUNCE_MS = {
  DEFAULT: 300,
  LOGIN: 500,
  SIGNUP: 300,
  PASSWORD: 400,
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SUCCESS: 3000,
  SUCCESS_EXTENDED: 4000,
} as const;

// Form field sizes
export const FIELD_SIZES = {
  MIN_HEIGHT: 44, // Minimum touch target size
  ICON_SIZE: {
    SM: 16,
    MD: 20,
    LG: 24,
  },
} as const;

// Accessibility constants
export const A11Y = {
  SKIP_LINK_OFFSET: 16,
  FOCUS_RING_WIDTH: 2,
  MIN_CONTRAST_RATIO: 4.5,
  LARGE_TEXT_CONTRAST_RATIO: 3,
} as const;

// Error message types for contextual suggestions
export const ERROR_TYPES = {
  INVALID_CREDENTIALS: 'invalid login credentials',
  EMAIL_NOT_CONFIRMED: 'email not confirmed',
  TOO_MANY_REQUESTS: 'too many requests',
  NETWORK_ERROR: 'network',
  USER_EXISTS: 'user already registered',
  CONNECTION_ERROR: 'conexión',
} as const;

// Screen reader announcement delays
export const SR_ANNOUNCEMENT_DELAY = {
  SHORT: 1000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;