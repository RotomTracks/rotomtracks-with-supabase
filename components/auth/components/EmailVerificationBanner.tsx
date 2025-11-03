"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, X, RefreshCw } from "lucide-react";
import { useTypedTranslation } from "@/lib/i18n";

interface EmailVerificationBannerProps {
  className?: string;
}

export function EmailVerificationBanner({ className }: EmailVerificationBannerProps) {
  const { user } = useAuth();
  const { tAuth } = useTypedTranslation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Check if user email is verified
  const isEmailVerified = user?.email_confirmed_at !== null;

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('email-verification-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        console.error('Error resending verification:', error);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('email-verification-dismissed', 'true');
  };

  // Don't show banner if email is verified or dismissed
  if (isEmailVerified || isDismissed || !user) {
    return null;
  }

  return (
    <Alert className={className}>
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">
            {tAuth('emailVerification.title')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {tAuth('emailVerification.description')}
          </p>
          {resendSuccess && (
            <p className="text-sm text-green-600 mt-1">
              {tAuth('emailVerification.resendSuccess')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-xs"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                {tAuth('emailVerification.resending')}
              </>
            ) : (
              tAuth('emailVerification.resend')
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-xs p-1 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

