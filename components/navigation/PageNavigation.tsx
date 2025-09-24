'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface PageNavigationProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageNavigation({
  title,
  description,
  showBackButton = false,
  backButtonText = "Volver",
  backButtonHref,
  breadcrumbs = [],
  actions,
  className,
}: PageNavigationProps) {
  const router = useRouter();

  const handleBackNavigation = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      // Fall back to browser history or home
      if (window.history.length > 1) {
        window.history.back();
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className={cn("space-y-4 mb-8", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb navigation" className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" aria-hidden="true" />
              )}
              {item.current ? (
                <span 
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
                  tabIndex={0}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header with back button and actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackNavigation}
              className="flex-shrink-0 mt-1"
              aria-label={`${backButtonText}${backButtonHref ? ` to ${backButtonHref}` : ''}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButtonText}
            </Button>
          )}
          
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

        {/* Actions area */}
        {actions && (
          <div className="flex-shrink-0 flex items-start gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience component for common home breadcrumb
export function HomePageNavigation(props: Omit<PageNavigationProps, 'breadcrumbs'> & { 
  currentPageLabel: string;
  currentPageHref: string;
}) {
  const { currentPageLabel, currentPageHref, ...rest } = props;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: currentPageLabel, href: currentPageHref, current: true }
  ];

  return (
    <PageNavigation
      {...rest}
      breadcrumbs={breadcrumbs}
      backButtonHref="/"
      backButtonText="Volver al inicio"
    />
  );
}
