"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getPasswordResetUrl } from "@/lib/utils/auth-urls";
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
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTypedTranslation } from "@/lib/i18n";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { tAuth } = useTypedTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  // Check for error messages from URL parameters (e.g., expired token, no session, session expired)
  useEffect(() => {
    const urlError = searchParams.get('error');
    const urlMessage = searchParams.get('message');
    
    if ((urlError === 'expired_token' || urlError === 'no_session' || urlError === 'session_expired') && urlMessage) {
      setError(urlMessage);
    }
  }, [searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetUrl(),
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : tAuth('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{tAuth('passwordReset.success.title') as string}</CardTitle>
            <CardDescription>{tAuth('passwordReset.success.description') as string}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {tAuth('success.passwordResetSent') as string}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{tAuth('passwordReset.title') as string}</CardTitle>
            <CardDescription>
              {tAuth('passwordReset.description') as string}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{tAuth('passwordReset.emailLabel') as string}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={tAuth('passwordReset.emailPlaceholder') as string}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? tAuth('passwordReset.loadingButton') as string : tAuth('passwordReset.submitButton') as string}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {tAuth('login.signUpLink') as string}{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  {tAuth('login.signUpLinkText') as string}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
