/**
 * English translations for main pages
 */

export const pages = {
  // Home page
  home: {
    navigation: {
      tournaments: "Tournaments",
      dashboard: "Dashboard"
    },
    hero: {
      title: "Manage and Discover Pokémon Tournaments",
      subtitle: "The complete platform for organizers and players. Search tournaments, manage participations and access detailed results.",
      myDashboard: "My Dashboard",
      exploreTournaments: "Explore Tournaments",
      joinFree: "Join Free",
      viewTournaments: "View Tournaments"
    },
    search: {
      title: "Find your next tournament",
      subtitle: "Search among thousands of TCG, VGC and Pokémon GO tournaments",
      placeholder: "Search tournaments by name, city, type...",
      activeTournaments: "Active tournaments",
      openRegistrations: "Open registrations",
      detectingLocation: "Detecting...",
      detectLocation: "Detect location",
      viewAllTournaments: "View all tournaments →"
    },
    stats: {
      tournaments: "Registered tournaments",
      players: "Active players",
      cities: "Cities"
    },
    location: {
      detected: "Location detected",
      showingTournaments: "Showing tournaments in {{location}}"
    },
    sections: {
      featuredTournaments: "Featured Tournaments",
      featuredSubtitle: "Discover the most popular upcoming tournaments and find the perfect one for you",
      notFound: "Can't find what you're looking for?",
      notFoundSubtitle: "Explore our complete tournament database or create a personalized alert",
      exploreAll: "Explore All Tournaments",
      createAccount: "Create Account for Alerts",
      trendsAndActivity: "Trends and Activity",
      trendsSubtitle: "Discover the most popular tournament types and recent activity in your region",
      quickSearch: "Quick search by format",
      features: "Everything you need for Pokémon tournaments",
      featuresSubtitle: "From search to complete results management"
    },
    features: {
      search: {
        title: "Smart Search",
        description: "Find tournaments by name, location, date and type with real-time suggestions.",
        items: [
          "Advanced filters",
          "Autocomplete",
          "Relevant results"
        ]
      },
      management: {
        title: "Professional Management",
        description: "Complete tools for organizers with automatic TDF file processing.",
        items: [
          "TDF processing",
          "HTML reports",
          "Participant management"
        ]
      },
      community: {
        title: "For the Entire Community",
        description: "Complete support for TCG, VGC and Pokémon GO with personalized profiles.",
        items: [
          "Multiple formats",
          "Player profiles",
          "Tournament history"
        ]
      },
      readyToJoin: "Ready to join the community?",
      createFreeAccount: "Create Free Account",
      exploreTournaments: "Explore Tournaments"
    },
    footer: {
      description: "The leading platform for Pokémon tournaments in Spain and Latin America.",
      tournaments: "Tournaments",
      searchTournaments: "Search Tournaments",
      account: "Account",
      profile: "Profile",
      signIn: "Sign In",
      signUp: "Sign Up",
      support: "Support",
      help: "Help",
      contact: "Contact",
      terms: "Terms",
      privacy: "Privacy",
      copyright: "© 2024 RotomTracks. All rights reserved."
    }
  },

  // Dashboard page
  dashboard: {
    welcome: "Welcome, {{name}}!",
    organizerSubtitle: "Manage your tournaments and review results",
    playerSubtitle: "Discover tournaments and follow your participations",
    searchTournaments: "Search Tournaments",
    newTournament: "New Tournament",
    stats: {
      organizedTournaments: "Organized Tournaments",
      ongoing: "Ongoing",
      completed: "Completed",
      totalParticipants: "Total Participants",
      participations: "Participations",
      activeTournaments: "Active Tournaments",
      upcoming: "Upcoming"
    },
    sections: {
      myTournaments: "My Tournaments",
      myParticipations: "My Participations",
      organizerDescription: "Tournaments you have organized recently",
      playerDescription: "Tournaments you have participated in",
      recentTournaments: "Recent Tournaments",
      recentDescription: "Discover recently completed tournaments"
    },
    actions: {
      view: "View",
      manage: "Manage",
      viewResults: "View Results",
      viewAll: "View all",
      viewMore: "View more tournaments"
    },
    empty: {
      noTournamentsOrganized: "You haven't organized any tournaments yet",
      noParticipations: "You haven't participated in any tournaments yet",
      noRecentTournaments: "No recent tournaments available",
      exploreTournaments: "Explore Tournaments"
    },
    alerts: {
      completeProfile: "Complete your profile to get a better experience on the platform.",
      completeProfileAction: "Complete Profile"
    }
  },

  // Profile page
  profile: {
    title: "My Profile",
    backToHome: "Home",
    edit: "Edit",
    view: "View",
    loading: "Loading...",
    descriptions: {
      complete: "Manage your personal information and account settings",
      incomplete: "Complete your profile to access all features"
    },
    form: {
      updateProfile: "Update Profile",
      completeProfile: "Complete Profile"
    },
    display: {
      incompleteProfile: "Incomplete Profile",
      organizer: "Organizer",
      player: "Player",
      profileComplete: "Profile complete",
      profilePercentComplete: "Profile {{percent}}% complete",
      basicInfo: "Basic Information",
      copyData: "Copy data",
      copied: "Copied!",
      playerId: "Player ID",
      email: "Email",
      birthYear: "Birth Year",
      memberSince: "Member since",
      notSet: "Not set",
      notSpecified: "Not specified",
      organizerInfo: "Organizer Information",
      leagueStore: "League/Store",
      officialLink: "Official Link",
      viewLeagueStore: "View League/Store",
      organizerPrivileges: "Organizer Privileges:",
      organizerPrivilegesList: [
        "Create and manage tournaments",
        "Upload tournament files and results",
        "Manage participant registrations",
        "Generate tournament reports"
      ],
      playerAccount: "Player Account",
      whatCanIDo: "What can I do?",
      asPlayerYouCan: "As a player you can:",
      playerCapabilities: [
        "Search and register for tournaments",
        "View results and rankings",
        "Access your tournament history",
        "View your personal statistics"
      ],
      accountConfiguredAsPlayer: "Your account is configured as a player"
    }
  },

  // Tournaments page
  tournaments: {
    title: "Pokémon Tournaments",
    subtitle: "Discover and participate in TCG, VGC and Pokémon GO tournaments"
  }
} as const;