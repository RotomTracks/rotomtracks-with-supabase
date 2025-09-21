"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useTypedTranslation } from "@/lib/i18n";
import { validateLoginForm, type LoginFormData } from "@/lib/utils/validation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { ForgotPasswordDialog } from "./forgot-password-dialog";
import { useSearchParams } from "next/navigation";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({
  className,
  ...props
}: LoginFormProps & React.ComponentPropsWithoutRef<"div">) {
  const { tAuth, tCommon } = useTypedTranslation();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  // Check for error messages from URL parameters
  useEffect(() => {
    const urlError = searchParams.get('error');
    const urlMessage = searchParams.get('message');
    
    if (urlError && urlMessage) {
      setErrors({ url: urlMessage });
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
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
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password, 
      });

      if (error) {
        setErrors({ submit: error.message });
      } else {
        // Redirect will be handled by the auth state change
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setErrors({ submit: tCommon('messages.unexpectedError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {tAuth('login.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {tAuth('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{tAuth('login.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={tAuth('login.emailPlaceholder')}
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{tAuth('login.passwordLabel')}</Label>
                <ForgotPasswordDialog />
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={tAuth('login.passwordPlaceholder')}
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

            {errors.submit && (
              <div className="text-sm text-red-600 text-center" role="alert">
                {errors.submit}
              </div>
            )}

            {errors.url && (
              <div className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-md border border-amber-200" role="alert">
                {errors.url}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? tAuth('login.loadingButton') : tAuth('login.submitButton')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {tAuth('login.signUpLink')}{" "}
            </span>
            <Link
              href="/auth/sign-up"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              {tAuth('login.signUpLinkText')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
