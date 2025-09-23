/**
 * Spanish translations for forms and validation
 */

export const forms = {
  // Common form labels
  labels: {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Email",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    phone: "Teléfono",
    birthYear: "Año de Nacimiento",
    playerId: "ID de Jugador",
    organizationName: "Nombre de la Organización",
    experienceDescription: "Descripción de Experiencia",
    pokemonLeagueUrl: "URL de Liga Pokémon",
    tournamentName: "Nombre del Torneo",
    tournamentType: "Tipo de Torneo",
    city: "Ciudad",
    startDate: "Fecha de Inicio",
    endDate: "Fecha de Fin",
    maxParticipants: "Máximo de Participantes",
    description: "Descripción",
    rules: "Reglas",
    prizes: "Premios",
    entryFee: "Cuota de Inscripción",
    registrationDeadline: "Fecha Límite de Inscripción",
    checkInTime: "Hora de Check-in",
    startTime: "Hora de Inicio"
  },

  // Placeholders
  placeholders: {
    firstName: "Ingresa tu nombre",
    lastName: "Ingresa tu apellido",
    email: "Ingresa tu dirección de email",
    password: "Ingresa tu contraseña",
    confirmPassword: "Confirma tu contraseña",
    phone: "Ingresa tu número de teléfono",
    birthYear: "Selecciona tu año de nacimiento",
    playerId: "Ingresa tu ID de Jugador",
    organizationName: "Ingresa el nombre de la organización",
    experienceDescription: "Describe tu experiencia organizando torneos",
    pokemonLeagueUrl: "Ingresa tu URL de Liga Pokémon",
    tournamentName: "Ingresa el nombre del torneo",
    city: "Ingresa el nombre de la ciudad",
    description: "Ingresa la descripción del torneo",
    rules: "Ingresa las reglas del torneo",
    prizes: "Describe los premios",
    entryFee: "Ingresa el monto de la cuota de inscripción",
    search: "Buscar...",
    searchTournaments: "Buscar torneos por nombre, ciudad, tipo...",
    searchUsers: "Buscar usuarios...",
    searchOrganizations: "Buscar organizaciones..."
  },

  // Validation messages
  validation: {
    required: "Este campo es requerido",
    email: "Por favor ingresa una dirección de email válida",
    url: "Por favor ingresa una URL válida",
    minLength: "Debe tener al menos {{min}} caracteres",
    maxLength: "No debe tener más de {{max}} caracteres",
    min: "Debe ser al menos {{min}}",
    max: "No debe ser más de {{max}}",
    pattern: "Por favor ingresa un formato válido",
    passwordMismatch: "Las contraseñas no coinciden",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres",
    passwordTooLong: "La contraseña no debe tener más de 128 caracteres",
    passwordWeak: "La contraseña es muy débil. Por favor incluye mayúsculas, minúsculas, números y símbolos",
    phoneInvalid: "Por favor ingresa un número de teléfono válido",
    dateInvalid: "Por favor ingresa una fecha válida",
    datePast: "La fecha debe ser en el futuro",
    dateTooFar: "La fecha es muy lejana en el futuro",
    numberInvalid: "Por favor ingresa un número válido",
    positiveNumber: "Debe ser un número positivo",
    integer: "Debe ser un número entero",
    fileSize: "El tamaño del archivo debe ser menor a {{maxSize}}",
    fileType: "Tipo de archivo no soportado",
    fileRequired: "Por favor selecciona un archivo",
    termsAccepted: "Debes aceptar los términos y condiciones",
    ageRestriction: "Debes tener al menos 13 años",
    uniqueEmail: "Este email ya está registrado",
    uniquePlayerId: "Este ID de Jugador ya está en uso",
    uniqueOrganizationName: "Este nombre de organización ya está en uso"
  },

  // Form sections
  sections: {
    personalInfo: "Información Personal",
    contactInfo: "Información de Contacto",
    accountInfo: "Información de Cuenta",
    organizerInfo: "Información de Organizador",
    tournamentInfo: "Información del Torneo",
    locationInfo: "Información de Ubicación",
    scheduleInfo: "Información de Horarios",
    rulesInfo: "Reglas y Regulaciones",
    prizesInfo: "Premios y Reconocimientos",
    additionalInfo: "Información Adicional"
  },

  // Form actions
  actions: {
    save: "Guardar",
    saveAndContinue: "Guardar y Continuar",
    saveDraft: "Guardar Borrador",
    submit: "Enviar",
    submitForReview: "Enviar para Revisión",
    cancel: "Cancelar",
    reset: "Restablecer",
    clear: "Limpiar",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
    close: "Cerrar",
    edit: "Editar",
    update: "Actualizar",
    delete: "Eliminar",
    duplicate: "Duplicar",
    preview: "Vista Previa",
    publish: "Publicar",
    unpublish: "Despublicar"
  },

  // Form states
  states: {
    loading: "Cargando formulario...",
    saving: "Guardando...",
    submitting: "Enviando...",
    processing: "Procesando...",
    success: "Formulario enviado exitosamente",
    error: "Error al enviar el formulario",
    validationError: "Por favor corrige los errores a continuación",
    networkError: "Error de red. Por favor intenta de nuevo.",
    timeoutError: "La solicitud expiró. Por favor intenta de nuevo."
  },

  // File upload
  fileUpload: {
    dragAndDrop: "Arrastra y suelta archivos aquí, o haz clic para seleccionar",
    selectFiles: "Seleccionar Archivos",
    uploadProgress: "Subiendo... {{progress}}%",
    uploadComplete: "Subida completada",
    uploadError: "Error en la subida",
    fileTooLarge: "El archivo es muy grande",
    fileTypeNotSupported: "Tipo de archivo no soportado",
    maxFilesExceeded: "Se excedió el número máximo de archivos",
    removeFile: "Eliminar archivo",
    replaceFile: "Reemplazar archivo"
  },

  // Search and filters
  search: {
    placeholder: "Buscar...",
    noResults: "No se encontraron resultados",
    clearSearch: "Limpiar búsqueda",
    searchSuggestions: "Sugerencias de búsqueda",
    recentSearches: "Búsquedas recientes",
    popularSearches: "Búsquedas populares"
  },

  filters: {
    all: "Todos",
    none: "Ninguno",
    selectAll: "Seleccionar Todo",
    clearFilters: "Limpiar Filtros",
    applyFilters: "Aplicar Filtros",
    filterBy: "Filtrar por {{field}}",
    sortBy: "Ordenar por {{field}}",
    ascending: "Ascendente",
    descending: "Descendente"
  }
} as const;
