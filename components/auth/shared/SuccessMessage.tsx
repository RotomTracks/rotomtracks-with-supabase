"use client";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessMessage({
  message,
  onDismiss,
  className,
}: SuccessMessageProps) {
  if (!message) return null;

  return (
    <Alert className={cn("border-green-200 bg-green-50 text-green-800 relative", className)}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className={onDismiss ? "pr-8" : ""}>
        {message}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent text-green-600 hover:text-green-800"
          onClick={onDismiss}
          aria-label="Cerrar mensaje de éxito"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
}