"use client";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorSuggestion {
  text: string;
  action?: () => void;
  actionText?: string;
}

interface ErrorMessageProps {
  message: string;
  title?: string;
  suggestions?: ErrorSuggestion[];
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: "default" | "destructive";
  showIcon?: boolean;
}

export function ErrorMessage({
  message,
  title,
  suggestions = [],
  onDismiss,
  onRetry,
  className,
  variant = "destructive",
  showIcon = true,
}: ErrorMessageProps) {
  if (!message) return null;

  // Generate contextual suggestions based on error message
  const getContextualSuggestions = (errorMessage: string): ErrorSuggestion[] => {
    const lowerMessage = errorMessage.toLowerCase();
    const contextualSuggestions: ErrorSuggestion[] = [];

    if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('credenciales')) {
      contextualSuggestions.push({
        text: "Verifica que tu email y contraseña sean correctos"
      });
      contextualSuggestions.push({
        text: "¿Olvidaste tu contraseña?",
        action: () => window.location.href = '/auth/forgot-password',
        actionText: "Recuperar contraseña"
      });
    }

    if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('confirmar')) {
      contextualSuggestions.push({
        text: "Revisa tu bandeja de entrada y spam para el email de confirmación"
      });
      contextualSuggestions.push({
        text: "¿No recibiste el email?",
        actionText: "Reenviar confirmación"
      });
    }

    if (lowerMessage.includes('too many requests') || lowerMessage.includes('muchas solicitudes')) {
      contextualSuggestions.push({
        text: "Espera unos minutos antes de intentar nuevamente"
      });
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('conexión')) {
      contextualSuggestions.push({
        text: "Verifica tu conexión a internet"
      });
      if (onRetry) {
        contextualSuggestions.push({
          text: "Intenta nuevamente",
          action: onRetry,
          actionText: "Reintentar"
        });
      }
    }

    if (lowerMessage.includes('user already registered') || lowerMessage.includes('ya existe')) {
      contextualSuggestions.push({
        text: "Ya tienes una cuenta con este email",
        action: () => window.location.href = '/auth/login',
        actionText: "Iniciar sesión"
      });
    }

    return contextualSuggestions;
  };

  const allSuggestions = [...suggestions, ...getContextualSuggestions(message)];

  return (
    <Alert 
      variant={variant} 
      className={cn("relative animate-in slide-in-from-top-2 duration-200", className)}
      role="alert"
      aria-live="assertive"
    >
      {showIcon && <AlertCircle className="h-4 w-4" aria-hidden="true" />}
      
      <div className={cn("space-y-2", onDismiss ? "pr-8" : "")}>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
        
        {allSuggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <HelpCircle className="h-3 w-3 flex-shrink-0" />
              Sugerencias:
            </div>
            <ul className="space-y-2">
              {allSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-0.5 flex-shrink-0">•</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground break-words">{suggestion.text}</span>
                    {suggestion.action && suggestion.actionText && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 ml-2 text-sm underline-offset-4 touch-manipulation"
                        onClick={suggestion.action}
                      >
                        {suggestion.actionText}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {onRetry && !allSuggestions.some(s => s.actionText === "Reintentar") && (
          <div className="mt-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-10 sm:h-8 touch-manipulation"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Intentar nuevamente
            </Button>
          </div>
        )}
      </div>

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