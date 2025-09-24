/**
 * Spanish translations for main pages
 */

export const pages = {
  // Home page
  home: {
    navigation: {
      tournaments: "Torneos",
      dashboard: "Dashboard"
    },
    hero: {
      title: "Gestiona y Descubre Torneos de Pokémon",
      subtitle: "La plataforma completa para organizadores y jugadores. Busca torneos, gestiona participaciones y accede a resultados detallados.",
      myDashboard: "Mi Dashboard",
      exploreTournaments: "Explorar Torneos",
      joinFree: "Únete Gratis",
      viewTournaments: "Ver Torneos"
    },
    search: {
      title: "Encuentra tu próximo torneo",
      subtitle: "Busca entre miles de torneos de TCG, VGC y Pokémon GO",
      placeholder: "Buscar torneos por nombre, ciudad, tipo...",
      activeTournaments: "Torneos activos",
      openRegistrations: "Inscripciones abiertas",
      detectingLocation: "Detectando...",
      detectLocation: "Detectar ubicación",
      viewAllTournaments: "Ver todos los torneos →"
    },
    stats: {
      tournaments: "Torneos registrados",
      players: "Jugadores activos",
      cities: "Ciudades"
    },
    location: {
      detected: "Ubicación detectada",
      showingTournaments: "Mostrando torneos en {{location}}"
    },
    sections: {
      featuredTournaments: "Torneos Destacados",
      featuredSubtitle: "Descubre los próximos torneos más populares y encuentra el perfecto para ti",
      notFound: "¿No encuentras lo que buscas?",
      notFoundSubtitle: "Explora nuestra base de datos completa de torneos o crea una alerta personalizada",
      exploreAll: "Explorar Todos los Torneos",
      createAccount: "Crear Cuenta para Alertas",
      trendsAndActivity: "Tendencias y Actividad",
      trendsSubtitle: "Descubre los tipos de torneos más populares y la actividad reciente en tu región",
      quickSearch: "Búsqueda rápida por formato",
      features: "Todo lo que necesitas para torneos de Pokémon",
      featuresSubtitle: "Desde la búsqueda hasta la gestión completa de resultados"
    },
    features: {
      search: {
        title: "Búsqueda Inteligente",
        description: "Encuentra torneos por nombre, ubicación, fecha y tipo con sugerencias en tiempo real.",
        items: {
          location: "Filtros avanzados",
          date: "Autocompletado",
          type: "Resultados relevantes"
        }
      },
      management: {
        title: "Gestión Profesional",
        description: "Herramientas completas para organizadores con procesamiento automático de archivos TDF.",
        items: {
          upload: "Procesamiento TDF",
          track: "Reportes HTML",
          results: "Gestión de participantes"
        }
      },
      community: {
        title: "Para Toda la Comunidad",
        description: "Soporte completo para TCG, VGC y Pokémon GO con perfiles personalizados.",
        items: {
          connect: "Múltiples formatos",
          share: "Perfiles de jugador",
          learn: "Historial de torneos"
        }
      },
      readyToJoin: "¿Listo para unirte a la comunidad?",
      createFreeAccount: "Crear Cuenta Gratis",
      exploreTournaments: "Explorar Torneos"
    },
    footer: {
      description: "La plataforma líder para torneos de Pokémon en España y Latinoamérica.",
      tournaments: "Torneos",
      searchTournaments: "Buscar Torneos",
      account: "Cuenta",
      profile: "Perfil",
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
      support: "Soporte",
      help: "Ayuda",
      contact: "Contacto",
      terms: "Términos",
      privacy: "Privacidad",
      copyright: "© 2024 RotomTracks. Todos los derechos reservados."
    }
  },

  // Dashboard page
  dashboard: {
    welcome: "¡Bienvenido, {{name}}!",
    organizerSubtitle: "Gestiona tus torneos y revisa los resultados",
    playerSubtitle: "Descubre torneos y sigue tus participaciones",
    searchTournaments: "Buscar Torneos",
    newTournament: "Nuevo Torneo",
    stats: {
      organizedTournaments: "Torneos Organizados",
      ongoing: "En Curso",
      completed: "Completados",
      totalParticipants: "Total Participantes",
      participations: "Participaciones",
      activeTournaments: "Torneos Activos",
      upcoming: "Próximos"
    },
    sections: {
      myTournaments: "Mis Torneos",
      myParticipations: "Mis Participaciones",
      organizerDescription: "Torneos que has organizado recientemente",
      playerDescription: "Torneos en los que has participado",
      recentTournaments: "Torneos Recientes",
      recentDescription: "Descubre torneos completados recientemente"
    },
    actions: {
      view: "Ver",
      manage: "Gestionar",
      viewResults: "Ver Resultados",
      viewAll: "Ver todos",
      viewMore: "Ver más torneos"
    },
    empty: {
      noTournamentsOrganized: "No has organizado ningún torneo aún",
      noParticipations: "No has participado en ningún torneo aún",
      noRecentTournaments: "No hay torneos recientes disponibles",
      exploreTournaments: "Explorar Torneos"
    },
    alerts: {
      completeProfile: "Completa tu perfil para obtener una mejor experiencia en la plataforma.",
      completeProfileAction: "Completar Perfil"
    }
  },

  // Profile page
  profile: {
    title: "Mi Perfil",
    backToHome: "Inicio",
    edit: "Editar",
    view: "Ver",
    loading: "Cargando...",
    welcomeMessage: "¡Bienvenido! Completa tu perfil para acceder a todas las funciones de RotomTracks.",
    noProfileFound: "No se encontró perfil. Creando uno nuevo...",
    descriptions: {
      complete: "Gestiona tu información personal y configuración de cuenta",
      incomplete: "Completa tu perfil para acceder a todas las funciones"
    },
    form: {
      updateProfile: "Actualizar Perfil",
      completeProfile: "Completar Perfil"
    },
    display: {
      incompleteProfile: "Perfil Incompleto",
      organizer: "Organizador",
      player: "Jugador",
      profileComplete: "Perfil completo",
      profilePercentComplete: "Perfil {{percent}}% completo",
      basicInfo: "Información Básica",
      copyData: "Copiar datos",
      copied: "¡Copiado!",
      playerId: "Player ID",
      email: "Email",
      birthYear: "Año de Nacimiento",
      memberSince: "Miembro desde",
      notSet: "No establecido",
      notSpecified: "No especificada",
      organizerInfo: "Información de Organizador",
      leagueStore: "Liga/Tienda",
      officialLink: "Enlace Oficial",
      viewLeagueStore: "Ver Liga/Tienda",
      organizerPrivileges: "Privilegios de Organizador:",
      organizerPrivilegesList: [
        "Crear y gestionar torneos",
        "Subir archivos de torneo y resultados",
        "Gestionar inscripciones de participantes",
        "Generar reportes de torneos"
      ],
      playerAccount: "Cuenta de Jugador",
      whatCanIDo: "¿Qué puedo hacer?",
      asPlayerYouCan: "Como jugador puedes:",
      playerCapabilities: [
        "Buscar y registrarte en torneos",
        "Ver resultados y clasificaciones",
        "Acceder a tu historial de torneos",
        "Ver tus estadísticas personales"
      ],
      accountConfiguredAsPlayer: "Tu cuenta está configurada como jugador"
    }
  },

  // Tournaments page
  tournaments: {
    title: "Torneos de Pokémon",
    subtitle: "Descubre y participa en torneos de TCG, VGC y Pokémon GO",
    metadata: {
      title: "Torneos - RotomTracks",
      description: "Encuentra y participa en torneos de Pokémon TCG, VGC y GO en España y Latinoamérica"
    },
    create: {
      title: "Crear nuevo torneo",
      description: "Completa la información básica o sube un TDF de TOM.",
      breadcrumbs: {
        home: "Inicio",
        dashboard: "Dashboard",
        createTournament: "Crear torneo"
      },
      backButton: "Volver al dashboard",
      metadata: {
        title: "Crear Torneo - RotomTracks",
        description: "Crea y gestiona un nuevo torneo de Pokémon"
      }
    },
    details: {
      manageTournament: "Gestionar Torneo",
      notFound: "Torneo no encontrado",
      metadata: {
        description: "Detalles del torneo {{name}} en {{city}}, {{country}}. Tipo: {{type}}. Fecha: {{date}}.",
        openGraph: {
          description: "Torneo de {{type}} en {{city}}, {{country}}"
        }
      }
    }
  },

  // Admin pages
  admin: {
    dashboard: {
      title: "Dashboard",
      description: "Vista general del sistema y métricas de solicitudes de organizador"
    }
  },

  // Auth pages
  auth: {
    error: {
      title: "Lo siento, algo salió mal.",
      codeError: "Error de código: {{error}}",
      unspecifiedError: "Ocurrió un error no especificado."
    },
    signupSuccess: {
      title: "¡Bienvenido a RotomTracks!",
      description: "Tu cuenta de torneos ha sido creada exitosamente",
      checkEmail: "Revisa tu email",
      emailSent: "Te hemos enviado un enlace de confirmación para verificar tu cuenta.",
      whatsNext: "¿Qué sigue?",
      steps: {
        confirmEmail: "Confirma tu dirección de email",
        completeProfile: "Completa la configuración de tu perfil",
        searchTournaments: "Comienza a buscar torneos",
        registerTrack: "Regístrate y sigue tus resultados"
      },
      signInButton: "Iniciar Sesión en tu Cuenta",
      backToHomeButton: "Volver al Inicio"
    },
    completeProfile: {
      title: "Completa tu Perfil",
      description: "Por favor completa tu perfil para acceder a todas las funciones de torneos",
      profileRequired: "Perfil Requerido",
      profileRequiredDescription: "Para participar en torneos y acceder a todas las funciones, por favor completa tu perfil con tu información de torneos."
    },
    unauthorized: {
      organizerRequired: {
        title: "Cuenta de Organizador Requerida",
        description: "Esta función requiere una cuenta de organizador para acceder.",
        suggestion: "Para crear torneos y gestionar eventos, necesitas actualizar tu cuenta a estado de organizador."
      },
      playerRequired: {
        title: "Cuenta de Jugador Requerida",
        description: "Esta función requiere una cuenta de jugador para acceder.",
        suggestion: "Para participar en torneos, necesitas completar tu perfil de jugador."
      },
      accessDenied: {
        title: "Acceso Denegado",
        description: "No tienes permisos para acceder a este recurso.",
        suggestion: "Por favor verifica los permisos de tu cuenta o contacta soporte si crees que esto es un error."
      },
      howToBecomeOrganizer: "Cómo convertirse en organizador:",
      organizerSteps: {
        goToProfile: "Ve a la configuración de tu perfil",
        changeAccountType: "Cambia tu tipo de cuenta a \"Organizador\"",
        addOrganization: "Agrega la información de tu organización",
        saveChanges: "Guarda tus cambios"
      },
      updateProfileButton: "Actualizar Perfil",
      needHelp: "¿Necesitas ayuda? Contacta soporte si continúas teniendo problemas de acceso."
    }
  }
} as const;