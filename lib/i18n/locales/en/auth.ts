/**
 * English translations for authentication forms and messages
 */

export const auth = {
  // Login Form
  login: {
    title: "Sign In",
    description: "Enter your credentials to access your account",
    emailLabel: "Email address",
    emailPlaceholder: "your@email.com",
    emailHelp: "Enter the email address you used to register",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    forgotPassword: "Forgot your password?",
    submitButton: "Sign In",
    loadingButton: "Signing in...",
    signUpLink: "Don't have an account?",
    signUpLinkText: "Sign up"
  },

  // Sign Up Form
  signUp: {
    title: "Create Account",
    description: "Join the Pokémon tournament community",
    personalInfoTitle: "Personal information",
    accountTypeTitle: "Account type",
    emailLabel: "Email address",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Minimum 6 characters",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    firstNameLabel: "First name",
    firstNamePlaceholder: "Your first name",
    lastNameLabel: "Last name",
    lastNamePlaceholder: "Your last name",
    playerIdLabel: "Player ID",
    playerIdPlaceholder: "Your Player ID (number)",
    playerIdHelp: "Your unique identifier as a Pokémon player",
    birthYearLabel: "Birth year",
    birthYearPlaceholder: "YYYY",
    userRoleLabel: "Account type",
    userRolePlaceholder: "Select an account type",
    submitButton: "Create Account",
    loadingButton: "Creating account...",
    loginLink: "Already have an account?",
    loginLinkText: "Sign in",
    
    // Simple form translations
    simpleTitle: "Sign up",
    simpleDescription: "Create a new account",
    simpleEmailLabel: "Email",
    simpleEmailPlaceholder: "m@example.com",
    simplePasswordLabel: "Password",
    repeatPasswordLabel: "Repeat Password",
    simpleSubmitButton: "Sign up",
    simpleLoadingButton: "Creating an account...",
    simpleLoginLink: "Already have an account?",
    simpleLoginLinkText: "Login",
    
    // Role Selection
    roles: {
      player: {
        label: "Player",
        description: "Participate in tournaments and events"
      },
      organizer: {
        label: "Organizer",
        description: "Organize and manage tournaments"
      }
    },

    // Organizer Fields
    organizer: {
      sectionTitle: "Organizer Information",
      sectionDescription: "Additional information required for organizers",
      welcomeTitle: "Welcome as an organizer!",
      organizationNameLabel: "League/Store Name",
      organizationNamePlaceholder: "Your league/store/organization name",
      organizationNameExample: "Example: Madrid Pokémon League, Magic Cards Store, University Pokémon Club",
      businessEmailLabel: "Contact email",
      businessEmailPlaceholder: "contact@yourleague.com (optional)",
      businessEmailHelp: "Contact email for your league or store",
      phoneNumberLabel: "Contact phone",
      phoneNumberPlaceholder: "+1 XXX XXX XXXX (optional)",
      phoneNumberHelp: "Contact phone for your league or store",
      addressLabel: "Address",
      addressPlaceholder: "Your league or store address (optional)",
      pokemonLeagueUrlLabel: "Official League/Store Link",
      pokemonLeagueUrlPlaceholder: "https://www.pokemon.com/us/play-pokemon/... (optional)",
      pokemonLeagueUrlHelp: "Official URL of your league on the Pokémon website",
      experienceDescriptionLabel: "Organizer experience",
      experienceDescriptionPlaceholder: "Describe your experience organizing events... (optional)",
      experienceDescriptionHelp: "Tell us about your experience organizing tournaments or events",
      importantInfoTitle: "Important information",
      importantInfoDescription: "Your account will be reviewed by our team before activating organizer functions. This may take 1-2 business days. Meanwhile, you can use all player functions.",
      benefits: {
        title: "Benefits as organizer:",
        items: [
          "Create and manage tournaments",
          "Access to organization tools",
          "Advanced reports and statistics",
          "Priority support"
        ]
      },
      responsibilities: {
        title: "Responsibilities:",
        items: [
          "Follow official Pokémon rules",
          "Maintain a fair and fun environment",
          "Report results accurately",
          "Respect platform policies"
        ]
      }
    }
  },

  // Password Reset
  passwordReset: {
    title: "Reset Password",
    description: "Enter your email address to receive a recovery link",
    emailLabel: "Email address",
    emailPlaceholder: "your@email.com",
    submitButton: "Send link",
    loadingButton: "Sending...",
    backToLogin: "Back to sign in",
    success: {
      title: "Link sent",
      description: "Check your email for the recovery link"
    }
  },

  // Update Password
  updatePassword: {
    title: "Update Password",
    description: "Enter your new password",
    passwordLabel: "New password",
    passwordPlaceholder: "Minimum 6 characters",
    confirmPasswordLabel: "Confirm new password",
    confirmPasswordPlaceholder: "Repeat your new password",
    submitButton: "Update password",
    loadingButton: "Updating...",
    loadingSession: "Verifying session..."
  },

  // Validation Messages
  validation: {
    emailRequired: "Email address is required",
    emailInvalid: "Enter a valid email address",
    passwordRequired: "Password is required",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsNoMatch: "Passwords do not match",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    playerIdRequired: "Player ID is required",
    playerIdInvalid: "Player ID must be a number between 1 and 9999999",
    birthYearRequired: "Birth year is required",
    birthYearInvalid: "Enter a valid year (e.g., 1990)",
    birthYearTooOld: "You must be under 100 years old",
    birthYearTooYoung: "You must be at least 13 years old",
    userRoleRequired: "Select an account type",
    organizationNameRequired: "Organization name is required for organizers",
    organizationNameTooShort: "Organization name must be at least 2 characters"
  },

  // Error Messages
  errors: {
    generic: "An error occurred. Please try again",
    networkError: "Connection error. Check your internet",
    serverError: "Server error. Please try later",
    invalidCredentials: "Invalid credentials",
    emailAlreadyExists: "An account with this email already exists",
    playerIdAlreadyExists: "This Player ID is already in use",
    weakPassword: "Password is too weak",
    tooManyRequests: "Too many attempts. Please wait",
    sessionExpired: "Your session has expired. Please sign in again",
    emailNotConfirmed: "Confirm your email before continuing",
    accountDisabled: "Your account has been disabled. Contact support",
    passwordsDoNotMatch: "Passwords do not match"
  },

  // Success Messages
  success: {
    loginSuccess: "Welcome back!",
    signUpSuccess: "Account created successfully!",
    passwordResetSent: "Recovery link sent",
    passwordUpdated: "Password updated successfully",
    emailConfirmed: "Email confirmed"
  },

  // Profile
  profile: {
    noPlayerId: "No Player ID"
  },

  // Buttons
  buttons: {
    cancel: "Cancel",
    understood: "Understood"
  }
} as const;