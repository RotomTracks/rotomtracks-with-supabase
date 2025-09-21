import { useEffect, useRef, useCallback } from 'react';
import type { UseFormAccessibilityOptions } from './types';

export function useFormAccessibility({ 
  errors, 
  isSubmitting, 
  enableKeyboardNavigation = true,
  enableErrorFocus = true 
}: UseFormAccessibilityOptions) {
  const previousErrorsRef = useRef<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  // Focus management for errors
  useEffect(() => {
    if (!enableErrorFocus) return;
    
    const currentErrors = Object.keys(errors);
    const previousErrors = Object.keys(previousErrorsRef.current);
    
    // If new errors appeared, focus on the first error field
    if (currentErrors.length > 0 && previousErrors.length === 0) {
      const firstErrorField = currentErrors[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        // Store the currently focused element
        lastFocusedElementRef.current = document.activeElement as HTMLElement;
        
        // Focus the error field with a slight delay for better UX
        setTimeout(() => {
          errorElement.focus();
          // Scroll into view if needed
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
    
    previousErrorsRef.current = errors;
  }, [errors, enableErrorFocus]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const form = formRef.current;
      if (!form) return;

      // Prevent form submission with Enter key when there are errors
      if (event.key === 'Enter' && Object.keys(errors).length > 0) {
        event.preventDefault();
        return;
      }

      // Enhanced keyboard navigation with Ctrl+Arrow keys
      if (event.ctrlKey) {
        const formElements = Array.from(form.querySelectorAll(
          'input, select, textarea, button'
        )) as HTMLElement[];
        const currentIndex = formElements.indexOf(event.target as HTMLElement);

        if (currentIndex !== -1) {
          let nextIndex = -1;

          switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
              nextIndex = (currentIndex + 1) % formElements.length;
              break;
            case 'ArrowUp':
            case 'ArrowLeft':
              nextIndex = currentIndex === 0 ? formElements.length - 1 : currentIndex - 1;
              break;
          }

          if (nextIndex !== -1) {
            event.preventDefault();
            formElements[nextIndex].focus();
          }
        }
      }
    };

    const form = formRef.current;
    if (form) {
      form.addEventListener('keydown', handleKeyDown);
      return () => form.removeEventListener('keydown', handleKeyDown);
    }
  }, [errors, enableKeyboardNavigation]);

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

  // Focus restoration utility
  const restoreFocus = useCallback(() => {
    if (lastFocusedElementRef.current) {
      lastFocusedElementRef.current.focus();
      lastFocusedElementRef.current = null;
    }
  }, []);

  // Form validation summary for screen readers
  const getValidationSummary = useCallback(() => {
    const errorCount = Object.keys(errors).length;
    if (errorCount === 0) return '';
    
    const errorFields = Object.keys(errors).join(', ');
    return `${errorCount} error${errorCount > 1 ? 'es' : ''} encontrado${errorCount > 1 ? 's' : ''} en los campos: ${errorFields}`;
  }, [errors]);

  return {
    formRef,
    ariaLiveMessage: getAriaLiveMessage(),
    validationSummary: getValidationSummary(),
    restoreFocus,
  };
}