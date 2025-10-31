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
      description: "Conecta, compite y celebra la pasión por Pokémon.<br/>La plataforma definitiva para organizar y participar en torneos TCG, VGC y GO.",
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
    },
    // Popular tournaments section
    popular: {
      types: {
        title: "Tipos de Torneos Más Populares",
        subtitle: "Basado en la actividad reciente",
        tournament: "torneo",
        tournaments: "torneos",
        active: "activos",
        trend: {
          up: "en aumento",
          down: "en descenso",
          stable: "estable"
        },
        empty: {
          title: "No hay datos de popularidad aún",
          description: "Los datos aparecerán cuando haya más actividad",
          hint: "Crea torneos para ver estadísticas de popularidad"
        }
      },
      activity: {
        title: "Actividad Reciente",
        subtitle: "Últimas interacciones de la comunidad",
        empty: {
          title: "No hay actividad reciente",
          description: "La actividad aparecerá cuando los usuarios interactúen con torneos",
          hint: "Participa en torneos para ver la actividad aquí"
        }
      }
    },
    // My tournaments section
    myTournaments: {
      title: "Mis Torneos",
      viewAll: "Ver todos",
      searchTournaments: "Buscar Torneos",
      createTournament: "Crear Torneo",
      empty: {
        title: "No tienes torneos aún",
        description: {
          organizer: "Crea tu primer torneo o regístrate en uno existente",
          participant: "Busca torneos interesantes y regístrate para participar"
        }
      }
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
      cancelled: "Cancelado",
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
    },
    metadata: {
      title: "Dashboard - RotomTracks",
      description: "Gestiona tus torneos, participaciones y organizaciones"
    },
    api: {
      noDataAvailable: "No hay datos de solicitudes disponibles",
      metricsRetrieved: "Métricas del panel de administración obtenidas exitosamente"
    },
    navigation: {
      home: "Inicio",
      dashboard: "Dashboard"
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
  },

  // Help/FAQ page
  help: {
    title: "Ayuda y Preguntas Frecuentes",
    subtitle: "Encuentra respuestas a las preguntas más comunes sobre RotomTracks",
    faq: {
      search: {
        question: "¿Cómo funciona la búsqueda de torneos?",
        answer: "Puedes buscar torneos usando nuestra barra de búsqueda introduciendo palabras clave como nombre del torneo, ciudad o tipo (TCG, VGC, GO). Usa los filtros para acotar resultados por ubicación, rango de fechas y estado del torneo. La plataforma también admite detección de ubicación para mostrar torneos cercanos a ti."
      },
      createAccount: {
        question: "¿Cómo creo una cuenta?",
        answer: "Haz clic en el botón 'Registrarse' en la barra de navegación, completa tu email y contraseña, y verifica tu dirección de correo electrónico. Después de registrarte, podrás completar tu perfil con información adicional como tu Player ID y año de nacimiento."
      },
      registerTournament: {
        question: "¿Cómo me registro en un torneo?",
        answer: "Explora los torneos disponibles usando la función de búsqueda o revisa los torneos destacados en la página de inicio. Haz clic en un torneo para ver sus detalles, y si las inscripciones están abiertas, verás un botón 'Registrarse'. Completa tu perfil si se te solicita, luego confirma tu registro."
      },
      organizeTournament: {
        question: "¿Cómo organizo un torneo?",
        answer: "Necesitas una cuenta de organizador para crear torneos. Ve a tu perfil y actualiza tu tipo de cuenta a 'Organizador', luego agrega la información de tu organización. Una vez aprobado, podrás crear torneos desde tu dashboard, subir archivos TDF y gestionar las inscripciones de participantes."
      },
      tournamentTypes: {
        question: "¿Qué tipos de torneos están soportados?",
        answer: "RotomTracks soporta tres formatos principales de torneos: <strong>TCG</strong> (Trading Card Game), <strong>VGC</strong> (Video Game Championships), y <strong>Pokémon GO</strong>. Cada tipo de torneo tiene sus propias características específicas y herramientas de gestión de resultados."
      },
      organizerFeatures: {
        question: "¿Qué funciones están disponibles para organizadores?",
        answer: "Los organizadores pueden crear y gestionar torneos, subir archivos TDF para procesamiento automático de resultados, generar reportes HTML, gestionar inscripciones de participantes, hacer seguimiento del estado del torneo y acceder a análisis detallados. La plataforma procesa automáticamente los archivos TDF generados por TOM."
      }
    },
    stillNeedHelp: {
      title: "¿Aún necesitas ayuda?",
      description: "Si no encuentras la respuesta que buscas, por favor contáctanos a través de nuestra página de contacto. ¡Estamos aquí para ayudarte!"
    }
  },

  // Terms and Conditions page
  terms: {
    title: "Términos y Condiciones",
    lastUpdated: "Última actualización: Enero 2024",
    sections: {
      acceptance: {
        title: "1. Aceptación de Términos",
        content: "Al acceder y usar RotomTracks, aceptas y te comprometes a cumplir con los términos y disposiciones de este acuerdo. Si no estás de acuerdo con lo anterior, por favor no uses este servicio."
      },
      purpose: {
        title: "2. Propósito del Servicio",
        content: "RotomTracks es una plataforma gratuita diseñada para ayudar a organizadores de torneos locales y jugadores a facilitar la organización y participación en torneos de Pokémon. Nuestros objetivos principales son:\n\n• Asistir a organizadores de torneos locales en la gestión y publicación de información de torneos\n• Ayudar a jugadores a descubrir y registrarse en torneos en su área\n• Facilitar la publicación y compartición de resultados de torneos\n• Proporcionar herramientas para hacer seguimiento del historial de torneos y estadísticas de jugadores\n\nLa plataforma es completamente gratuita. No cobramos a los usuarios por acceder o usar ninguna función de RotomTracks. Todos los servicios se proporcionan sin costo."
      },
      use: {
        title: "3. Uso del Servicio",
        content: "RotomTracks proporciona una plataforma para organizar y participar en torneos de Pokémon. Te comprometes a usar el servicio solo para fines legales y de acuerdo con estos Términos. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Los usuarios deben usar la plataforma de buena fe y solo para fines legítimos relacionados con torneos."
      },
      pokemonCompliance: {
        title: "4. Cumplimiento con los Términos de The Pokémon Company International",
        content: "RotomTracks es un servicio independiente operado por fans y no está afiliado, respaldado o patrocinado por The Pokémon Company International, Nintendo, Game Freak o Creatures Inc.\n\nTodo el contenido relacionado con Pokémon, incluyendo pero no limitado a nombres, personajes, imágenes y marcas registradas, son propiedad de The Pokémon Company International, Nintendo, Game Freak y Creatures Inc.\n\nRotomTracks opera cumpliendo con todos los términos y condiciones aplicables establecidos por The Pokémon Company International, incluyendo:\n\n• Respetar los derechos de propiedad intelectual del contenido de Pokémon\n• No usar las marcas registradas oficiales de Pokémon de maneras que puedan causar confusión\n• Operar como un servicio de fans no comercial\n• Adherirse a las directrices para sitios web operados por fans\n\nSi se encuentra que cualquier contenido en RotomTracks viola los términos de The Pokémon Company International, lo eliminaremos de inmediato tras la notificación."
      },
      responsibilities: {
        title: "5. Responsabilidades del Usuario",
        content: "Los usuarios son responsables de la exactitud de la información proporcionada en la plataforma. Los organizadores son responsables de la exactitud de la información y resultados de los torneos. Los usuarios no deben realizar ninguna actividad que interrumpa o interfiera con el servicio. Los organizadores son responsables de asegurar que sus torneos cumplan con las leyes y regulaciones locales, así como cualquier regla aplicable de organizadores oficiales de torneos de Pokémon."
      },
      intellectual: {
        title: "6. Propiedad Intelectual",
        content: "El servicio y su contenido original, características y funcionalidad son propiedad de RotomTracks y están protegidos por leyes internacionales de derechos de autor, marcas registradas y otras leyes de propiedad intelectual. Toda la propiedad intelectual relacionada con Pokémon sigue siendo propiedad exclusiva de The Pokémon Company International, Nintendo, Game Freak y Creatures Inc. RotomTracks no reclama propiedad de ninguna marca registrada o derecho de autor relacionado con Pokémon."
      },
      liability: {
        title: "7. Limitación de Responsabilidad",
        content: "RotomTracks no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos resultantes de tu uso o incapacidad para usar el servicio. Nos esforzamos por proporcionar información precisa, pero no garantizamos la exactitud de los resultados de torneos o datos proporcionados por terceros. RotomTracks se proporciona \"tal cual\" sin garantías de ningún tipo."
      },
      modifications: {
        title: "8. Modificaciones de los Términos",
        content: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Notificaremos a los usuarios de cualquier cambio material por correo electrónico o mediante un aviso en la plataforma. El uso continuado del servicio después de dichas modificaciones constituye la aceptación de los términos actualizados."
      }
    },
    contact: "Si tienes alguna pregunta sobre estos Términos y Condiciones, por favor contáctanos a través de nuestra página de contacto."
  },

  // Privacy Policy page
  privacy: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: Enero 2024",
    commitment: {
      title: "Nuestro Compromiso con tu Privacidad",
      noThirdParties: "No compartimos tus datos con terceros",
      noAdvertising: "No usamos tus datos para publicidad",
      dataSecurity: "Implementamos medidas de seguridad sólidas para proteger tu información"
    },
    sections: {
      dataCollected: {
        title: "Información que Recopilamos",
        content: "Recopilamos información que proporcionas directamente, incluyendo:\n\n• Información de cuenta (dirección de email)\n• Información de perfil (Player ID, año de nacimiento, detalles de organización para organizadores)\n• Datos de participación en torneos\n• Datos de organización de torneos (para organizadores)\n\nTambién podemos recopilar cierta información automáticamente para mejorar la funcionalidad y experiencia de usuario del sitio web."
      },
      dataUse: {
        title: "Cómo Usamos tu Información",
        content: "Usamos la información que recopilamos para:\n\n• Proporcionar, mantener y mejorar nuestros servicios\n• Procesar inscripciones y resultados de torneos\n• Comunicarnos contigo sobre tu cuenta y torneos\n• Asegurar la seguridad de la plataforma y prevenir fraudes\n\n<strong>Importante:</strong> No vendemos, alquilamos ni compartimos tu información personal con terceros para publicidad o marketing. Tus datos se usan únicamente para proporcionar y mejorar la plataforma RotomTracks."
      },
      security: {
        title: "Seguridad de Datos",
        content: "Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye encriptación, almacenamiento seguro de datos y auditorías de seguridad regulares.\n\n<strong>Seguridad de Contraseñas:</strong> Tu contraseña está gestionada y cifrada por nuestro proveedor de servicios de autenticación. RotomTracks nunca tiene acceso a tu contraseña de ninguna forma. Las contraseñas son almacenadas de forma segura mediante hashing según las prácticas de seguridad estándar de la industria. La autenticación y gestión de contraseñas están manejadas por un proveedor de servicios de terceros de confianza especializado en autenticación segura.\n\nSin embargo, ningún método de transmisión por Internet es 100% seguro."
      },
      rights: {
        title: "Tus Derechos",
        content: "Tienes derecho a:\n\n• Acceder a tus datos personales\n• Solicitar corrección de datos inexactos\n• Solicitar eliminación de tus datos\n• Oponerte al procesamiento de tus datos\n• Portabilidad de datos\n\nPara ejercer estos derechos, por favor contáctanos a través de nuestra página de contacto. Responderemos a tu solicitud en un plazo de 30 días."
      },
      pokemonData: {
        title: "Datos Relacionados con Pokémon",
        content: "RotomTracks procesa datos relacionados con torneos que pueden incluir referencias a gameplay de Pokémon, formatos de torneos (TCG, VGC, GO) e información sobre gaming competitivo. Estos datos se usan exclusivamente para:\n\n• Facilitar la organización y participación en torneos\n• Publicar resultados y clasificaciones de torneos\n• Hacer seguimiento de estadísticas de jugadores e historial de torneos\n• Mejorar la funcionalidad de la plataforma para la comunidad de torneos de Pokémon\n\nNo recopilamos, almacenamos o procesamos información personal sobre personajes de Pokémon, datos de gameplay de juegos de Pokémon, o cualquier información propietaria de juegos. Todos los datos de torneos se limitan a información públicamente disponible sobre eventos competitivos.\n\nRotomTracks respeta las políticas de privacidad y términos de servicio establecidos por The Pokémon Company International y maneja todos los datos de acuerdo con sus directrices para servicios operados por fans. Cualquier marca registrada, personaje o contenido relacionado con Pokémon sigue siendo propiedad exclusiva de The Pokémon Company International, Nintendo, Game Freak y Creatures Inc."
      }
    },
    contact: "Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos a través de nuestra página de contacto."
  },

  // Contact page
  contact: {
    title: "Contáctanos",
    subtitle: "¡Estamos aquí para ayudar! Ponte en contacto con nuestro equipo.",
    comingSoon: "Nuestro formulario de contacto estará disponible pronto. Por favor, vuelve más tarde o contacta a través de nuestros canales de soporte."
  }
} as const;