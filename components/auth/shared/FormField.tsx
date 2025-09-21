"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: boolean;
  isValidating?: boolean;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  autoComplete?: string;
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  isValidating,
  required,
  disabled,
  helpText,
  className,
  autoComplete,
  ...props
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  
  // Determine the current state for styling
  const hasValidationState = success || error || isValidating;
  const rightPadding = isPassword ? "pr-12" : hasValidationState ? "pr-10" : "";

  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="obligatorio">
              *
            </span>
          )}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            rightPadding,
            error && "border-red-500 focus-visible:ring-red-500",
            success && !isValidating && "border-green-500 focus-visible:ring-green-500",
            isValidating && "border-blue-500 focus-visible:ring-blue-500",
            "transition-all duration-200 min-h-[44px] touch-manipulation text-base sm:text-sm"
          )}
          aria-describedby={
            [
              error ? `${id}-error` : null,
              helpText ? `${id}-help` : null,
              isValidating ? `${id}-validating` : null
            ].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={!!error}
          aria-required={required}
          {...props}
        />
        
        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm p-2 sm:p-1 transition-colors duration-200 touch-manipulation"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 sm:h-4 sm:w-4" />
            ) : (
              <Eye className="h-5 w-5 sm:h-4 sm:w-4" />
            )}
          </button>
        )}
        
        {/* Validation state icons */}
        {!isPassword && hasValidationState && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidating && (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" aria-hidden="true" />
            )}
            {!isValidating && success && (
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            )}
            {!isValidating && error && (
              <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
            )}
          </div>
        )}
      </div>
      
      {/* Validation status message */}
      {isValidating && (
        <p id={`${id}-validating`} className="text-sm text-blue-600 flex items-center gap-1" aria-live="polite">
          <Loader2 className="h-3 w-3 animate-spin" />
          Validando...
        </p>
      )}
      
      {/* Success message */}
      {!isValidating && success && !error && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Campo válido
        </p>
      )}
      
      {/* Help text */}
      {helpText && !error && !isValidating && !success && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {/* Error message */}
      {error && !isValidating && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1" role="alert" aria-live="polite">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}