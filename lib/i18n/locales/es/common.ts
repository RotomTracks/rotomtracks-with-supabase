/**
 * Spanish translations for common UI elements
 */

export const common = {
  // Language options
  languageOptions: "Opciones de idioma",

  // Profile
  profile: {
    title: "Mi Perfil",
    updateProfile: "Actualizar Perfil",
    completeProfile: "Completar Perfil"
  },

  // Tournaments
  tournaments: {
    title: "Torneos"
  },

  // Unauthorized access messages
  unauthorized: {
    organizerRequired: {
      title: "Acceso de Organizador Requerido",
      description: "Esta función solo está disponible para organizadores de torneos.",
      suggestion: "Si necesitas organizar torneos, por favor actualiza tu tipo de cuenta en la configuración de tu perfil."
    },
    playerRequired: {
      title: "Acceso de Jugador Requerido",
      description: "Esta función solo está disponible para jugadores registrados.",
      suggestion: "Por favor asegúrate de que tu cuenta esté configurada como cuenta de jugador."
    },
    accessDenied: {
      title: "Acceso Denegado",
      description: "No tienes permisos para acceder a esta página.",
      suggestion: "Por favor verifica los permisos de tu cuenta o contacta soporte si crees que esto es un error."
    }
  },

  // Authentication errors
  authError: {
    title: "Error de Autenticación",
    description: "Hubo un problema con tu enlace de autenticación.",
    expired: "El enlace de confirmación ha expirado. Por favor solicita uno nuevo.",
    invalid: "El enlace de confirmación es inválido o ya ha sido usado.",
    requestNewConfirmation: "Solicitar Nueva Confirmación"
  },

  // Debug
  debug: {
    title: "Diagnóstico de Supabase",
    description: "Depura tu conexión y configuración de Supabase",
    helpText: "Esta herramienta de diagnóstico ayuda a identificar problemas de conexión con Supabase. Si ves errores, verifica tus variables de entorno y conexión de red."
  }
} as const;