"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types/tournament";
import { useTypedTranslation } from "@/lib/i18n";
import { validateSignUpForm, type SignUpFormData } from "@/lib/utils/validation";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { getFullUrl } from "@/lib/config/app";
import { PasswordStrengthIndicator } from "../components/PasswordStrengthIndicator";
import { getAuthErrorMessage } from "@/lib/utils/auth-error-handler";

interface SignUpFormProps {
  className?: string;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  isModal?: boolean;
}

export function SignUpForm({
  className,
  onSuccess,
  onSwitchToLogin,
  isModal = false,
  ...props
}: SignUpFormProps & React.ComponentPropsWithoutRef<"div">) {
  const { tAuth, tUI } = useTypedTranslation();
  const router = useRouter();
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (field: keyof SignUpFormData, value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setIsCheckingEmail(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-password-to-check-email'
      });
      
      // If no error, email exists
      if (!error) {
        setErrors(prev => ({
          ...prev,
          email: tAuth('signUp.errors.emailAlreadyExists')
        }));
      } else if (error.message.includes('Invalid login credentials')) {
        // Email doesn't exist, which is what we want
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch (error) {
      // Ignore errors for email checking
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounced email checking
  useEffect(() => {
    if (emailCheckTimeout.current) {
      clearTimeout(emailCheckTimeout.current);
    }
    
    if (formData.email && formData.email.includes('@')) {
      emailCheckTimeout.current = setTimeout(() => {
        checkEmailExists(formData.email);
      }, 1000); // Check after 1 second of no typing
    }
    
    return () => {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
    };
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    const validation = validateSignUpForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            player_id: formData.playerId,
            birth_year: formData.birthYear,
            user_role: formData.userRole,
            organization_name: formData.organizationName,
            business_email: formData.businessEmail,
            phone_number: formData.phoneNumber,
          },
          emailRedirectTo: getFullUrl('/auth/callback'),
        }
      });

      if (error) {
        const errorMessage = getAuthErrorMessage(error);
        
        // Handle specific field errors
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setErrors({ email: tAuth('signUp.errors.emailAlreadyExists') });
        } else if (error.message.includes('Invalid email')) {
          setErrors({ email: tAuth('signUp.errors.invalidEmail') });
        } else if (error.message.includes('Password should be at least')) {
          setErrors({ password: tAuth('signUp.errors.passwordTooShort') });
        } else {
          setErrors({ submit: errorMessage });
        }
      } else {
        // Call onSuccess if provided (for modal mode), otherwise redirect to success page
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to signup success page
          router.push('/auth/sign-up-success');
        }
      }
    } catch (error) {
      setErrors({ submit: tUI('messages.error.unexpectedError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)} {...props}>
      <Card className={isModal ? "border-0 shadow-none" : ""}>
        <CardHeader className={isModal ? "space-y-1 p-4 pb-2" : "space-y-1"}>
          {!isModal && (
            <CardTitle className="text-2xl text-center">
              {tAuth('signUp.title')}
            </CardTitle>
          )}
          <CardDescription className="text-center text-sm">
            {tAuth('signUp.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className={isModal ? "p-2 sm:p-3 pt-1 sm:pt-2" : ""}>
          <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2">
            {/* Email */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label htmlFor="email" className="text-xs sm:text-sm">{tAuth('signUp.emailLabel')}</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder={tAuth('signUp.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "transition-colors pr-8",
                    errors.email && "border-red-500 focus:border-red-500"
                  )}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {isCheckingEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label htmlFor="password" className="text-xs sm:text-sm">{tAuth('signUp.passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={tAuth('signUp.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(
                    "pr-10 transition-colors",
                    errors.password && "border-red-500 focus:border-red-500"
                  )}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
              
              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">{tAuth('signUp.confirmPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={tAuth('signUp.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={cn(
                    "pr-10 transition-colors",
                    errors.confirmPassword && "border-red-500 focus:border-red-500"
                  )}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label htmlFor="firstName" className="text-xs sm:text-sm">{tAuth('signUp.firstNameLabel')}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={tAuth('signUp.firstNamePlaceholder')}
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={cn(
                  "transition-colors",
                  errors.firstName && "border-red-500 focus:border-red-500"
                )}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-sm text-red-600" role="alert">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label htmlFor="lastName" className="text-xs sm:text-sm">{tAuth('signUp.lastNameLabel')}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={tAuth('signUp.lastNamePlaceholder')}
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={cn(
                  "transition-colors",
                  errors.lastName && "border-red-500 focus:border-red-500"
                )}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-sm text-red-600" role="alert">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Player ID */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label htmlFor="playerId" className="text-xs sm:text-sm">{tAuth('signUp.playerIdLabel')}</Label>
              <Input
                id="playerId"
                type="text"
                placeholder={tAuth('signUp.playerIdPlaceholder')}
                value={formData.playerId}
                onChange={(e) => handleInputChange('playerId', e.target.value)}
                className={cn(
                  "transition-colors",
                  errors.playerId && "border-red-500 focus:border-red-500"
                )}
                aria-invalid={!!errors.playerId}
                aria-describedby={errors.playerId ? "playerId-error" : undefined}
              />
              {errors.playerId && (
                <p id="playerId-error" className="text-sm text-red-600" role="alert">
                  {errors.playerId}
                </p>
              )}
            </div>

            {/* Birth Year */}
            <div className="space-y-0.5 sm:space-y-1">
              <Label htmlFor="birthYear" className="text-xs sm:text-sm">{tAuth('signUp.birthYearLabel')}</Label>
              <Input
                id="birthYear"
                type="text"
                placeholder={tAuth('signUp.birthYearPlaceholder')}
                value={formData.birthYear}
                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                className={cn(
                  "transition-colors",
                  errors.birthYear && "border-red-500 focus:border-red-500"
                )}
                aria-invalid={!!errors.birthYear}
                aria-describedby={errors.birthYear ? "birthYear-error" : undefined}
              />
              {errors.birthYear && (
                <p id="birthYear-error" className="text-sm text-red-600" role="alert">
                  {errors.birthYear}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="text-sm text-red-600 text-center" role="alert">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2 sm:mt-4"
              disabled={loading || isCheckingEmail || !!errors.email}
            >
              {loading ? tAuth('signUp.loadingButton') : 
               isCheckingEmail ? tAuth('signUp.checkingEmail') : 
               tAuth('signUp.submitButton')}
            </Button>
          </form>

          <div className="mt-2 sm:mt-4 text-center text-xs sm:text-sm">
            <span className="text-muted-foreground">
              {tAuth('signUp.loginLink')}{" "}
            </span>
            {isModal && onSwitchToLogin ? (
              <button
                onClick={onSwitchToLogin}
                className="text-primary underline-offset-4 hover:underline font-medium"
              >
                {tAuth('signUp.loginLinkText')}
              </button>
            ) : (
              <a
                href="/auth/login"
                className="text-primary underline-offset-4 hover:underline font-medium"
              >
                {tAuth('signUp.loginLinkText')}
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}