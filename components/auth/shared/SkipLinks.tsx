"use client";

import { cn } from "@/lib/utils";

interface SkipLinksProps {
  className?: string;
}

export function SkipLinks({ className }: SkipLinksProps) {
  return (
    <div className={cn("sr-only focus-within:not-sr-only", className)}>
      <a
        href="#main-content"
        className="absolute top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
        onFocus={(e) => {
          e.currentTarget.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.currentTarget.classList.add('sr-only');
        }}
      >
        Saltar al contenido principal
      </a>
      <a
        href="#form-section"
        className="absolute top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 ml-2"
        onFocus={(e) => {
          e.currentTarget.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.currentTarget.classList.add('sr-only');
        }}
      >
        Saltar al formulario
      </a>
    </div>
  );
}