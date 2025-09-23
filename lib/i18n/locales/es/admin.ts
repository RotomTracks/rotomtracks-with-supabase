/**
 * Spanish translations for admin panel
 */

export const admin = {
  // General admin
  panel: "Panel de Administración",
  verifyingPermissions: "Verificando permisos de administrador...",
  accessRestricted: "Acceso Restringido",
  accessRestrictedDescription: "Esta área está reservada para administradores del sistema. No tienes los permisos necesarios para acceder a esta sección.",

  // Navigation
  navigation: {
    dashboard: "Dashboard",
    dashboardDescription: "Vista general y métricas",
    organizerRequests: "Solicitudes de Organizador",
    organizerRequestsDescription: "Gestionar solicitudes de organizador",
    settings: "Configuración",
    settingsDescription: "Configuración del sistema"
  },

  // Dashboard
  dashboard: {
    title: "Métricas del Sistema",
    lastUpdated: "Última actualización",
    noData: "No hay datos disponibles",
    loading: "Cargando...",
    metrics: {
      totalRequests: "Total de Solicitudes",
      totalRequestsDescription: "Todas las solicitudes registradas",
      pending: "Pendientes",
      pendingDescription: "Esperando revisión",
      approved: "Aprobadas",
      approvedDescription: "Solicitudes aprobadas",
      underReview: "En Revisión",
      underReviewDescription: "Siendo revisadas"
    },
    recentActivity: {
      title: "Actividad Reciente",
      description: "Últimas acciones realizadas por administradores",
      viewAll: "Ver todas las solicitudes",
      empty: "No hay actividad reciente"
    },
    error: {
      title: "Error al cargar el dashboard",
      loading: "Error al cargar datos del dashboard",
      invalidData: "Datos del dashboard no válidos"
    },
    empty: {
      title: "No hay datos disponibles",
      description: "Las tablas de administración aún no han sido configuradas o no contienen datos."
    }
  },

  // Organizer Requests
  organizerRequests: {
    title: "Solicitudes de Organizador",
    description: "Gestionar solicitudes de organizador",
    searchPlaceholder: "Buscar por nombre de organización o solicitante...",
    filterPlaceholder: "Filtrar por estado",
    loading: "Cargando...",
    requestedBy: "Solicitado por",
    organization: "Organización",
    reviewed: "Revisado",
    adminNotes: "Notas del Administrador",
    unknownUser: "Usuario Desconocido",
    resultsSummary: "Mostrando {{count}} de {{total}} solicitudes{{statusFilter}}{{searchTerm}}",
    filters: {
      title: "Filtros y Búsqueda",
      description: "Buscar y filtrar solicitudes de organizador",
      allStatuses: "Todos los Estados"
    },
    error: {
      loading: "Error al cargar solicitudes",
      updateFailed: "Error al actualizar solicitud"
    },
    empty: {
      title: "No se encontraron solicitudes de organizador",
      description: "No hay solicitudes de organizador en este momento.",
      descriptionFiltered: "No hay solicitudes que coincidan con tus filtros actuales. Intenta ajustar tus criterios de búsqueda."
    }
  },

  // Settings
  settings: {
    title: "Configuración del Sistema",
    description: "Gestionar la configuración general de la plataforma",
    general: {
      title: "Configuración General",
      description: "Configuración básica del sitio web",
      siteName: "Nombre del Sitio",
      siteNamePlaceholder: "Ingresa el nombre del sitio",
      siteDescription: "Descripción del Sitio",
      siteDescriptionPlaceholder: "Ingresa la descripción del sitio"
    },
    system: {
      title: "Configuración del Sistema",
      description: "Configuración del comportamiento del sistema",
      maintenanceMode: "Modo Mantenimiento",
      maintenanceModeDescription: "Activar modo mantenimiento para todos los usuarios",
      allowRegistration: "Permitir Registro",
      allowRegistrationDescription: "Permitir que nuevos usuarios se registren",
      requireEmailVerification: "Verificación de Email Requerida",
      requireEmailVerificationDescription: "Requerir verificación de email para activar cuentas"
    },
    tournaments: {
      title: "Configuración de Torneos",
      description: "Configuración relacionada con torneos",
      maxTournamentsPerUser: "Máximo de Torneos por Usuario",
      maxTournamentsPerUserDescription: "Número máximo de torneos que un usuario puede organizar",
      autoApproveOrganizers: "Aprobar Organizadores Automáticamente",
      autoApproveOrganizersDescription: "Aprobar automáticamente las solicitudes de organizador"
    },
    notifications: {
      title: "Configuración de Notificaciones",
      description: "Configuración de notificaciones del sistema",
      enableNotifications: "Habilitar Notificaciones",
      enableNotificationsDescription: "Enviar notificaciones por email a los usuarios"
    },
    analytics: {
      enableAnalytics: "Habilitar Analytics",
      enableAnalyticsDescription: "Recopilar datos de uso para mejorar la plataforma"
    },
    actions: {
      title: "Acciones",
      description: "Guardar o restablecer la configuración",
      save: "Guardar Configuración",
      saving: "Guardando...",
      reset: "Restablecer Valores"
    }
  },

  // Activity types
  activity: {
    status_changed: "{{adminName}} cambió el estado de {{organizationName}} de {{previousStatus}} a {{newStatus}}",
    notes_added: "{{adminName}} agregó notas a {{organizationName}}",
    user_role_assigned: "{{adminName}} asignó rol al usuario"
  }
} as const;
