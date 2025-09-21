import { useState, useCallback } from 'react';
import { 
  validateLoginForm, 
  validateSignUpForm, 
  validatePasswordResetForm, 
  validateUpdatePasswordForm,
  type LoginFormData,
  type SignUpFormData,
  type PasswordResetFormData,
  type UpdatePasswordFormData,
  type ValidationResult
} from '@/lib/utils/validation';

type AuthFormType = 'login' | 'signup' | 'forgot-password' | 'update-password';

interface UseAuthValidationOptions<T> {
  formType: AuthFormType;
  debounceMs?: number;
}

export function useAuthValidation<T extends LoginFormData | SignUpFormData | PasswordResetFormData | UpdatePasswordFormData>(
  options: UseAuthValidationOptions<T>
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateForm = useCallback((data: T): ValidationResult => {
    switch (options.formType) {
      case 'login':
        return validateLoginForm(data as LoginFormData);
      case 'signup':
        return validateSignUpForm(data as SignUpFormData);
      case 'forgot-password':
        return validatePasswordResetForm(data as PasswordResetFormData);
      case 'update-password':
        return validateUpdatePasswordForm(data as UpdatePasswordFormData);
      default:
        return { isValid: false, errors: {} };
    }
  }, [options.formType]);

  const validateField = useCallback((fieldName: string, value: any, formData: T) => {
    setIsValidating(true);
    const result = validateForm(formData);
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.errors[fieldName] || ''
    }));
    setIsValidating(false);
    return !result.errors[fieldName];
  }, [validateForm]);

  const validateAllFields = useCallback((formData: T) => {
    const result = validateForm(formData);
    setErrors(result.errors);
    return result.isValid;
  }, [validateForm]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValidating,
    validateField,
    validateAllFields,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (fieldName: string) => errors[fieldName] || null
  };
}