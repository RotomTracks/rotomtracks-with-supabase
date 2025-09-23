/**
 * English translations for common UI elements
 */

export const common = {
  // Language options
  languageOptions: "Language options",

  // Profile
  profile: {
    title: "My Profile",
    updateProfile: "Update Profile",
    completeProfile: "Complete Profile"
  },

  // Tournaments
  tournaments: {
    title: "Tournaments"
  },

  // Unauthorized access messages
  unauthorized: {
    organizerRequired: {
      title: "Organizer Access Required",
      description: "This feature is only available to tournament organizers.",
      suggestion: "If you need to organize tournaments, please update your account type in your profile settings."
    },
    playerRequired: {
      title: "Player Access Required", 
      description: "This feature is only available to registered players.",
      suggestion: "Please make sure your account is set up as a player account."
    },
    accessDenied: {
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      suggestion: "Please check your account permissions or contact support if you believe this is an error."
    }
  },

  // Authentication errors
  authError: {
    title: "Authentication Error",
    description: "There was a problem with your authentication link.",
    expired: "The confirmation link has expired. Please request a new one.",
    invalid: "The confirmation link is invalid or has already been used.",
    requestNewConfirmation: "Request New Confirmation"
  },

  // Debug
  debug: {
    title: "Supabase Diagnostic",
    description: "Debug your Supabase connection and configuration",
    helpText: "This diagnostic tool helps identify connection issues with Supabase. If you see errors, check your environment variables and network connection."
  }
} as const;