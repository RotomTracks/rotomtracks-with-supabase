import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  UseRealTimeValidationOptions, 
  FieldState, 
  ValidationSummaryData 
} from './types';
import { VALIDATION_DEBOUNCE_MS } from './constants';

// Types are now imported from types.ts

export function useRealTimeValidation<T extends Record<string, any>>({
  validateFn,
  debounceMs = VALIDATION_DEBOUNCE_MS.DEFAULT,
  validateOnChange = true,
  validateOnBlur = true,
  showSuccessStates = true,
  enableProgressiveValidation = true,
}: UseRealTimeValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});
  const [validationSummary, setValidationSummary] = useState<ValidationSummaryData>({
    totalFields: 0,
    validFields: 0,
    invalidFields: 0,
    untouchedFields: 0,
    completionPercentage: 0,
    hasErrors: false,
    canSubmit: false,
  });
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Memoized validation summary calculation for better performance
  const updateValidationSummary = useCallback((currentErrors: Record<string, string>, currentFieldStates: Record<string, FieldState>, formData: T) => {
    const fieldNames = Object.keys(formData);
    const totalFields = fieldNames.length;
    
    let validFieldsCount = 0;
    let invalidFieldsCount = 0;
    let untouchedFieldsCount = 0;
    
    // Single loop for better performance
    for (const fieldName of fieldNames) {
      const fieldState = currentFieldStates[fieldName];
      const hasError = currentErrors[fieldName];
      const isTouched = fieldState?.hasBeenTouched || fieldState?.hasBeenBlurred;
      const hasValue = formData[fieldName] && String(formData[fieldName]).trim() !== '';
      
      if (!isTouched) {
        untouchedFieldsCount++;
      } else if (hasError) {
        invalidFieldsCount++;
      } else if (hasValue) {
        validFieldsCount++;
      }
    }
    
    const completionPercentage = totalFields > 0 ? Math.round((validFieldsCount / totalFields) * 100) : 0;
    const hasErrors = invalidFieldsCount > 0;
    const canSubmit = validFieldsCount === totalFields && !hasErrors;

    setValidationSummary({
      totalFields,
      validFields: validFieldsCount,
      invalidFields: invalidFieldsCount,
      untouchedFields: untouchedFieldsCount,
      completionPercentage,
      hasErrors,
      canSubmit,
    });
  }, []);

  const validateField = useCallback((fieldName: string, value: any, formData: T) => {
    // Set validating state
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValidating: true,
        lastValidatedValue: value
      }
    }));

    // Create updated form data with the new field value
    const updatedData = { ...formData, [fieldName]: value };
    const validation = validateFn(updatedData);
    
    const newErrors = {
      ...errors,
      [fieldName]: validation.errors[fieldName] || ''
    };

    const newFieldStates = {
      ...fieldStates,
      [fieldName]: {
        ...fieldStates[fieldName],
        isValid: !validation.errors[fieldName],
        isValidating: false,
        lastValidatedValue: value
      }
    };

    setErrors(newErrors);
    setFieldStates(newFieldStates);
    
    // Update validation summary
    updateValidationSummary(newErrors, newFieldStates, updatedData);

    return !validation.errors[fieldName];
  }, [validateFn, errors, fieldStates, updateValidationSummary]);

  const validateAllFields = useCallback((formData: T) => {
    const validation = validateFn(formData);
    
    // Update all field states to be touched and validated
    const newFieldStates: Record<string, FieldState> = {};
    Object.keys(formData).forEach(fieldName => {
      newFieldStates[fieldName] = {
        ...fieldStates[fieldName],
        hasBeenTouched: true,
        hasBeenBlurred: true,
        isValid: !validation.errors[fieldName],
        isValidating: false,
        lastValidatedValue: formData[fieldName]
      };
    });
    
    setErrors(validation.errors);
    setFieldStates(prev => ({ ...prev, ...newFieldStates }));
    
    // Update validation summary
    updateValidationSummary(validation.errors, { ...fieldStates, ...newFieldStates }, formData);
    
    return validation;
  }, [validateFn, fieldStates, updateValidationSummary]);

  const handleFieldChange = useCallback((fieldName: string, value: any, formData: T) => {
    // Mark field as touched
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        hasBeenTouched: true,
        isValid: prev[fieldName]?.isValid ?? true,
        isValidating: false
      }
    }));

    if (validateOnChange && enableProgressiveValidation) {
      // Clear existing timeout for this field
      if (debounceTimeouts.current[fieldName]) {
        clearTimeout(debounceTimeouts.current[fieldName]);
      }

      // Progressive validation: validate immediately if field has been interacted with before
      const fieldState = fieldStates[fieldName];
      const shouldValidateImmediately = fieldState?.hasBeenTouched || fieldState?.hasBeenBlurred;
      
      if (shouldValidateImmediately) {
        // Show validating state immediately for better UX
        setFieldStates(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            isValidating: true
          }
        }));

        debounceTimeouts.current[fieldName] = setTimeout(() => {
          validateField(fieldName, value, formData);
        }, debounceMs);
      } else {
        // For first-time interaction, validate with longer delay
        debounceTimeouts.current[fieldName] = setTimeout(() => {
          validateField(fieldName, value, formData);
        }, debounceMs * 2);
      }
    }
  }, [validateOnChange, enableProgressiveValidation, debounceMs, validateField, fieldStates]);

  const handleFieldBlur = useCallback((fieldName: string, value: any, formData: T) => {
    // Mark field as blurred
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        hasBeenBlurred: true,
        hasBeenTouched: true,
        isValid: prev[fieldName]?.isValid ?? true,
        isValidating: false
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
    // Show success if field has been touched/blurred, has no error, is valid, and not currently validating
    return showSuccessStates &&
           (fieldState?.hasBeenTouched || fieldState?.hasBeenBlurred) && 
           !hasError && 
           fieldState?.isValid &&
           !fieldState?.isValidating;
  }, [errors, fieldStates, showSuccessStates]);

  const isFieldValidating = useCallback((fieldName: string) => {
    return fieldStates[fieldName]?.isValidating ?? false;
  }, [fieldStates]);

  const isFieldTouched = useCallback((fieldName: string) => {
    return fieldStates[fieldName]?.hasBeenTouched ?? false;
  }, [fieldStates]);

  const hasAnyErrors = Object.values(errors).some(error => error !== '');

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    Object.values(debounceTimeouts.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    debounceTimeouts.current = {};
  }, []);

  // Cleanup effect
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    errors,
    fieldStates,
    validationSummary,
    validateField,
    validateAllFields,
    handleFieldChange,
    handleFieldBlur,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    getFieldSuccess,
    isFieldTouched,
    isFieldValidating,
    hasAnyErrors,
    cleanup,
  };
}