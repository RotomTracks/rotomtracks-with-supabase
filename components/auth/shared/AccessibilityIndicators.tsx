"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Type, Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AccessibilityIndicatorsProps {
  className?: string;
  showControls?: boolean;
}

export function AccessibilityIndicators({ 
  className, 
  showControls = false 
}: AccessibilityIndicatorsProps) {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Apply initial settings
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const toggleLargeText = () => {
    const newValue = !largeText;
    setLargeText(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    
    if (newValue) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  if (!showControls) {
    return (
      <div className={cn("sr-only", className)}>
        <div role="status" aria-live="polite">
          {highContrast && "Modo de alto contraste activado"}
          {largeText && "Texto grande activado"}
          {reducedMotion && "Movimiento reducido activado"}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border", className)}>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 w-full">
        Opciones de accesibilidad:
      </div>
      
      <Button
        variant={highContrast ? "default" : "outline"}
        size="sm"
        onClick={toggleHighContrast}
        className="text-xs h-8"
        aria-pressed={highContrast}
        aria-label={`${highContrast ? 'Desactivar' : 'Activar'} alto contraste`}
      >
        <Contrast className="h-3 w-3 mr-1" />
        Alto contraste
      </Button>

      <Button
        variant={largeText ? "default" : "outline"}
        size="sm"
        onClick={toggleLargeText}
        className="text-xs h-8"
        aria-pressed={largeText}
        aria-label={`${largeText ? 'Desactivar' : 'Activar'} texto grande`}
      >
        <Type className="h-3 w-3 mr-1" />
        Texto grande
      </Button>

      <Button
        variant={reducedMotion ? "default" : "outline"}
        size="sm"
        onClick={toggleReducedMotion}
        className="text-xs h-8"
        aria-pressed={reducedMotion}
        aria-label={`${reducedMotion ? 'Activar' : 'Reducir'} animaciones`}
      >
        {reducedMotion ? (
          <EyeOff className="h-3 w-3 mr-1" />
        ) : (
          <Eye className="h-3 w-3 mr-1" />
        )}
        {reducedMotion ? 'Sin animación' : 'Reducir movimiento'}
      </Button>
    </div>
  );
}