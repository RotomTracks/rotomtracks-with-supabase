/**
 * Spanish translations for UI components
 */

export const ui = {
  // Common UI elements
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
    goToDashboard: "Ir al Dashboard",
    backToSite: "Volver al sitio",
    backToTournaments: "Volver a Torneos",
    requestNew: "Solicitar Nuevo",
    approve: "Aprobar",
    reject: "Rechazar",
    refresh: "Actualizar"
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
    disabled: "Deshabilitado",
    unknown: "Desconocido",
    approved: "Aprobado",
    rejected: "Rechazado",
    underReview: "En Revisión"
  },

  // Form elements
  form: {
    required: "Campo requerido",
    optional: "Opcional",
    invalidEmail: "Dirección de email inválida",
    invalidUrl: "URL inválida",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    fieldRequired: "Este campo es requerido",
    selectOption: "Selecciona una opción",
    noOptions: "No hay opciones disponibles",
    searchPlaceholder: "Buscar...",
    loading: "Cargando...",
    submit: "Enviar",
    cancel: "Cancelar",
    reset: "Restablecer",
    save: "Guardar",
    update: "Actualizar",
    create: "Crear",
    edit: "Editar",
    delete: "Eliminar",
    confirm: "Confirmar",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar"
  },

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
    languageOptions: "Opciones de idioma",
    admin: "Admin",
    settings: "Configuración"
  },

  // Messages and notifications
  messages: {
    success: {
      saved: "Cambios guardados exitosamente",
      created: "Creado exitosamente",
      updated: "Actualizado exitosamente",
      deleted: "Eliminado exitosamente",
      uploaded: "Archivo subido exitosamente",
      sent: "Mensaje enviado exitosamente"
    },
    error: {
      generic: "Ocurrió un error",
      network: "Error de red. Por favor verifica tu conexión.",
      unauthorized: "No estás autorizado para realizar esta acción",
      forbidden: "Acceso denegado",
      notFound: "Recurso no encontrado",
      serverError: "Error del servidor. Por favor intenta más tarde.",
      validation: "Por favor revisa el formulario en busca de errores",
      timeout: "La solicitud expiró. Por favor intenta de nuevo.",
      unknown: "Ocurrió un error desconocido"
    },
    warning: {
      unsavedChanges: "Tienes cambios sin guardar",
      confirmDelete: "¿Estás seguro de que quieres eliminar este elemento?",
      dataLoss: "Esta acción puede causar pérdida de datos"
    },
    info: {
      noData: "No hay datos disponibles",
      loading: "Cargando datos...",
      processing: "Procesando...",
      success: "Operación completada exitosamente"
    }
  },

  // Pagination
  pagination: {
    pageOfTotal: "Página {{page}} de {{totalPages}}",
    showingResults: "Mostrando {{start}} a {{end}} de {{total}} resultados",
    firstPage: "Primera página",
    lastPage: "Última página",
    nextPage: "Página siguiente",
    previousPage: "Página anterior",
    goToPage: "Ir a página",
    resultsPerPage: "Resultados por página"
  },

  // Accessibility
  accessibility: {
    closeModal: "Cerrar modal",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    toggleTheme: "Cambiar tema",
    skipToContent: "Saltar al contenido principal",
    loading: "Cargando contenido",
    error: "Ocurrió un error",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información",
    hidePassword: "Ocultar contraseña",
    showPassword: "Mostrar contraseña"
  }
} as const;
