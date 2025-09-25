/**
 * English translations for tournament-related components
 */

export const tournament = {
  title: 'Tournament',
  name: 'Tournament Name',
  join: 'Join Tournament',
  leave: 'Leave Tournament',
  participants: '{{current}}/{{max}} participants',
  maxParticipants: 'Maximum Participants',
  date: 'Date',
  location: 'Location',
  description: 'Description',
  rules: 'Rules',
  prizes: 'Prizes',
  viewDetails: 'View Details',
  namePlaceholder: 'Enter tournament name',
  descriptionPlaceholder: 'Describe your tournament',
  locationPlaceholder: 'Tournament location',
  maxParticipantsPlaceholder: 'Enter max participants',
  rulesPlaceholder: 'Tournament rules and regulations',
  prizesPlaceholder: 'Tournament prizes and rewards',
  status: {
    open: 'Open',
    closed: 'Closed',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    unknown: 'Unknown'
  },
  details: {
    title: 'Tournament Details',
    format: 'Format',
    share: 'Share',
    export: 'Export',
    notFound: 'Tournament not found',
    metaDescription: 'Tournament details {{name}} in {{city}}, {{country}}. Type: {{type}}. Date: {{date}}.',
    openGraphDescription: '{{type}} tournament in {{city}}, {{country}}'
  },
  time: 'Time',
  organizer: 'Organizer',
  actions: {
    register: 'Register',
    registering: 'Registering...',
    viewDetails: 'View Details',
    manage: 'Manage',
    registrationOpen: 'Registration Open',
    participants: 'participants'
  },
  management: {
    title: 'Tournament Management',
    description: 'Manage your tournament settings and participants',
    tournamentStatus: 'Tournament Status',
    fileUpload: 'File Upload',
    fileUploadDescription: 'Upload participant lists, match results, or other tournament data',
    smartProcessing: 'Smart File Processing',
    smartProcessingDescription: 'Upload files and let our AI process them automatically',
    processingStatus: 'Processing Status',
    tournamentData: 'Tournament Data',
    participants: 'Participants',
    matches: 'Matches',
    results: 'Results',
    actions: 'Actions',
    generateBrackets: 'Generate Brackets',
    exportResults: 'Export Results',
    sendNotifications: 'Send Notifications',
    archiveTournament: 'Archive Tournament',
    dangerZone: 'Danger Zone',
    deleteTournament: 'Delete Tournament',
    deleteWarning: 'This action cannot be undone. This will permanently delete the tournament and all associated data.',
    fileWatcher: 'File Watcher',
    fileWatcherDescription: 'Monitor file changes and automatically process updates',
    fileUploadDemo: 'File Upload Demo',
    fileUploadDemoDescription: 'Test file upload functionality with sample data',
    tournamentResults: 'Tournament Results',
    tournamentResultsDescription: 'View and manage tournament results and standings',
    matchHistory: 'Match History',
    matchHistoryDescription: 'View detailed match history and statistics',
    participantsList: 'Participants List',
    participantsListDescription: 'Manage tournament participants and their information',
    tournamentStandings: 'Tournament Standings',
    tournamentStandingsDescription: 'View current tournament standings and rankings',
    tournamentSearch: 'Tournament Search',
    tournamentSearchDescription: 'Search and filter tournaments',
    fileUploadComponent: 'File Upload Component',
    fileUploadComponentDescription: 'Basic file upload functionality',
    tournamentCard: 'Tournament Card',
    tournamentCardDescription: 'Preview how tournaments appear in listings',
    tournamentDetailsDescription: 'Detailed view of tournament information',
    players: 'players',
    files: 'Files',
    status: 'Status',
    uploadFiles: 'Upload Files',
    process: 'Process',
    monitor: 'Monitor',
    manualUpload: 'Manual Upload',
    manualUploadDescription: 'Upload TDF files manually if you prefer not to use automatic detection'
  },
  filters: {
    search: 'Search',
    searchPlaceholder: 'Search tournaments...',
    status: 'Status',
    allStatuses: 'All statuses',
    all: 'All',
    upcoming: 'Upcoming',
    format: 'Format',
    allFormats: 'All formats',
    swiss: 'Swiss',
    singleElimination: 'Single Elimination',
    doubleElimination: 'Double Elimination',
    locationFilter: 'Filter by location...',
    clearFilters: 'Clear Filters',
    loading: 'Loading filters',
    loadingAria: 'Loading tournament filters...',
    tournamentType: 'Tournament Type',
    popularLocations: 'Popular Locations',
    activeFilters: 'Active Filters',
    tournamentTypeAria: 'Tournament type filters',
    statusAria: 'Tournament status filters',
    locationAria: 'Location filters',
    activeFiltersAria: 'Active filters',
    filterBy: 'Filter by',
    types: {
      tcgPrerelease: 'TCG Prerelease',
      tcgLeagueChallenge: 'TCG League Challenge',
      tcgLeagueCup: 'TCG League Cup',
      vgcPremier: 'VGC Premier',
      goPremier: 'GO Premier'
    }
  },
  list: {
    noTournamentsFound: 'No tournaments found',
    noTournamentsDescription: 'Try adjusting your filters or check back later for new tournaments.',
    searchTournaments: 'Search Tournaments',
    filters: 'Filters',
    searchByName: 'Search by name or type...',
    cityOrCountry: 'City or country...',
    search: 'Search',
    clear: 'Clear',
    showingFilteredResults: 'Showing filtered results',
    sortBy: 'Sort by:',
    date: 'Date',
    name: 'Name',
    players: 'Players',
    location: 'Location',
    tournamentsFound_one: '{{count}} tournament found',
    tournamentsFound_other: '{{count}} tournaments found',
    noTournamentsAvailable: 'No tournaments available at this time',
    tryAdjustingFilters: 'Try adjusting the search filters',
    clearFilters: 'Clear filters',
    loading: 'Loading tournaments...',
    errorLoading: 'Error loading tournaments',
    tryAgain: 'Try again',
    gridView: 'Grid view',
    listView: 'List view',
    changeView: 'Change view',
    searchByNameAria: 'Search tournaments by name',
    searchByLocationAria: 'Search by city or country',
    sortByAria: 'Sort tournaments by',
    clearAllFilters: 'Clear all filters',
    tournamentsList: 'Tournaments list'
  },
  processing: {
    title: 'Tournament Processing',
    description: 'Process TDF files to generate results and HTML reports',
    status: {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed'
    },
    progress: '{{progress}}% completed',
    noFileSelected: 'No file selected for processing',
    startProcessingError: 'Error starting processing',
    connectionError: 'Connection error',
    cancelProcessingError: 'Error canceling processing'
  },
  // Trending tournaments
  trending: {
    regional: 'Regional Championship',
    spring: 'Spring Tournament'
  },
  // Create tournament form
  createForm: {
    descriptionPlaceholder: 'Optional tournament description...',
    cityPlaceholder: 'Madrid',
    statePlaceholder: 'Community of Madrid'
  },
  // Stats translations
  stats: {
    participants: 'Participants',
    cities: 'Cities',
    inYourTournaments: 'In your tournaments',
    visited: 'Visited'
  },
  // Dashboard specific translations
  dashboard: {
    title: 'Tournament Dashboard',
    subtitle: {
      organizer: 'Manage your organized tournaments and participations',
      player: 'Track your tournament participations'
    },
    stats: {
      total: 'Total Tournaments',
      organizing: 'organizing',
      noOrganizing: 'Haven\'t organized tournaments yet',
      participating: 'Active participations',
      upcoming: 'Upcoming',
      scheduled: 'Scheduled tournaments',
      participants: 'Participants',
      cities: 'Cities',
      inYourTournaments: 'In your tournaments',
      visited: 'Visited'
    },
    tabs: {
      organizing: 'Organizing',
      participating: 'Participating',
      all: 'All',
      organizingAria: 'Tournaments you organize',
      participatingAria: 'Tournaments you participate in',
      allAria: 'Tournament list'
    },
    search: {
      placeholder: 'Search tournaments...',
      aria: 'Search tournaments'
    },
    filter: {
      status: {
        aria: 'Filter by status',
        all: 'All statuses'
      }
    },
    empty: {
      organizing: {
        title: 'You are not organizing tournaments',
        description: 'Create your first tournament and start managing participants'
      },
      participating: {
        title: 'You are not participating in tournaments',
        description: 'Search for interesting tournaments and register to participate',
        searchButton: 'Search Tournaments'
      },
      all: {
        title: 'You have no tournaments yet',
        titleFiltered: 'No tournaments found',
        description: 'Create your first tournament or register for an existing one',
        descriptionFiltered: 'Try adjusting your search filters'
      }
    },
    role: {
      organizing: 'Organizing',
      participating: 'Participating'
    },
    actions: {
      createTournament: 'Create Tournament'
    },
    error: {
      loading: 'Error loading tournaments'
    }
  },
  upcoming: {
    title: 'Upcoming Tournaments',
    subtitle: 'Find tournaments near you and register',
    inLocation: 'in {location}',
    empty: {
      title: 'No upcoming tournaments',
      description: 'No tournaments scheduled at the moment. Come back soon!',
      descriptionWithLocation: 'No upcoming tournaments found in {location}. Try expanding your search.'
    },
    actions: {
      viewAll: 'View all tournaments',
      create: 'Create tournament'
    },
    error: {
      title: 'Error loading tournaments',
      loading: 'Error loading upcoming tournaments',
      http: 'Error {{status}}: {{statusText}}'
    }
  },
  search: {
    placeholder: {
      mobile: 'Search tournaments...',
      desktop: 'Search tournaments by name, city or type...'
    },
    recentSearch: 'Recent search',
    noSuggestions: 'No suggestions found',
    tryGeneralTerms: 'Try with more general terms',
    loadingSuggestions: 'Loading suggestions...',
    searchingTournaments: 'Searching tournaments...',
    searching: 'Searching',
    categories: {
      tournament: 'Tournament',
      location: 'Location',
      type: 'Type'
    }
  },
  page: {
    title: 'Tournaments',
    description: 'Find and participate in Pokémon TCG, VGC and GO tournaments in Spain and Latin America'
  },
  breadcrumbs: {
    home: 'Home',
    dashboard: 'Dashboard',
    createTournament: 'Create Tournament'
  },
  create: {
    title: 'Create Tournament',
    description: 'Complete the details to create a new Pokémon tournament',
    backToDashboard: 'Back to Dashboard'
  },
  register: {
    notFoundTitle: 'Tournament Registration - RotomTracks',
    notFoundDescription: 'Register for a Pokémon tournament',
    title: 'Registration - {{name}} - RotomTracks',
    description: 'Register for {{name}} in {{city}}, {{country}}'
  }
};
