"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTypedTranslation } from "@/lib/i18n";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { tAuth } = useTypedTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const router = useRouter();

  // Verify session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setSessionValid(false);
        router.push(`/auth/login?error=no_session&message=${encodeURIComponent(tAuth('errors.sessionExpired'))}`);
      } else {
        setSessionValid(true);
      }
    };

    checkSession();
  }, [router, tAuth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError(tAuth('validation.passwordsNoMatch'));
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError(tAuth('validation.passwordTooShort'));
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      // Double-check session before updating
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError || !user) {
        throw new Error(tAuth('errors.sessionExpired'));
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      // Password updated successfully, redirect to profile
      router.push("/profile");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : tAuth('errors.generic');
      setError(errorMessage);
      
      // If session is invalid, redirect to forgot password
      if (errorMessage.includes(tAuth('errors.sessionExpired'))) {
        setTimeout(() => {
          router.push(`/auth/login?error=session_expired&message=${encodeURIComponent(tAuth('errors.sessionExpired'))}`);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (sessionValid === null) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">{tAuth('updatePassword.loadingSession')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render form if session is invalid (will redirect)
  if (sessionValid === false) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{tAuth('updatePassword.title')}</CardTitle>
          <CardDescription>
            {tAuth('updatePassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{tAuth('updatePassword.passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={tAuth('updatePassword.passwordPlaceholder')}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{tAuth('updatePassword.confirmPasswordLabel')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={tAuth('updatePassword.confirmPasswordPlaceholder')}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? tAuth('updatePassword.loadingButton') : tAuth('updatePassword.submitButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
