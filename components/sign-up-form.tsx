"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserRole } from "@/lib/types/tournament";
import { FormCard, FormField, LoadingButton, ErrorMessage, ValidationSummary, SuccessAnimation, SkipLinks } from "@/components/auth/shared";
import { useRealTimeValidation } from "@/components/auth/shared/useRealTimeValidation";
import { useFormAccessibility } from "@/components/auth/shared/useFormAccessibility";
import { useTypedTranslation } from "@/lib/i18n";
import { validateSignUpForm, type SignUpFormData } from "@/lib/utils/validation";
import { cn } from "@/lib/utils";
import { User, Building2, Trophy, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
// Simple collapsible implementation will be inline

// Form section component for better organization
interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function FormSection({ title, icon, children, className }: FormSectionProps) {
  const sectionId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <fieldset className={cn("space-y-4", className)} aria-labelledby={`${sectionId}-title`}>
      <legend 
        id={`${sectionId}-title`}
        className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-2 w-full"
      >
        <span aria-hidden="true">{icon}</span>
        {title}
      </legend>
      <div className="space-y-4" role="group" aria-labelledby={`${sectionId}-title`}>
        {children}
      </div>
    </fieldset>
  );
}

// Role selection component
interface RoleSelectionProps {
  value: UserRole;
  onChange: (value: UserRole) => void;
  error?: string;
}

