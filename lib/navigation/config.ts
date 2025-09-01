import { BreadcrumbItem } from "@/components/navigation/PageNavigation";

export interface NavigationConfig {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  backButton?: {
    text: string;
    href: string;
    fallback?: string;
  };
}

// Page-specific navigation configurations
export const NAVIGATION_CONFIGS: Record<string, NavigationConfig> = {
  dashboard: {
    title: "Dashboard",
    description: "Tu panel de control para gestionar torneos y participaciones",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Dashboard", href: "/dashboard", current: true }
    ],
    backButton: {
      text: "Volver al inicio",
      href: "/",
    }
  },
  tournaments: {
    title: "Torneos de Pokémon", 
    description: "Descubre y participa en torneos de TCG, VGC y Pokémon GO",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Torneos", href: "/tournaments", current: true }
    ],
    backButton: {
      text: "Volver al inicio",
      href: "/",
    }
  },
  profile: {
    title: "Mi Perfil",
    description: "Gestiona tu información personal y configuración de cuenta",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Mi Perfil", href: "/profile", current: true }
    ],
    backButton: {
      text: "Volver al inicio", 
      href: "/",
    }
  }
};

// Helper function to get navigation config with fallback
export function getNavigationConfig(page: string): NavigationConfig {
  const config = NAVIGATION_CONFIGS[page];
  
  if (!config) {
    // Fallback configuration for unknown pages
    return {
      title: "Página",
      breadcrumbs: [
        { label: "Inicio", href: "/" },
        { label: "Página", href: "#", current: true }
      ],
      backButton: {
        text: "Volver al inicio",
        href: "/",
      }
    };
  }
  
  return config;
}

// Helper function to create dynamic breadcrumbs
export function createBreadcrumbs(items: Array<{ label: string; href: string }>): BreadcrumbItem[] {
  return items.map((item, index) => ({
    ...item,
    current: index === items.length - 1
  }));
}

// Helper function for tournament-specific navigation
export function getTournamentNavigationConfig(tournamentName?: string): NavigationConfig {
  const baseBreadcrumbs = [
    { label: "Inicio", href: "/" },
    { label: "Torneos", href: "/tournaments" }
  ];

  if (tournamentName) {
    return {
      title: tournamentName,
      description: "Detalles del torneo y gestión",
      breadcrumbs: [
        ...baseBreadcrumbs,
        { label: tournamentName, href: "#", current: true }
      ],
      backButton: {
        text: "Volver a torneos",
        href: "/tournaments",
      }
    };
  }

  return NAVIGATION_CONFIGS.tournaments;
}

// Navigation error handling
export function handleNavigationError(error: Error, fallbackHref: string = "/"): void {
  console.error("Navigation error:", error);
  
  // In a real app, you might want to log this to an error tracking service
  // For now, we'll just redirect to the fallback
  if (typeof window !== 'undefined') {
    window.location.href = fallbackHref;
  }
}