"use client";

import { useTypedTranslation } from "@/lib/i18n";

export function SkipLinks() {
  const { tUI } = useTypedTranslation();

  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {tUI('accessibility.skipToContent')}
      </a>
      <a 
        href="#navigation" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:mt-12"
      >
        {tUI('accessibility.skipToNavigation')}
      </a>
    </>
  );
}
