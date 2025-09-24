'use client';

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTypedTranslation } from "@/lib/i18n";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function DashboardHeader({ 
  title, 
  description, 
  className = "" 
}: DashboardHeaderProps) {
  const { tPages } = useTypedTranslation();

  return (
    <div className={`space-y-4 mb-8 ${className}`}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb navigation" className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
            tabIndex={0}
          >
            {tPages('dashboard.navigation.home')}
          </Link>
          <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" aria-hidden="true" />
          <span 
            className="font-medium text-foreground"
            aria-current="page"
          >
            {tPages('dashboard.navigation.dashboard')}
          </span>
        </div>

        {/* Language and Theme Selectors */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSelector variant="compact" />
        </div>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 break-words">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
