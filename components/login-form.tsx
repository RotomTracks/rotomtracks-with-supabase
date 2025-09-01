"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormCard, FormField, LoadingButton, ErrorMessage } from "@/components/auth/shared";
import { useFormAccessibility } from "@/components/auth/shared/useFormAccessibility";
import { useRealTimeValidation } from "@/components/auth/shared/useRealTimeValidation";
import { useTypedTranslation } from "@/lib/i18n";
import { validateLoginForm, type LoginFormData } from "@/lib/utils/validation";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { tAuth } = useTypedTranslation();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Real-time validation hook
  const {
    getFieldError,
    getFieldSuccess,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    clearAllErrors,
    hasAnyErrors
  } = useRealTimeValidation<LoginFormData>({
    validateFn: validateLoginForm,
    debounceMs: 500, // Slightly longer debounce for login
    validateOnChange: true,
    validateOnBlur: true,
  });

  const { formRef, ariaLiveMessage } = useFormAccessibility({
    errors: Object.fromEntries(
      Object.keys(formData).map(key => [key, getFieldError(key)])
    ),
    isSubmitting: isLoading,
  });

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Handle real-time validation
    handleFieldChange(field, value, newFormData);
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleInputBlur = (field: keyof LoginFormData) => {
    handleFieldBlur(field, formData[field], formData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    clearAllErrors();

    // Final validation before submission
    const validation = validateAllFields(formData);
    if (!validation.isValid) {
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        // Handle specific Supabase errors
        switch (error.message) {
          case 'Invalid login credentials':
            setGeneralError(tAuth('errors.invalidCredentials'));
            break;
          case 'Email not confirmed':
            setGeneralError(tAuth('errors.emailNotConfirmed'));
            break;
          case 'Too many requests':
            setGeneralError(tAuth('errors.tooManyRequests'));
            break;
          default:
            setGeneralError(error.message || tAuth('errors.generic'));
        }
        return;
      }
      
      // Check for custom redirect parameter, default to profile
      const redirectTo = searchParams.get('redirect') || '/profile';
      router.push(redirectTo);
    } catch (error: unknown) {
      setGeneralError(
        error instanceof Error 
          ? error.message 
          : tAuth('errors.networkError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FormCard
        title={tAuth('login.title')}
        description={tAuth('login.description')}
        className="max-w-md mx-auto"
      >
        <form 
          ref={formRef}
          onSubmit={handleLogin} 
          className="space-y-6"
          noValidate
          aria-label="Formulario de inicio de sesión"
        >
          {/* Screen reader announcement for form status */}
          <div 
            role="status" 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
          >
            {ariaLiveMessage}
            {generalError && `Error: ${generalError}`}
          </div>

          {generalError && (
            <ErrorMessage 
              message={generalError} 
              onDismiss={() => setGeneralError(null)}
            />
          )}
          
          <FormField
            id="email"
            label={tAuth('login.emailLabel')}
            type="email"
            placeholder={tAuth('login.emailPlaceholder')}
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            onBlur={() => handleInputBlur('email')}
            error={getFieldError('email')}
            success={getFieldSuccess('email')}
            required
            autoComplete="email"
            className="space-y-3"
            helpText={!formData.email && !getFieldError('email') ? tAuth('login.emailHelp') : undefined}
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tAuth('login.passwordLabel')}</span>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
                tabIndex={0}
              >
                {tAuth('login.forgotPassword')}
              </Link>
            </div>
            <FormField
              id="password"
              label=""
              type="password"
              placeholder={tAuth('login.passwordPlaceholder')}
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              onBlur={() => handleInputBlur('password')}
              error={getFieldError('password')}
              success={getFieldSuccess('password')}
              required
              autoComplete="current-password"
            />
          </div>
          
          <LoadingButton
            type="submit"
            className="w-full mt-6"
            loading={isLoading}
            loadingText={tAuth('login.loadingButton')}
            disabled={isLoading || hasAnyErrors || !formData.email || !formData.password}
            aria-describedby={generalError ? "login-error" : undefined}
          >
            {tAuth('login.submitButton')}
          </LoadingButton>
        </form>
        
        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            {tAuth('login.signUpLink')}{" "}
            <Link 
              href="/auth/sign-up" 
              className="text-primary underline-offset-4 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
              tabIndex={0}
            >
              {tAuth('login.signUpLinkText')}
            </Link>
          </div>
        </div>
      </FormCard>
    </div>
  );
}
