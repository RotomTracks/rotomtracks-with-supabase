"use client";

import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface LoadingStateProps {
  isLoading: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showSuccess?: boolean;
  showError?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  isLoading,
  loadingText = "Cargando...",
  successText = "¡Completado!",
  errorText = "Error",
  showSuccess = false,
  showError = false,
  className,
  size = "md"
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  if (showError) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-red-600 dark:text-red-400 animate-in fade-in duration-200",
        sizeClasses[size],
        className
      )}>
        <AlertCircle className={iconSizes[size]} />
        <span>{errorText}</span>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-green-600 dark:text-green-400 animate-in fade-in duration-200",
        sizeClasses[size],
        className
      )}>
        <CheckCircle className={iconSizes[size]} />
        <span>{successText}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-in fade-in duration-200",
        sizeClasses[size],
        className
      )}>
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        <span>{loadingText}</span>
      </div>
    );
  }

  return null;
}