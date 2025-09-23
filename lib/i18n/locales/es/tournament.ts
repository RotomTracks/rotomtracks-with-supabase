/**
 * Spanish translations for tournament-related components
 */

export const tournament = {
  title: 'Torneo',
  name: 'Nombre del Torneo',
  create: 'Crear Torneo',
  createDescription: 'Completa los detalles para crear un nuevo torneo Pokémon',
  join: 'Unirse al Torneo',
  leave: 'Abandonar Torneo',
  participants: '{{current}}/{{max}} participantes',
  maxParticipants: 'Máximo de Participantes',
  date: 'Fecha',
  location: 'Ubicación',
  description: 'Descripción',
  rules: 'Reglas',
  prizes: 'Premios',
  viewDetails: 'Ver Detalles',
  namePlaceholder: 'Ingresa el nombre del torneo',
  descriptionPlaceholder: 'Describe tu torneo',
  locationPlaceholder: 'Ubicación del torneo',
  maxParticipantsPlaceholder: 'Ingresa el máximo de participantes',
  rulesPlaceholder: 'Reglas y regulaciones del torneo',
  prizesPlaceholder: 'Premios y recompensas del torneo',
  status: {
    open: 'Abierto',
    closed: 'Cerrado',
    ongoing: 'En Curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    unknown: 'Desconocido'
  },
  details: {
    title: 'Detalles del Torneo',
    format: 'Formato',
    share: 'Compartir',
    export: 'Exportar'
  },
  management: {
    title: 'Gestión de Torneo',
    description: 'Gestiona la configuración y participantes de tu torneo',
    tournamentStatus: 'Estado del Torneo',
    fileUpload: 'Subir Archivo',
    fileUploadDescription: 'Sube listas de participantes, resultados de partidas u otros datos del torneo',
    smartProcessing: 'Procesamiento Inteligente de Archivos',
    smartProcessingDescription: 'Sube archivos y deja que nuestra IA los procese automáticamente',
    processingStatus: 'Estado del Procesamiento',
    tournamentData: 'Datos del Torneo',
    participants: 'Participantes',
    matches: 'Partidas',
    results: 'Resultados',
    actions: 'Acciones',
    generateBrackets: 'Generar Brackets',
    exportResults: 'Exportar Resultados',
    sendNotifications: 'Enviar Notificaciones',
    archiveTournament: 'Archivar Torneo',
    dangerZone: 'Zona de Peligro',
    deleteTournament: 'Eliminar Torneo',
    deleteWarning: 'Esta acción no se puede deshacer. Esto eliminará permanentemente el torneo y todos los datos asociados.',
    fileWatcher: 'Monitor de Archivos',
    fileWatcherDescription: 'Monitorea cambios en archivos y procesa actualizaciones automáticamente',
    fileUploadDemo: 'Demo de Subida de Archivos',
    fileUploadDemoDescription: 'Prueba la funcionalidad de subida de archivos con datos de ejemplo',
    tournamentResults: 'Resultados del Torneo',
    tournamentResultsDescription: 'Ve y gestiona los resultados y clasificaciones del torneo',
    matchHistory: 'Historial de Partidas',
    matchHistoryDescription: 'Ve el historial detallado de partidas y estadísticas',
    participantsList: 'Lista de Participantes',
    participantsListDescription: 'Gestiona los participantes del torneo y su información',
    tournamentStandings: 'Clasificaciones del Torneo',
    tournamentStandingsDescription: 'Ve las clasificaciones y rankings actuales del torneo',
    tournamentSearch: 'Búsqueda de Torneos',
    tournamentSearchDescription: 'Busca y filtra torneos',
    fileUploadComponent: 'Componente de Subida de Archivos',
    fileUploadComponentDescription: 'Funcionalidad básica de subida de archivos',
    tournamentCard: 'Tarjeta de Torneo',
    tournamentCardDescription: 'Vista previa de cómo aparecen los torneos en las listas',
    tournamentDetailsDescription: 'Vista detallada de la información del torneo',
    players: 'jugadores',
    files: 'Archivos',
    status: 'Estado',
    uploadFiles: 'Subir Archivos',
    process: 'Procesar',
    monitor: 'Monitoreo',
    manualUpload: 'Subida Manual',
    manualUploadDescription: 'Sube archivos TDF manualmente si prefieres no usar la detección automática'
  },
  filters: {
    search: 'Buscar',
    searchPlaceholder: 'Buscar torneos...',
    status: 'Estado',
    allStatuses: 'Todos los estados',
    all: 'Todos',
    upcoming: 'Próximos',
    format: 'Formato',
    allFormats: 'Todos los formatos',
    swiss: 'Suizo',
    singleElimination: 'Eliminación Simple',
    doubleElimination: 'Eliminación Doble',
    locationFilter: 'Filtrar por ubicación...',
    clearFilters: 'Limpiar Filtros'
  },
  list: {
    noTournamentsFound: 'No se encontraron torneos',
    noTournamentsDescription: 'Intenta ajustar tus filtros o vuelve más tarde para ver nuevos torneos.',
    searchTournaments: 'Buscar Torneos',
    filters: 'Filtros',
    searchByName: 'Buscar por nombre o tipo...',
    cityOrCountry: 'Ciudad o país...',
    search: 'Buscar',
    clear: 'Limpiar',
    showingFilteredResults: 'Mostrando resultados filtrados',
    sortBy: 'Ordenar por:',
    date: 'Fecha',
    name: 'Nombre',
    players: 'Participantes',
    location: 'Ubicación',
    tournamentsFound: '{{count}} torneo{{count, plural, one {} other {s}}} encontrado{{count, plural, one {} other {s}}}',
    noTournamentsAvailable: 'No hay torneos disponibles en este momento',
    tryAdjustingFilters: 'Intenta ajustar los filtros de búsqueda',
    clearFilters: 'Limpiar filtros'
  },
  processing: {
    title: 'Procesamiento de Torneo',
    description: 'Procesa archivos TDF para generar resultados y reportes HTML',
    status: {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido'
    },
    progress: '{{progress}}% completado',
    noFileSelected: 'No hay archivo seleccionado para procesar',
    startProcessingError: 'Error al iniciar procesamiento',
    connectionError: 'Error de conexión',
    cancelProcessingError: 'Error al cancelar procesamiento'
  },
  // Trending tournaments
  trending: {
    regional: 'Campeonato Regional',
    spring: 'Torneo de Primavera'
  },
  // Create tournament form
  createForm: {
    descriptionPlaceholder: 'Descripción opcional del torneo...',
    cityPlaceholder: 'Madrid',
    statePlaceholder: 'Comunidad de Madrid'
  },
  // Dashboard specific translations
  dashboard: {
    title: 'Dashboard de Torneos',
    subtitle: {
      organizer: 'Gestiona tus torneos organizados y participaciones',
      player: 'Sigue tus participaciones en torneos'
    },
    stats: {
      total: 'Total Torneos',
      organizing: 'organizando',
      participating: 'Participaciones activas',
      upcoming: 'Próximos',
      scheduled: 'Torneos programados',
      participants: 'Participantes',
      cities: 'Ciudades',
      inYourTournaments: 'En tus torneos',
      visited: 'Visitadas'
    },
    tabs: {
      organizing: 'Organizando',
      participating: 'Participando',
      all: 'Todos',
      organizingAria: 'Torneos que organizas',
      participatingAria: 'Torneos en los que participas',
      allAria: 'Lista de torneos'
    },
    search: {
      placeholder: 'Buscar torneos...',
      aria: 'Buscar torneos'
    },
    filter: {
      status: {
        aria: 'Filtrar por estado',
        all: 'Todos los estados'
      }
    },
    empty: {
      organizing: {
        title: 'No estás organizando torneos',
        description: 'Crea tu primer torneo y comienza a gestionar participantes'
      },
      participating: {
        title: 'No estás participando en torneos',
        description: 'Busca torneos interesantes y regístrate para participar',
        searchButton: 'Buscar Torneos'
      },
      all: {
        title: 'No tienes torneos aún',
        titleFiltered: 'No se encontraron torneos',
        description: 'Crea tu primer torneo o regístrate en uno existente',
        descriptionFiltered: 'Intenta ajustar los filtros de búsqueda'
      }
    },
    role: {
      organizing: 'Organizas',
      participating: 'Participas'
    }
  },
      error: {
        loading: 'Error al cargar los torneos'
      },
      upcoming: {
        title: 'Próximos Torneos',
        subtitle: 'Encuentra torneos cerca de ti y regístrate',
        inLocation: 'en {location}',
        empty: {
          title: 'No hay torneos próximos',
          description: 'No hay torneos programados en este momento. ¡Vuelve pronto!',
          descriptionWithLocation: 'No encontramos torneos próximos en {location}. Prueba expandir tu búsqueda.'
        },
        actions: {
          viewAll: 'Ver todos los torneos',
          create: 'Crear torneo'
        },
        error: {
          title: 'Error al cargar torneos',
          loading: 'Error al cargar torneos próximos'
        }
      }
    };