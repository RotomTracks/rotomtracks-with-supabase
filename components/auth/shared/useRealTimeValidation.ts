import { useState, useCallback, useRef } from 'react';
import { ValidationResult } from '@/lib/utils/validation';

interface UseRealTimeValidationOptions<T> {
  validateFn: (data: T) => ValidationResult;
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FieldState {
  hasBeenTouched: boolean;
  hasBeenBlurred: boolean;
  isValid: boolean;
}

export function useRealTimeValidation<T extends Record<string, any>>({
  validateFn,
  debounceMs = 300,
  validateOnChange = true,
  validateOnBlur = true,
}: UseRealTimeValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const validateField = useCallback((fieldName: string, value: any, formData: T) => {
    // Create updated form data with the new field value
    const updatedData = { ...formData, [fieldName]: value };
    const validation = validateFn(updatedData);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.errors[fieldName] || ''
    }));

    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValid: !validation.errors[fieldName]
      }
    }));

    return !validation.errors[fieldName];
  }, [validateFn]);

  const validateAllFields = useCallback((formData: T) => {
    const validation = validateFn(formData);
    setErrors(validation.errors);
    
    // Update all field states
    const newFieldStates: Record<string, FieldState> = {};
    Object.keys(formData).forEach(fieldName => {
      newFieldStates[fieldName] = {
        ...fieldStates[fieldName],
        isValid: !validation.errors[fieldName]
      };
    });
    setFieldStates(prev => ({ ...prev, ...newFieldStates }));
    
    return validation;
  }, [validateFn, fieldStates]);

  const handleFieldChange = useCallback((fieldName: string, value: any, formData: T) => {
    // Mark field as touched
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        hasBeenTouched: true,
        isValid: prev[fieldName]?.isValid ?? true
      }
    }));

    if (validateOnChange) {
      // Clear existing timeout for this field
      if (debounceTimeouts.current[fieldName]) {
        clearTimeout(debounceTimeouts.current[fieldName]);
      }

      // Only validate if field has been touched or blurred before
      const fieldState = fieldStates[fieldName];
      if (fieldState?.hasBeenTouched || fieldState?.hasBeenBlurred) {
        debounceTimeouts.current[fieldName] = setTimeout(() => {
          validateField(fieldName, value, formData);
        }, debounceMs);
      }
    }
  }, [validateOnChange, debounceMs, validateField, fieldStates]);

  const handleFieldBlur = useCallback((fieldName: string, value: any, formData: T) => {
    // Mark field as blurred
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        hasBeenBlurred: true,
        hasBeenTouched: true,
        isValid: prev[fieldName]?.isValid ?? true
      }
    }));

    if (validateOnBlur) {
      // Clear any pending debounced validation
      if (debounceTimeouts.current[fieldName]) {
        clearTimeout(debounceTimeouts.current[fieldName]);
      }
      
      // Validate immediately on blur
      validateField(fieldName, value, formData);
    }
  }, [validateOnBlur, validateField]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    const fieldState = fieldStates[fieldName];
    // Only show error if field has been touched or blurred
    if (fieldState?.hasBeenTouched || fieldState?.hasBeenBlurred) {
      return errors[fieldName] || '';
    }
    return '';
  }, [errors, fieldStates]);

  const getFieldSuccess = useCallback((fieldName: string) => {
    const fieldState = fieldStates[fieldName];
    const hasError = errors[fieldName];
    // Show success if field has been touched/blurred, has no error, and has content
    return (fieldState?.hasBeenTouched || fieldState?.hasBeenBlurred) && 
           !hasError && 
           fieldState?.isValid;
  }, [errors, fieldStates]);

  const isFieldTouched = useCallback((fieldName: string) => {
    return fieldStates[fieldName]?.hasBeenTouched ?? false;
  }, [fieldStates]);

  const hasAnyErrors = Object.values(errors).some(error => error !== '');

  return {
    errors,
    fieldStates,
    validateField,
    validateAllFields,
    handleFieldChange,
    handleFieldBlur,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    getFieldSuccess,
    isFieldTouched,
    hasAnyErrors,
  };
}