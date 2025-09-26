"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPasswordResetUrl } from "@/lib/utils/auth-urls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTypedTranslation } from "@/lib/i18n";
import { Mail, CheckCircle } from "lucide-react";

interface ForgotPasswordDialogProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function ForgotPasswordDialog({ trigger, children }: ForgotPasswordDialogProps) {
  const { tAuth } = useTypedTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetUrl(),
      });
      if (error) throw error;
      
      // Close the dialog and show success alert
      setIsOpen(false);
      setShowSuccessAlert(true);
      setEmail(""); // Reset form
    } catch (error: unknown) {
      let errorMessage = tAuth('errors.generic');
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Has alcanzado el límite de envío de emails. Por favor, espera unos minutos antes de intentar de nuevo.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'El email proporcionado no es válido.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No se encontró una cuenta con este email.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessAlert(false);
  };

  const defaultTrigger = (
    <Button variant="link" className="p-0 h-auto text-sm text-primary underline-offset-4 hover:underline">
      {tAuth('login.forgotPassword')}
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || children || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {tAuth('passwordReset.title')}
            </DialogTitle>
            <DialogDescription>
              {tAuth('passwordReset.description')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">{tAuth('passwordReset.emailLabel')}</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder={tAuth('passwordReset.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                {tAuth('buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="flex-1"
              >
                {isLoading ? tAuth('passwordReset.loadingButton') : tAuth('passwordReset.submitButton')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Alert Dialog */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              {tAuth('passwordReset.success.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {tAuth('passwordReset.success.description')}
              <br />
              <br />
              <span className="text-sm text-muted-foreground">
                {tAuth('success.passwordResetSent')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseSuccess}>
              {tAuth('buttons.understood')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}