"use client";

import { useState } from "react";
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

interface SignUpFormProps {
  className?: string;
}

export function SignUpForm({
  className,
  ...props
}: SignUpFormProps & React.ComponentPropsWithoutRef<"div">) {
  const { tAuth, tCommon } = useTypedTranslation();
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
          }
        }
      });

      if (error) {
        setErrors({ submit: error.message });
      } else {
        // Show success message or redirect
        alert(tCommon('messages.accountCreated'));
      }
    } catch (error) {
      setErrors({ submit: tCommon('messages.unexpectedError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)} {...props}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {tAuth('signUp.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {tAuth('signUp.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{tAuth('signUp.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={tAuth('signUp.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn(
                  "transition-colors",
                  errors.email && "border-red-500 focus:border-red-500"
                )}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{tAuth('signUp.passwordLabel')}</Label>
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
                  aria-label={showPassword ? tCommon('ui.hidePassword') : tCommon('ui.showPassword')}
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
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{tAuth('signUp.confirmPasswordLabel')}</Label>
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
                  aria-label={showConfirmPassword ? tCommon('ui.hideConfirmPassword') : tCommon('ui.showConfirmPassword')}
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
            <div className="space-y-2">
              <Label htmlFor="firstName">{tAuth('signUp.firstNameLabel')}</Label>
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
            <div className="space-y-2">
              <Label htmlFor="lastName">{tAuth('signUp.lastNameLabel')}</Label>
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
            <div className="space-y-2">
              <Label htmlFor="playerId">{tAuth('signUp.playerIdLabel')}</Label>
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
            <div className="space-y-2">
              <Label htmlFor="birthYear">{tAuth('signUp.birthYearLabel')}</Label>
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
              className="w-full"
              disabled={loading}
            >
              {loading ? tAuth('signUp.loadingButton') : tAuth('signUp.submitButton')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {tAuth('signUp.loginLink')}{" "}
            </span>
            <a
              href="/auth/login"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              {tAuth('signUp.loginLinkText')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}