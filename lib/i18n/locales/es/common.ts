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
    retry: "Reintentar"
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
    tryAgain: "Inténtalo de nuevo",
    contactSupport: "Contacta soporte"
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
  }
} as const;