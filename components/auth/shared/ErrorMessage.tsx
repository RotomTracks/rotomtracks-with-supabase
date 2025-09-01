"use client";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: "default" | "destructive";
}

export function ErrorMessage({
  message,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <Alert 
      variant={variant} 
      className={cn("relative", className)}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertDescription className={onDismiss ? "pr-8" : ""}>
        {message}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          onClick={onDismiss}
          aria-label="Cerrar mensaje de error"
          tabIndex={0}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
}