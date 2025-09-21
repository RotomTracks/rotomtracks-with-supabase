/**
 * Spanish translations for common UI elements
 */

export const common = {
  // Navigation
  navigation: {
    home: "Inicio",
    tournaments: "Torneos",
    profile: "Perfil",
    dashboard: "Panel",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    signUp: "Registrarse",
    language: "Idioma actual: {{current}}",
    languageOptions: "Opciones de idioma"
  },

  // Common buttons and actions
  buttons: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    update: "Actualizar",
    submit: "Enviar",
    reset: "Restablecer",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    close: "Cerrar",
    open: "Abrir",
    view: "Ver",
    download: "Descargar",
    upload: "Subir",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    continue: "Continuar",
    finish: "Finalizar",
    confirm: "Confirmar",
    retry: "Reintentar",
    reload: "Recargar",
    reloadPage: "Recargar página",
    continueWithoutAuth: "Continuar sin autenticación",
    understood: "Entendido",
    goBack: "Volver",
    backToHome: "Volver al Inicio",
    backToTournaments: "Volver a Torneos",
    requestNew: "Solicitar Nuevo"
  },

  // Status and states
  status: {
    loading: "Cargando...",
    saving: "Guardando...",
    deleting: "Eliminando...",
    updating: "Actualizando...",
    processing: "Procesando...",
    success: "Éxito",
    error: "Error",
    warning: "Advertencia",
    info: "Información",
    pending: "Pendiente",
    completed: "Completado",
    cancelled: "Cancelado",
    active: "Activo",
    inactive: "Inactivo",
    enabled: "Habilitado",
    disabled: "Deshabilitado"
  },

  // Form elements
  form: {
    required: "Obligatorio",
    optional: "Opcional",
    placeholder: "Ingresa aquí...",
    select: "Seleccionar...",
    selectOption: "Selecciona una opción",
    noOptions: "No hay opciones disponibles",
    search: "Buscar...",
    searchResults: "Resultados de búsqueda",
    noResults: "No se encontraron resultados",
    showMore: "Mostrar más",
    showLess: "Mostrar menos",
    selectAll: "Seleccionar todo",
    deselectAll: "Deseleccionar todo"
  },

  // Time and dates
  time: {
    now: "Ahora",
    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",
    thisWeek: "Esta semana",
    lastWeek: "Semana pasada",
    nextWeek: "Próxima semana",
    thisMonth: "Este mes",
    lastMonth: "Mes pasado",
    nextMonth: "Próximo mes",
    thisYear: "Este año",
    lastYear: "Año pasado",
    nextYear: "Próximo año"
  },

  // Common messages
  messages: {
    welcome: "¡Bienvenido!",
    goodbye: "¡Hasta luego!",
    thankYou: "¡Gracias!",
    pleaseWait: "Por favor espera...",
    comingSoon: "Próximamente",
    underMaintenance: "En mantenimiento",
    notFound: "No encontrado",
    accessDenied: "Acceso denegado",
    sessionExpired: "Sesión expirada",
    networkError: "Error de conexión",
    serverError: "Error del servidor",
    unknownError: "Error desconocido",
    unexpectedError: "Ocurrió un error inesperado",
    tryAgain: "Inténtalo de nuevo",
    contactSupport: "Contacta soporte",
    accountCreated: "¡Cuenta creada exitosamente! Por favor revisa tu email para confirmar tu cuenta."
  },

  // UI interactions
  ui: {
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    showConfirmPassword: "Mostrar confirmar contraseña",
    hideConfirmPassword: "Ocultar confirmar contraseña",
    edit: "Editar",
    copy: "Copiar datos",
    copied: "¡Copiado!",
    copyError: "Error al copiar al portapapeles"
  },

  // Account types
  account: {
    playerAccount: "Cuenta de Jugador",
    organizerAccount: "Cuenta de Organizador",
    organizerApproved: "Cuenta de Organizador Aprobada"
  },

  // Pagination
  pagination: {
    page: "Página",
    of: "de",
    items: "elementos",
    itemsPerPage: "elementos por página",
    first: "Primera",
    last: "Última",
    showing: "Mostrando",
    to: "a",
    total: "total"
  },

  // Confirmation dialogs
  confirmation: {
    areYouSure: "¿Estás seguro?",
    thisActionCannotBeUndone: "Esta acción no se puede deshacer",
    confirmDelete: "¿Confirmas que quieres eliminar esto?",
    confirmCancel: "¿Confirmas que quieres cancelar?",
    unsavedChanges: "Tienes cambios sin guardar",
    loseChanges: "¿Quieres salir sin guardar los cambios?"
  },

  // File handling
  file: {
    upload: "Subir archivo",
    download: "Descargar archivo",
    delete: "Eliminar archivo",
    size: "Tamaño",
    type: "Tipo",
    name: "Nombre",
    lastModified: "Última modificación",
    dragAndDrop: "Arrastra y suelta archivos aquí",
    browseFiles: "Examinar archivos",
    maxSize: "Tamaño máximo",
    allowedTypes: "Tipos permitidos",
    uploadSuccess: "Archivo subido exitosamente",
    uploadError: "Error al subir archivo",
    invalidType: "Tipo de archivo no válido",
    fileTooLarge: "Archivo demasiado grande"
  },

  // Validation messages
  validation: {
    required: "Este campo es requerido",
    firstNameRequired: "El nombre es requerido",
    firstNameMinLength: "El nombre debe tener al menos 2 caracteres",
    lastNameRequired: "El apellido es requerido",
    lastNameMinLength: "El apellido debe tener al menos 2 caracteres",
    playerIdRequired: "El Player ID es requerido",
    playerIdMinLength: "El Player ID debe tener al menos 3 caracteres",
    birthYearRequired: "El año de nacimiento es requerido",
    birthYearInvalid: "El año de nacimiento debe ser un año válido entre 1900 y el año actual",
    organizationNameRequired: "El nombre de la organización es requerido al solicitar rol de organizador",
    invalidUrl: "Por favor ingresa una URL válida",
    invalidProtocol: "La URL debe comenzar con http:// o https://"
  },

  // Page specific
  pages: {
    home: {
      loading: "Cargando Rotom Tracks...",
      loadingTooLong: "La aplicación está tardando más de lo esperado en cargar...",
      connectionError: "Error de conexión: {{error}}",
      loadingAuth: "Cargando autenticación..."
    },
    profile: {
      title: "Mi Perfil",
      updateProfile: "Actualizar Perfil",
      completeProfile: "Completar Perfil"
    },
    tournaments: {
      title: "Torneos"
    },
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
    authError: {
      title: "Error de Autenticación",
      description: "Hubo un problema con tu enlace de autenticación.",
      expired: "El enlace de confirmación ha expirado. Por favor solicita uno nuevo.",
      invalid: "El enlace de confirmación es inválido o ya ha sido usado.",
      requestNewConfirmation: "Solicitar Nueva Confirmación"
    },
    debug: {
      title: "Diagnóstico de Supabase",
      description: "Depura tu conexión y configuración de Supabase",
      helpText: "Esta herramienta de diagnóstico ayuda a identificar problemas de conexión con Supabase. Si ves errores, verifica tus variables de entorno y conexión de red."
    }
  }
} as const;