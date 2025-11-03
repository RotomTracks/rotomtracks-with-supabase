"use client";

import { useState, useEffect } from "react";
import { validatePasswordStrength } from "@/lib/utils/validation";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<{
    isValid: boolean;
    score: number;
    feedback: string[];
  }>({ isValid: false, score: 0, feedback: [] });

  useEffect(() => {
    if (password.length > 0) {
      try {
        setStrength(validatePasswordStrength(password));
      } catch (error) {
        console.error('Error validating password strength:', error);
        setStrength({ isValid: false, score: 0, feedback: [] });
      }
    } else {
      setStrength({ isValid: false, score: 0, feedback: [] });
    }
  }, [password]);

  if (password.length === 0) return null;

  const getStrengthColor = (score: number) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return "Débil";
    if (score <= 3) return "Regular";
    if (score <= 4) return "Buena";
    return "Fuerte";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              getStrengthColor(strength.score)
            )}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={cn(
          "text-xs font-medium",
          strength.score <= 2 ? "text-red-600" :
          strength.score <= 3 ? "text-yellow-600" :
          strength.score <= 4 ? "text-blue-600" : "text-green-600"
        )}>
          {getStrengthText(strength.score)}
        </span>
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

