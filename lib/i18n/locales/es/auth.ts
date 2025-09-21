/**
 * Spanish translations for authentication forms and messages
 */

export const auth = {
  // Login Form
  login: {
    title: "Iniciar Sesión",
    description: "Ingresa tus credenciales para acceder a tu cuenta",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    emailHelp: "Ingresa el correo electrónico que usaste para registrarte",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Tu contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    submitButton: "Iniciar Sesión",
    loadingButton: "Iniciando sesión...",
    signUpLink: "¿No tienes cuenta?",
    signUpLinkText: "Regístrate"
  },

  // Sign Up Form
  signUp: {
    title: "Crear Cuenta",
    description: "Únete a la comunidad de torneos Pokémon",
    personalInfoTitle: "Información personal",
    accountTypeTitle: "Tipo de cuenta",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Mínimo 6 caracteres",
    confirmPasswordLabel: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Repite tu contraseña",
    firstNameLabel: "Nombre",
    firstNamePlaceholder: "Tu nombre",
    lastNameLabel: "Apellidos",
    lastNamePlaceholder: "Tus apellidos",
    playerIdLabel: "Player ID",
    playerIdPlaceholder: "Tu Player ID (número)",
    playerIdHelp: "Tu identificador único como jugador de Pokémon",
    birthYearLabel: "Año de nacimiento",
    birthYearPlaceholder: "YYYY",
    userRoleLabel: "Tipo de cuenta",
    userRolePlaceholder: "Selecciona un tipo de cuenta",
    submitButton: "Crear Cuenta",
    loadingButton: "Creando cuenta...",
    loginLink: "¿Ya tienes cuenta?",
    loginLinkText: "Inicia sesión",
    
    // Simple form translations
    simpleTitle: "Registrarse",
    simpleDescription: "Crear una nueva cuenta",
    simpleEmailLabel: "Email",
    simpleEmailPlaceholder: "m@ejemplo.com",
    simplePasswordLabel: "Contraseña",
    repeatPasswordLabel: "Repetir Contraseña",
    simpleSubmitButton: "Registrarse",
    simpleLoadingButton: "Creando cuenta...",
    simpleLoginLink: "¿Ya tienes una cuenta?",
    simpleLoginLinkText: "Iniciar sesión",
    
    // Role Selection
    roles: {
      player: {
        label: "Jugador",
        description: "Participa en torneos y eventos"
      },
      organizer: {
        label: "Organizador",
        description: "Organiza y gestiona torneos"
      }
    },

    // Organizer Fields
    organizer: {
      sectionTitle: "Información de Organizador",
      sectionDescription: "Información adicional requerida para organizadores",
      welcomeTitle: "¡Bienvenido como organizador!",
      organizationNameLabel: "Nombre de la Liga/Tienda",
      organizationNamePlaceholder: "Nombre de tu liga/tienda/organización",
      organizationNameExample: "Ejemplo: Liga Pokémon Madrid, Tienda Cartas Mágicas, Club Pokémon Universidad",
      businessEmailLabel: "Email de contacto",
      businessEmailPlaceholder: "contacto@tuliga.com (opcional)",
      businessEmailHelp: "Email de contacto para tu liga o tienda",
      phoneNumberLabel: "Teléfono de contacto",
      phoneNumberPlaceholder: "+34 XXX XXX XXX (opcional)",
      phoneNumberHelp: "Teléfono de contacto para tu liga o tienda",
      addressLabel: "Dirección",
      addressPlaceholder: "Dirección de tu liga o tienda (opcional)",
      pokemonLeagueUrlLabel: "Enlace Oficial de la Liga/Tienda",
      pokemonLeagueUrlPlaceholder: "https://www.pokemon.com/es/play-pokemon/... (opcional)",
      pokemonLeagueUrlHelp: "URL oficial de tu liga en el sitio de Pokémon",
      experienceDescriptionLabel: "Experiencia como organizador",
      experienceDescriptionPlaceholder: "Describe tu experiencia organizando eventos... (opcional)",
      experienceDescriptionHelp: "Cuéntanos sobre tu experiencia organizando torneos o eventos",
      importantInfoTitle: "Información importante",
      importantInfoDescription: "Tu cuenta será revisada por nuestro equipo antes de activar las funciones de organizador. Esto puede tomar 1-2 días hábiles. Mientras tanto, podrás usar todas las funciones de jugador.",
      benefits: {
        title: "Beneficios como organizador:",
        items: [
          "Crear y gestionar torneos",
          "Acceso a herramientas de organización",
          "Reportes y estadísticas avanzadas",
          "Soporte prioritario"
        ]
      },
      responsibilities: {
        title: "Responsabilidades:",
        items: [
          "Seguir las reglas oficiales de Pokémon",
          "Mantener un ambiente justo y divertido",
          "Reportar resultados de manera precisa",
          "Respetar las políticas de la plataforma"
        ]
      }
    }
  },

  // Password Reset
  passwordReset: {
    title: "Recuperar Contraseña",
    description: "Ingresa tu correo electrónico para recibir un enlace de recuperación",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    submitButton: "Enviar enlace",
    loadingButton: "Enviando...",
    backToLogin: "Volver al inicio de sesión",
    success: {
      title: "Enlace enviado",
      description: "Revisa tu correo electrónico para el enlace de recuperación"
    }
  },

  // Update Password
  updatePassword: {
    title: "Actualizar Contraseña",
    description: "Ingresa tu nueva contraseña",
    passwordLabel: "Nueva contraseña",
    passwordPlaceholder: "Mínimo 6 caracteres",
    confirmPasswordLabel: "Confirmar nueva contraseña",
    confirmPasswordPlaceholder: "Repite tu nueva contraseña",
    submitButton: "Actualizar contraseña",
    loadingButton: "Actualizando...",
    loadingSession: "Verificando sesión..."
  },

  // Validation Messages
  validation: {
    emailRequired: "El correo electrónico es obligatorio",
    emailInvalid: "Ingresa un correo electrónico válido",
    passwordRequired: "La contraseña es obligatoria",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    passwordsNoMatch: "Las contraseñas no coinciden",
    firstNameRequired: "El nombre es obligatorio",
    lastNameRequired: "Los apellidos son obligatorios",
    playerIdRequired: "El Player ID es obligatorio",
    playerIdInvalid: "El Player ID debe ser un número entre 1 y 9999999",
    birthYearRequired: "El año de nacimiento es obligatorio",
    birthYearInvalid: "Ingresa un año válido (ej: 1990)",
    birthYearTooOld: "Debes tener menos de 100 años",
    birthYearTooYoung: "Debes tener al menos 13 años",
    userRoleRequired: "Selecciona un tipo de cuenta",
    organizationNameRequired: "El nombre de la organización es obligatorio para organizadores",
    organizationNameTooShort: "El nombre de la organización debe tener al menos 2 caracteres"
  },

  // Error Messages
  errors: {
    generic: "Ha ocurrido un error. Inténtalo de nuevo",
    networkError: "Error de conexión. Verifica tu internet",
    serverError: "Error del servidor. Inténtalo más tarde",
    invalidCredentials: "Credenciales incorrectas",
    emailAlreadyExists: "Ya existe una cuenta con este correo electrónico",
    playerIdAlreadyExists: "Este Player ID ya está en uso",
    weakPassword: "La contraseña es muy débil",
    tooManyRequests: "Demasiados intentos. Espera un momento",
    sessionExpired: "Tu sesión ha expirado. Inicia sesión nuevamente",
    emailNotConfirmed: "Confirma tu correo electrónico antes de continuar",
    accountDisabled: "Tu cuenta ha sido deshabilitada. Contacta soporte",
    passwordsDoNotMatch: "Las contraseñas no coinciden"
  },

  // Success Messages
  success: {
    loginSuccess: "¡Bienvenido de vuelta!",
    signUpSuccess: "¡Cuenta creada exitosamente!",
    passwordResetSent: "Enlace de recuperación enviado",
    passwordUpdated: "Contraseña actualizada exitosamente",
    emailConfirmed: "Correo electrónico confirmado"
  },

  // Profile
  profile: {
    noPlayerId: "Sin Player ID"
  },

  // Buttons
  buttons: {
    cancel: "Cancelar",
    understood: "Entendido"
  }
} as const;