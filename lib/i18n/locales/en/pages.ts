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
        items: {
          location: "Advanced filters",
          date: "Autocomplete",
          type: "Relevant results"
        }
      },
      management: {
        title: "Professional Management",
        description: "Complete tools for organizers with automatic TDF file processing.",
        items: {
          upload: "TDF processing",
          track: "HTML reports",
          results: "Participant management"
        }
      },
      community: {
        title: "For the Entire Community",
        description: "Complete support for TCG, VGC and Pokémon GO with personalized profiles.",
        items: {
          connect: "Multiple formats",
          share: "Player profiles",
          learn: "Tournament history"
        }
      },
      readyToJoin: "Ready to join the community?",
      createFreeAccount: "Create Free Account",
      exploreTournaments: "Explore Tournaments"
    },
    footer: {
      description: "Connect, compete, and celebrate your passion for Pokémon.<br/>The ultimate platform to organize and participate in TCG, VGC, and GO tournaments.",
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
    },
    // Popular tournaments section
    popular: {
      types: {
        title: "Most Popular Tournament Types",
        subtitle: "Based on recent activity",
        tournament: "tournament",
        tournaments: "tournaments",
        active: "active",
        trend: {
          up: "trending up",
          down: "trending down",
          stable: "stable"
        },
        empty: {
          title: "No popularity data yet",
          description: "Data will appear when there's more activity",
          hint: "Create tournaments to see popularity statistics"
        }
      },
      activity: {
        title: "Recent Activity",
        subtitle: "Latest community interactions",
        empty: {
          title: "No recent activity",
          description: "Activity will appear when users interact with tournaments",
          hint: "Participate in tournaments to see activity here"
        }
      }
    },
    // My tournaments section
    myTournaments: {
      title: "My Tournaments",
      viewAll: "View all",
      searchTournaments: "Search Tournaments",
      createTournament: "Create Tournament",
      empty: {
        title: "You don't have tournaments yet",
        description: {
          organizer: "Create your first tournament or register for an existing one",
          participant: "Search for interesting tournaments and register to participate"
        }
      }
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
      cancelled: "Cancelled",
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
    },
    metadata: {
      title: "Dashboard - RotomTracks",
      description: "Manage your tournaments, participations and organizations"
    },
    api: {
      noDataAvailable: "No request data available",
      metricsRetrieved: "Admin panel metrics retrieved successfully"
    },
    navigation: {
      home: "Home",
      dashboard: "Dashboard"
    }
  },

  // Profile page
  profile: {
    title: "My Profile",
    backToHome: "Home",
    edit: "Edit",
    view: "View",
    loading: "Loading...",
    welcomeMessage: "Welcome! Complete your profile to access all RotomTracks features.",
    noProfileFound: "No profile found. Creating a new one...",
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
    subtitle: "Discover and participate in TCG, VGC and Pokémon GO tournaments",
    metadata: {
      title: "Tournaments - RotomTracks",
      description: "Find and participate in Pokémon TCG, VGC and GO tournaments in Spain and Latin America"
    },
    create: {
      title: "Create new tournament",
      description: "Complete the basic information or upload a TDF from TOM.",
      breadcrumbs: {
        home: "Home",
        dashboard: "Dashboard",
        createTournament: "Create tournament"
      },
      backButton: "Back to dashboard",
      metadata: {
        title: "Create Tournament - RotomTracks",
        description: "Create and manage a new Pokémon tournament"
      }
    },
    details: {
      manageTournament: "Manage Tournament",
      notFound: "Tournament not found",
      metadata: {
        description: "Tournament details {{name}} in {{city}}, {{country}}. Type: {{type}}. Date: {{date}}.",
        openGraph: {
          description: "{{type}} tournament in {{city}}, {{country}}"
        }
      }
    }
  },

  // Admin pages
  admin: {
    dashboard: {
      title: "Dashboard",
      description: "System overview and organizer request metrics"
    }
  },

  // Auth pages
  auth: {
    error: {
      title: "Sorry, something went wrong.",
      codeError: "Code error: {{error}}",
      unspecifiedError: "An unspecified error occurred."
    },
    signupSuccess: {
      title: "Welcome to RotomTracks!",
      description: "Your tournament account has been created successfully",
      checkEmail: "Check your email",
      emailSent: "We've sent you a confirmation link to verify your account.",
      whatsNext: "What's next?",
      steps: {
        confirmEmail: "Confirm your email address",
        completeProfile: "Complete your profile setup",
        searchTournaments: "Start searching for tournaments",
        registerTrack: "Register and track your results"
      },
      signInButton: "Sign In to Your Account",
      backToHomeButton: "Back to Home"
    },
    completeProfile: {
      title: "Complete Your Profile",
      description: "Please complete your profile to access all tournament features",
      profileRequired: "Profile Required",
      profileRequiredDescription: "To participate in tournaments and access all features, please complete your profile with your tournament information."
    },
    unauthorized: {
      organizerRequired: {
        title: "Organizer Account Required",
        description: "This feature requires an organizer account to access.",
        suggestion: "To create tournaments and manage events, you need to upgrade your account to organizer status."
      },
      playerRequired: {
        title: "Player Account Required",
        description: "This feature requires a player account to access.",
        suggestion: "To participate in tournaments, you need to complete your player profile."
      },
      accessDenied: {
        title: "Access Denied",
        description: "You don't have permission to access this resource.",
        suggestion: "Please check your account permissions or contact support if you believe this is an error."
      },
      howToBecomeOrganizer: "How to become an organizer:",
      organizerSteps: {
        goToProfile: "Go to your profile settings",
        changeAccountType: "Change your account type to \"Organizer\"",
        addOrganization: "Add your organization information",
        saveChanges: "Save your changes"
      },
      updateProfileButton: "Update Profile",
      needHelp: "Need help? Contact support if you continue having access issues."
    }
  }
} as const;