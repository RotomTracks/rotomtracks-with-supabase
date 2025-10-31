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
  },

  // Help/FAQ page
  help: {
    title: "Help & FAQ",
    subtitle: "Find answers to the most common questions about RotomTracks",
    faq: {
      search: {
        question: "How does tournament search work?",
        answer: "You can search for tournaments using our search bar by entering keywords like tournament name, city, or type (TCG, VGC, GO). Use the filters to narrow down results by location, date range, and tournament status. The platform also supports location detection to show tournaments near you."
      },
      createAccount: {
        question: "How do I create an account?",
        answer: "Click on the 'Sign Up' button in the navigation bar, fill in your email and password, and verify your email address. After signing up, you'll be able to complete your profile with additional information like your Player ID and birth year."
      },
      registerTournament: {
        question: "How do I register for a tournament?",
        answer: "Browse available tournaments using the search function or explore featured tournaments on the home page. Click on a tournament to view its details, and if registrations are open, you'll see a 'Register' button. Complete your profile if prompted, then confirm your registration."
      },
      organizeTournament: {
        question: "How do I organize a tournament?",
        answer: "You need an organizer account to create tournaments. Go to your profile and update your account type to 'Organizer', then add your organization information. Once approved, you can create tournaments from your dashboard, upload TDF files, and manage participant registrations."
      },
      tournamentTypes: {
        question: "What tournament types are supported?",
        answer: "RotomTracks supports three main tournament formats: <strong>TCG</strong> (Trading Card Game), <strong>VGC</strong> (Video Game Championships), and <strong>Pokémon GO</strong>. Each tournament type has its own specific features and result management tools."
      },
      organizerFeatures: {
        question: "What features are available for organizers?",
        answer: "Organizers can create and manage tournaments, upload TDF files for automatic result processing, generate HTML reports, manage participant registrations, track tournament status, and access detailed analytics. The platform automatically processes TOM-generated TDF files."
      }
    },
    stillNeedHelp: {
      title: "Still need help?",
      description: "If you can't find the answer you're looking for, please contact us through our contact page. We're here to help!"
    }
  },

  // Terms and Conditions page
  terms: {
    title: "Terms and Conditions",
    lastUpdated: "Last updated: January 2024",
    sections: {
      acceptance: {
        title: "1. Acceptance of Terms",
        content: "By accessing and using RotomTracks, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
      },
      purpose: {
        title: "2. Purpose of Service",
        content: "RotomTracks is a free platform designed to help local tournament organizers and players facilitate the organization and participation in Pokémon tournaments. Our primary goals are to:\n\n• Assist local tournament organizers in managing and publishing tournament information\n• Help players discover and register for tournaments in their area\n• Facilitate the publication and sharing of tournament results\n• Provide tools for tracking tournament history and player statistics\n\nThe platform is completely free of charge. We do not charge users for accessing or using any features of RotomTracks. All services are provided at no cost."
      },
      use: {
        title: "3. Use of Service",
        content: "RotomTracks provides a platform for organizing and participating in Pokémon tournaments. You agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account and password. Users must use the platform in good faith and for legitimate tournament-related purposes only."
      },
      pokemonCompliance: {
        title: "4. Compliance with Pokémon Company International Terms",
        content: "RotomTracks is an independent fan-operated service and is not affiliated with, endorsed by, or sponsored by The Pokémon Company International, Nintendo, Game Freak, or Creatures Inc.\n\nAll Pokémon-related content, including but not limited to names, characters, images, and trademarks, are the property of The Pokémon Company International, Nintendo, Game Freak, and Creatures Inc.\n\nRotomTracks operates in compliance with all applicable terms and conditions set forth by The Pokémon Company International, including:\n\n• Respecting intellectual property rights of Pokémon content\n• Not using official Pokémon trademarks in ways that may cause confusion\n• Operating as a non-commercial fan service\n• Adhering to guidelines for fan-operated websites\n\nIf any content on RotomTracks is found to be in violation of The Pokémon Company International's terms, we will remove it promptly upon notification."
      },
      responsibilities: {
        title: "5. User Responsibilities",
        content: "Users are responsible for the accuracy of information provided on the platform. Organizers are responsible for the accuracy of tournament information and results. Users must not engage in any activity that disrupts or interferes with the service. Organizers are responsible for ensuring their tournaments comply with local laws and regulations, as well as any applicable rules from official Pokémon tournament organizers."
      },
      intellectual: {
        title: "6. Intellectual Property",
        content: "The service and its original content, features, and functionality are owned by RotomTracks and are protected by international copyright, trademark, and other intellectual property laws. All Pokémon-related intellectual property remains the exclusive property of The Pokémon Company International, Nintendo, Game Freak, and Creatures Inc. RotomTracks does not claim ownership of any Pokémon-related trademarks or copyrights."
      },
      liability: {
        title: "7. Limitation of Liability",
        content: "RotomTracks shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. We strive to provide accurate information, but we do not guarantee the accuracy of tournament results or data provided by third parties. RotomTracks is provided \"as is\" without warranties of any kind."
      },
      modifications: {
        title: "8. Modifications to Terms",
        content: "We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through a notice on the platform. Continued use of the service after such modifications constitutes acceptance of the updated terms."
      }
    },
    contact: "If you have any questions about these Terms and Conditions, please contact us through our contact page."
  },

  // Privacy Policy page
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: January 2024",
    commitment: {
      title: "Our Commitment to Your Privacy",
      noThirdParties: "We do not share your data with third parties",
      noAdvertising: "We do not use your data for advertising purposes",
      dataSecurity: "We implement strong security measures to protect your information"
    },
    sections: {
      dataCollected: {
        title: "Information We Collect",
        content: "We collect information that you provide directly to us, including:\n\n• Account information (email address)\n• Profile information (Player ID, birth year, organization details for organizers)\n• Tournament participation data\n• Tournament organization data (for organizers)\n\nWe may also collect certain information automatically to improve the website's functionality and user experience."
      },
      dataUse: {
        title: "How We Use Your Information",
        content: "We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Process tournament registrations and results\n• Communicate with you about your account and tournaments\n• Ensure platform security and prevent fraud\n\n<strong>Important:</strong> We do not sell, rent, or share your personal information with third parties for advertising or marketing purposes. Your data is used solely to provide and improve the RotomTracks platform."
      },
      security: {
        title: "Data Security",
        content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure data storage, and regular security audits.\n\n<strong>Password Security:</strong> Your password is managed and encrypted by our authentication service provider. RotomTracks never has access to your password in any form. Passwords are securely hashed and stored according to industry-standard security practices. Authentication and password management are handled by a trusted third-party service provider that specializes in secure authentication.\n\nHowever, no method of transmission over the Internet is 100% secure."
      },
      rights: {
        title: "Your Rights",
        content: "You have the right to:\n\n• Access your personal data\n• Request correction of inaccurate data\n• Request deletion of your data\n• Object to processing of your data\n• Data portability\n\nTo exercise these rights, please contact us through our contact page. We will respond to your request within 30 days."
      },
      pokemonData: {
        title: "Pokémon-Related Data",
        content: "RotomTracks processes tournament-related data that may include references to Pokémon gameplay, tournament formats (TCG, VGC, GO), and competitive gaming information. This data is used exclusively to:\n\n• Facilitate tournament organization and participation\n• Publish tournament results and standings\n• Track player statistics and tournament history\n• Improve platform functionality for the Pokémon tournament community\n\nWe do not collect, store, or process any personal information about Pokémon characters, gameplay data from Pokémon games, or any proprietary game information. All tournament data is limited to publicly available information about competitive events.\n\nRotomTracks respects the privacy policies and terms of service established by The Pokémon Company International and handles all data in accordance with their guidelines for fan-operated services. Any Pokémon-related trademarks, characters, or content remain the exclusive property of The Pokémon Company International, Nintendo, Game Freak, and Creatures Inc."
      }
    },
    contact: "If you have any questions about this Privacy Policy, please contact us through our contact page."
  },

  // Contact page
  contact: {
    title: "Contact Us",
    subtitle: "We're here to help! Get in touch with our team.",
    comingSoon: "Our contact form is coming soon. Please check back later or reach out through our support channels."
  }
} as const;