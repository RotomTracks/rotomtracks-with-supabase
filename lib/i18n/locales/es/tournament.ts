/**
 * Spanish translations for tournament-related components
 */

export const tournament = {
  title: 'Torneo',
  name: 'Nombre del Torneo',
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
    export: 'Exportar',
    notFound: 'Torneo no encontrado',
    metaDescription: 'Detalles del torneo {{name}} en {{city}}, {{country}}. Tipo: {{type}}. Fecha: {{date}}.',
    openGraphDescription: 'Torneo {{type}} en {{city}}, {{country}}'
  },
  time: 'Hora',
  organizer: 'Organizador',
  actions: {
    register: 'Registrarse',
    registering: 'Registrando...',
    unregister: 'Desapuntarse',
    unregistering: 'Desapuntando...',
    viewDetails: 'Ver Detalles',
    manage: 'Gestionar',
    registrationOpen: 'Registro Abierto',
    participants: 'participantes'
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
    clearFilters: 'Limpiar Filtros',
    loading: 'Cargando filtros',
    loadingAria: 'Cargando filtros de torneos...',
    tournamentType: 'Tipo de Torneo',
    popularLocations: 'Ubicaciones Populares',
    activeFilters: 'Filtros Activos',
    tournamentTypeAria: 'Filtros de tipo de torneo',
    statusAria: 'Filtros de estado de torneo',
    locationAria: 'Filtros de ubicación',
    activeFiltersAria: 'Filtros activos',
    filterBy: 'Filtrar por',
    types: {
      tcgPrerelease: 'TCG Prerelease',
      tcgLeagueChallenge: 'TCG League Challenge',
      tcgLeagueCup: 'TCG League Cup',
      vgcPremier: 'VGC Premier',
      goPremier: 'GO Premier'
    }
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
    tournamentsFoundOne: '{{count}} torneo encontrado',
    tournamentsFoundOther: '{{count}} torneos encontrados',
    noTournamentsAvailable: 'No hay torneos disponibles en este momento',
    tryAdjustingFilters: 'Intenta ajustar los filtros de búsqueda',
    clearFilters: 'Limpiar filtros',
    loading: 'Cargando torneos...',
    errorLoading: 'Error al cargar los torneos',
    tryAgain: 'Intentar de nuevo',
    gridView: 'Vista de cuadrícula',
    listView: 'Vista de lista',
    changeView: 'Cambiar vista',
    searchByNameAria: 'Buscar torneos por nombre',
    searchByLocationAria: 'Buscar por ciudad o país',
    sortByAria: 'Ordenar torneos por',
    clearAllFilters: 'Limpiar todos los filtros',
    tournamentsList: 'Lista de torneos'
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
  // Stats translations
  stats: {
    participants: 'Participantes',
    cities: 'Ciudades',
    inYourTournaments: 'En tus torneos',
    visited: 'Visitadas'
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
      noOrganizing: 'Aún no has organizado torneos',
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
    },
    actions: {
      createTournament: 'Crear Torneo'
    },
    error: {
      loading: 'Error al cargar los torneos'
    }
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
      loading: 'Error al cargar torneos próximos',
      http: 'Error {{status}}: {{statusText}}'
    }
  },
  search: {
    placeholder: {
      mobile: 'Buscar torneos...',
      desktop: 'Buscar torneos por nombre, ciudad o tipo...'
    },
    recentSearch: 'Búsqueda reciente',
    noSuggestions: 'No se encontraron sugerencias',
    tryGeneralTerms: 'Intenta con términos más generales',
    loadingSuggestions: 'Cargando sugerencias...',
    searchingTournaments: 'Buscando torneos...',
    searching: 'Buscando',
    categories: {
      tournament: 'Torneo',
      location: 'Ubicación',
      type: 'Tipo'
    }
  },
  page: {
    title: 'Torneos',
    description: 'Encuentra y participa en torneos de Pokémon TCG, VGC y GO en España y América Latina'
  },
  breadcrumbs: {
    home: 'Inicio',
    dashboard: 'Dashboard',
    createTournament: 'Crear Torneo'
  },
  create: {
    title: 'Crear Torneo',
    description: 'Completa los detalles para crear un nuevo torneo Pokémon',
    backToDashboard: 'Volver al Dashboard'
  },
  register: {
    notFoundTitle: 'Registro de Torneo - RotomTracks',
    notFoundDescription: 'Regístrate en un torneo de Pokémon',
    title: 'Registro - {{name}} - RotomTracks',
    description: 'Regístrate en {{name}} en {{city}}, {{country}}'
  }
};
