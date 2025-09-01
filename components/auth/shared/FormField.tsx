"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
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
            isPassword ? "pr-12" : (success || error) ? "pr-10" : "",
            error && "border-red-500 focus-visible:ring-red-500",
            success && "border-green-500 focus-visible:ring-green-500",
            "transition-colors duration-200"
          )}
          aria-describedby={
            [
              error ? `${id}-error` : null,
              helpText ? `${id}-help` : null
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm p-1 transition-colors duration-200"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        
        {/* Success/Error icons */}
        {!isPassword && (success || error) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {success && (
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            )}
            {error && (
              <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
            )}
          </div>
        )}
      </div>
      
      {/* Help text */}
      {helpText && !error && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}