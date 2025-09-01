import { useEffect, useRef } from 'react';

interface UseFormAccessibilityOptions {
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export function useFormAccessibility({ errors, isSubmitting }: UseFormAccessibilityOptions) {
  const previousErrorsRef = useRef<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Focus management for errors
  useEffect(() => {
    const currentErrors = Object.keys(errors);
    const previousErrors = Object.keys(previousErrorsRef.current);
    
    // If new errors appeared, focus on the first error field
    if (currentErrors.length > 0 && previousErrors.length === 0) {
      const firstErrorField = currentErrors[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.focus();
        // Scroll into view if needed
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    previousErrorsRef.current = errors;
  }, [errors]);

  // Prevent form submission with Enter key when there are errors
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && Object.keys(errors).length > 0) {
        event.preventDefault();
      }
    };

    const form = formRef.current;
    if (form) {
      form.addEventListener('keydown', handleKeyDown);
      return () => form.removeEventListener('keydown', handleKeyDown);
    }
  }, [errors]);

  // Announce form submission status to screen readers
  const getAriaLiveMessage = () => {
    if (isSubmitting) {
      return 'Enviando formulario...';
    }
    if (Object.keys(errors).length > 0) {
      return `Formulario contiene ${Object.keys(errors).length} error${Object.keys(errors).length > 1 ? 'es' : ''}`;
    }
    return '';
  };

  return {
    formRef,
    ariaLiveMessage: getAriaLiveMessage(),
  };
}