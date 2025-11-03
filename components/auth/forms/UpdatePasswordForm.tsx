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
import { useState } from "react";
import { useTypedTranslation } from "@/lib/i18n";

interface UpdatePasswordFormProps extends React.ComponentPropsWithoutRef<"div"> {
  userId: string;
}

export function UpdatePasswordForm({
  className,
  userId,
  ...props
}: UpdatePasswordFormProps) {
  const { tAuth } = useTypedTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(tAuth('validation.passwordsNoMatch'));
      return;
    }

    if (password.length < 6) {
      setError(tAuth('validation.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      router.push("/auth/login?message=Password updated successfully. Please log in with your new password.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : tAuth('errors.generic');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0">
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
