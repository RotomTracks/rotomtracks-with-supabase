// Authentication component types
export interface ValidationSummary {
  totalFields: number;
  validFields: number;
  invalidFields: number;
  untouchedFields: number;
  completionPercentage: number;
  hasErrors: boolean;
  canSubmit: boolean;
}

export interface FieldState {
  hasBeenTouched: boolean;
  hasBeenBlurred: boolean;
  isValid: boolean;
  isValidating: boolean;
  lastValidatedValue?: any;
}

export interface ErrorSuggestion {
  text: string;
  action?: () => void;
  actionText?: string;
}

export interface UseRealTimeValidationOptions<T> {
  validateFn: (data: T) => ValidationResult;
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showSuccessStates?: boolean;
  enableProgressiveValidation?: boolean;
}

export interface UseFormAccessibilityOptions {
  errors: Record<string, string>;
  isSubmitting: boolean;
  enableKeyboardNavigation?: boolean;
  enableErrorFocus?: boolean;
}

export interface UseScreenReaderAnnouncementsOptions {
  politeness?: 'polite' | 'assertive';
  clearDelay?: number;
}

// Re-export validation types from utils
export type { ValidationResult } from '@/lib/utils/validation';