function RoleSelection({ value, onChange, error }: RoleSelectionProps) {
  const { tAuth, tAuthArray } = useTypedTranslation();
  const selectId = "user-role-select";
  const errorId = error ? `${selectId}-error` : undefined;
  
  return (
    <div className="space-y-3">
      <Label htmlFor={selectId} className="text-sm font-medium">
        {tAuth('signUp.userRoleLabel')}
        <span className="text-red-500 ml-1" aria-label="campo obligatorio">*</span>
      </Label>
      <Select
        value={value}
        onValueChange={(val: string) => onChange(val as UserRole)}
      >
        <SelectTrigger 
          id={selectId}
          className={cn(error && "border-red-500 focus-visible:ring-red-500")}
          aria-invalid={!!error}
          aria-describedby={errorId}
          aria-label="Seleccionar tipo de cuenta de usuario"
        >
          <SelectValue placeholder={tAuth('signUp.userRolePlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UserRole.PLAYER}>
            <div className="flex items-center gap-3 py-2">
              <Trophy className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <div className="text-left">
                <div className="font-medium">{String(tAuth('signUp.roles.player.label'))}</div>
                <div className="text-xs text-muted-foreground">{String(tAuth('signUp.roles.player.description'))}</div>
              </div>
            </div>
          </SelectItem>
          <SelectItem value={UserRole.ORGANIZER}>
            <div className="flex items-center gap-3 py-2">
              <Building2 className="w-5 h-5 text-green-600" aria-hidden="true" />
              <div className="text-left">
                <div className="font-medium">{String(tAuth('signUp.roles.organizer.label'))}</div>
                <div className="text-xs text-muted-foreground">{String(tAuth('signUp.roles.organizer.description'))}</div>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert" aria-live="polite">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { tAuth, tAuthArray } = useTypedTranslation();
  const [formData, setFormData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    playerId: "",
    birthYear: "",
    userRole: UserRole.PLAYER,
    organizationName: "",
    businessEmail: "",
    phoneNumber: "",
    address: "",
    pokemonLeagueUrl: "",
    experienceDescription: "",
  });
  
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOrganizerSectionOpen, setIsOrganizerSectionOpen] = useState(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>("");
  const router = useRouter();

  // Real-time validation hook
  const {
    getFieldError,
    getFieldSuccess,
    isFieldValidating,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    clearAllErrors,
    hasAnyErrors,
    validationSummary
  } = useRealTimeValidation<SignUpFormData>({
    validateFn: validateSignUpForm,
    debounceMs: 300,
    validateOnChange: true,
    validateOnBlur: true,
    showSuccessStates: true,
    enableProgressiveValidation: true,
  });

  const { formRef, ariaLiveMessage } = useFormAccessibility({
    errors: Object.fromEntries(
      Object.keys(formData).map(key => [key, getFieldError(key)])
    ),
    isSubmitting: isLoading,
  });

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Handle real-time validation
    handleFieldChange(field, value, newFormData);
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError(null);
    }

    // Auto-open organizer section when organizer role is selected
    if (field === 'userRole' && value === UserRole.ORGANIZER) {
      setIsOrganizerSectionOpen(true);
      setScreenReaderAnnouncement("Se han mostrado campos adicionales para organizadores");
      // Clear announcement after a delay
      setTimeout(() => setScreenReaderAnnouncement(""), 1000);
    } else if (field === 'userRole' && value === UserRole.PLAYER) {
      setIsOrganizerSectionOpen(false);
      setScreenReaderAnnouncement("Se han ocultado los campos de organizador");
      // Clear announcement after a delay
      setTimeout(() => setScreenReaderAnnouncement(""), 1000);
    }
  };

  const handleInputBlur = (field: keyof SignUpFormData) => {
    handleFieldBlur(field, formData[field], formData);
  };

  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    clearAllErrors();

    // Final validation before submission
    const validation = validateAllFields(formData);
    if (!validation.isValid) {
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            player_id: formData.playerId,
            user_role: formData.userRole,
          }
        },
      });

      if (authError) {
        // Handle specific Supabase errors
        switch (authError.message) {
          case 'User already registered':
            setGeneralError('Ya existe una cuenta con este correo electrónico.');
            break;
          case 'Password should be at least 6 characters':
            setGeneralError('La contraseña debe tener al menos 6 caracteres.');
            break;
          case 'Signup is disabled':
            setGeneralError('El registro está temporalmente deshabilitado.');
            break;
          default:
            setGeneralError(authError.message || 'Ha ocurrido un error durante el registro.');
        }
        return;
      }

      if (authData.user) {
        // Create the user profile
        const profileData = {
          user_id: authData.user.id,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          player_id: formData.playerId,
          birth_year: parseInt(formData.birthYear, 10),
          user_role: formData.userRole,
          organization_name: formData.userRole === UserRole.ORGANIZER && formData.organizationName ? formData.organizationName.trim() : null,
          pokemon_league_url: formData.userRole === UserRole.ORGANIZER && formData.pokemonLeagueUrl ? formData.pokemonLeagueUrl.trim() : null,
        };

        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert([profileData]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // If profile creation fails, we should still redirect to success
          // The user can complete their profile later
        }
      }

      // Show success animation before redirect
      setShowSuccess(true);
      
      setTimeout(() => {
        router.push("/auth/sign-up-success");
      }, 2000);
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      setGeneralError(
        error instanceof Error 
          ? error.message 
          : 'Error de conexión. Verifica tu internet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <SkipLinks />
      
      <main id="main-content" role="main">
        <FormCard
          title={String(tAuth('signUp.title'))}
          description={String(tAuth('signUp.description'))}
          className="w-full max-w-2xl mx-auto px-4 sm:px-6"
        >
        <form 
          ref={formRef}
          onSubmit={handleSignUp} 
          className="space-y-6 sm:space-y-8"
          noValidate
          aria-label="Formulario de registro"
          id="form-section"
          role="form"
        >
          {/* Screen reader announcements */}
          <div 
            role="status" 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
          >
            {ariaLiveMessage}
            {generalError && `Error: ${generalError}`}
            {screenReaderAnnouncement}
          </div>

          {generalError && (
            <ErrorMessage 
              title="Error en el registro"
              message={generalError} 
              onDismiss={() => setGeneralError(null)}
              onRetry={() => {
                setGeneralError(null);
                clearAllErrors();
              }}
            />
          )}

          {/* Validation Summary */}
          {validationSummary.totalFields > 0 && (
            <ValidationSummary 
              summary={validationSummary}
              showProgress={true}
              showDetails={true}
            />
          )}

          {/* Account Information Section */}
          <FormSection
            title="Información de la cuenta"
            icon={<User className="w-4 h-4" />}
          >
            <FormField
              id="email"
              label={String(tAuth('signUp.emailLabel'))}
              type="email"
              placeholder={String(tAuth('signUp.emailPlaceholder'))}
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              onBlur={() => handleInputBlur('email')}
              error={getFieldError('email')}
              success={getFieldSuccess('email')}
              isValidating={isFieldValidating('email')}
              required
              autoComplete="email"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="password"
                label={String(tAuth('signUp.passwordLabel'))}
                type="password"
                placeholder={String(tAuth('signUp.passwordPlaceholder'))}
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                onBlur={() => handleInputBlur('password')}
                error={getFieldError('password')}
                success={getFieldSuccess('password')}
                isValidating={isFieldValidating('password')}
                required
                autoComplete="new-password"
              />

              <FormField
                id="confirmPassword"
                label={String(tAuth('signUp.confirmPasswordLabel'))}
                type="password"
                placeholder={String(tAuth('signUp.confirmPasswordPlaceholder'))}
                value={formData.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                error={getFieldError('confirmPassword')}
                success={getFieldSuccess('confirmPassword')}
                isValidating={isFieldValidating('confirmPassword')}
                required
                autoComplete="new-password"
              />
            </div>
          </FormSection>

          {/* Personal Information Section */}
          <FormSection
            title="Información personal"
            icon={<Trophy className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="firstName"
                label={String(tAuth('signUp.firstNameLabel'))}
                type="text"
                placeholder={String(tAuth('signUp.firstNamePlaceholder'))}
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                onBlur={() => handleInputBlur('firstName')}
                error={getFieldError('firstName')}
                success={getFieldSuccess('firstName')}
                required
                autoComplete="given-name"
              />

              <FormField
                id="lastName"
                label={String(tAuth('signUp.lastNameLabel'))}
                type="text"
                placeholder={String(tAuth('signUp.lastNamePlaceholder'))}
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                onBlur={() => handleInputBlur('lastName')}
                error={getFieldError('lastName')}
                success={getFieldSuccess('lastName')}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="playerId"
                label={String(tAuth('signUp.playerIdLabel'))}
                type="text"
                placeholder={String(tAuth('signUp.playerIdPlaceholder'))}
                value={formData.playerId}
                onChange={(value) => handleInputChange('playerId', value)}
                onBlur={() => handleInputBlur('playerId')}
                error={getFieldError('playerId')}
                success={getFieldSuccess('playerId')}
                helpText={String(tAuth('signUp.playerIdHelp'))}
                required
              />

              <FormField
                id="birthYear"
                label={String(tAuth('signUp.birthYearLabel'))}
                type="number"
                placeholder={String(tAuth('signUp.birthYearPlaceholder'))}
                value={formData.birthYear}
                onChange={(value) => handleInputChange('birthYear', value)}
                onBlur={() => handleInputBlur('birthYear')}
                error={getFieldError('birthYear')}
                success={getFieldSuccess('birthYear')}
                required
              />
            </div>
          </FormSection>

          {/* Role Selection Section */}
          <FormSection
            title="Tipo de cuenta"
            icon={<Users className="w-4 h-4" />}
          >
            <RoleSelection
              value={formData.userRole}
              onChange={(value) => handleInputChange('userRole', value)}
              error={getFieldError('userRole')}
            />

            {/* Organizer Information - Progressive Disclosure */}
            {formData.userRole === UserRole.ORGANIZER && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setIsOrganizerSectionOpen(!isOrganizerSectionOpen)}
                  aria-expanded={isOrganizerSectionOpen}
                  aria-controls="organizer-details-section"
                  aria-label={`${isOrganizerSectionOpen ? 'Ocultar' : 'Mostrar'} información adicional de organizador`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                    {String(tAuth('signUp.organizer.sectionTitle'))}
                  </div>
                  {isOrganizerSectionOpen ? (
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  )}
                </Button>
                
                {isOrganizerSectionOpen && (
                  <div 
                    id="organizer-details-section"
                    className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2 duration-200"
                    role="region"
                    aria-label="Información adicional para organizadores"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          ¡Bienvenido como organizador!
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {String(tAuth('signUp.organizer.sectionDescription'))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        id="organizationName"
                        label={String(tAuth('signUp.organizer.organizationNameLabel'))}
                        type="text"
                        placeholder={String(tAuth('signUp.organizer.organizationNamePlaceholder'))}
                        value={formData.organizationName || ""}
                        onChange={(value) => handleInputChange('organizationName', value)}
                        onBlur={() => handleInputBlur('organizationName')}
                        error={getFieldError('organizationName')}
                        success={getFieldSuccess('organizationName')}
                        required={formData.userRole === UserRole.ORGANIZER}
                        helpText="Ejemplo: Liga Pokémon Madrid, Tienda Cartas Mágicas, Club Pokémon Universidad"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          id="businessEmail"
                          label={String(tAuth('signUp.organizer.businessEmailLabel'))}
                          type="email"
                          placeholder={String(tAuth('signUp.organizer.businessEmailPlaceholder'))}
                          value={formData.businessEmail || ""}
                          onChange={(value) => handleInputChange('businessEmail', value)}
                          onBlur={() => handleInputBlur('businessEmail')}
                          error={getFieldError('businessEmail')}
                          success={getFieldSuccess('businessEmail')}
                          helpText={String(tAuth('signUp.organizer.businessEmailHelp'))}
                        />

                        <FormField
                          id="phoneNumber"
                          label={String(tAuth('signUp.organizer.phoneNumberLabel'))}
                          type="tel"
                          placeholder={String(tAuth('signUp.organizer.phoneNumberPlaceholder'))}
                          value={formData.phoneNumber || ""}
                          onChange={(value) => handleInputChange('phoneNumber', value)}
                          onBlur={() => handleInputBlur('phoneNumber')}
                          error={getFieldError('phoneNumber')}
                          success={getFieldSuccess('phoneNumber')}
                          helpText={String(tAuth('signUp.organizer.phoneNumberHelp'))}
                        />
                      </div>

                      <FormField
                        id="address"
                        label={String(tAuth('signUp.organizer.addressLabel'))}
                        type="text"
                        placeholder={String(tAuth('signUp.organizer.addressPlaceholder'))}
                        value={formData.address || ""}
                        onChange={(value) => handleInputChange('address', value)}
                        onBlur={() => handleInputBlur('address')}
                        error={getFieldError('address')}
                        success={getFieldSuccess('address')}
                      />

                      <FormField
                        id="pokemonLeagueUrl"
                        label={String(tAuth('signUp.organizer.pokemonLeagueUrlLabel'))}
                        type="url"
                        placeholder={String(tAuth('signUp.organizer.pokemonLeagueUrlPlaceholder'))}
                        value={formData.pokemonLeagueUrl || ""}
                        onChange={(value) => handleInputChange('pokemonLeagueUrl', value)}
                        onBlur={() => handleInputBlur('pokemonLeagueUrl')}
                        error={getFieldError('pokemonLeagueUrl')}
                        success={getFieldSuccess('pokemonLeagueUrl')}
                        helpText={String(tAuth('signUp.organizer.pokemonLeagueUrlHelp'))}
                      />

                      <FormField
                        id="experienceDescription"
                        label={String(tAuth('signUp.organizer.experienceDescriptionLabel'))}
                        type="text"
                        placeholder={String(tAuth('signUp.organizer.experienceDescriptionPlaceholder'))}
                        value={formData.experienceDescription || ""}
                        onChange={(value) => handleInputChange('experienceDescription', value)}
                        onBlur={() => handleInputBlur('experienceDescription')}
                        error={getFieldError('experienceDescription')}
                        success={getFieldSuccess('experienceDescription')}
                        helpText={String(tAuth('signUp.organizer.experienceDescriptionHelp'))}
                      />
                    </div>

                    {/* Benefits and Responsibilities */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                            {String(tAuth('signUp.organizer.benefits.title'))}
                          </h4>
                        </div>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-2">
                          {tAuthArray('signUp.organizer.benefits.items').map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                            {String(tAuth('signUp.organizer.responsibilities.title'))}
                          </h4>
                        </div>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-2">
                          {tAuthArray('signUp.organizer.responsibilities.items').map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Additional guidance */}
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">!</span>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Información importante
                          </h5>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Tu cuenta será revisada por nuestro equipo antes de activar las funciones de organizador. 
                            Esto puede tomar 1-2 días hábiles. Mientras tanto, podrás usar todas las funciones de jugador.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </FormSection>

          {/* Submit Button */}
          <div className="space-y-4 pt-4">
            <LoadingButton
              type="submit"
              className="w-full"
              loading={isLoading}
              loadingText={String(tAuth('signUp.loadingButton'))}
              disabled={isLoading || hasAnyErrors || !validationSummary.canSubmit}
            >
              {String(tAuth('signUp.submitButton'))}
            </LoadingButton>
            
            <div className="text-center text-sm text-muted-foreground">
              {String(tAuth('signUp.loginLink'))}{" "}
              <Link 
                href="/auth/login" 
                className="text-primary underline-offset-4 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
                tabIndex={0}
              >
                {String(tAuth('signUp.loginLinkText'))}
              </Link>
            </div>
          </div>
        </form>
      </FormCard>
      </main>

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        title="¡Cuenta creada!"
        message="Revisa tu email para confirmar tu cuenta"
        onComplete={() => setShowSuccess(false)}
        duration={4000}
      />
    </div>
  );
}