/**
 * English translations for common UI elements
 */

export const common = {
  // Navigation
  navigation: {
    home: "Home",
    tournaments: "Tournaments",
    profile: "Profile",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",
    signUp: "Sign Up",
    language: "Current language: {{current}}",
    languageOptions: "Language options"
  },

  // Common buttons and actions
  buttons: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    submit: "Submit",
    reset: "Reset",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    close: "Close",
    open: "Open",
    view: "View",
    download: "Download",
    upload: "Upload",
    back: "Back",
    next: "Next",
    previous: "Previous",
    continue: "Continue",
    finish: "Finish",
    confirm: "Confirm",
    retry: "Retry",
    reload: "Reload",
    reloadPage: "Reload page",
    continueWithoutAuth: "Continue without authentication",
    understood: "Understood",
    goBack: "Go Back",
    backToHome: "Back to Home",
    backToTournaments: "Back to Tournaments",
    requestNew: "Request New"
  },

  // Status and states
  status: {
    loading: "Loading...",
    saving: "Saving...",
    deleting: "Deleting...",
    updating: "Updating...",
    processing: "Processing...",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    active: "Active",
    inactive: "Inactive",
    enabled: "Enabled",
    disabled: "Disabled"
  },

  // Form elements
  form: {
    required: "Required",
    optional: "Optional",
    placeholder: "Enter here...",
    select: "Select...",
    selectOption: "Select an option",
    noOptions: "No options available",
    search: "Search...",
    searchResults: "Search results",
    noResults: "No results found",
    showMore: "Show more",
    showLess: "Show less",
    selectAll: "Select all",
    deselectAll: "Deselect all"
  },

  // Time and dates
  time: {
    now: "Now",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This week",
    lastWeek: "Last week",
    nextWeek: "Next week",
    thisMonth: "This month",
    lastMonth: "Last month",
    nextMonth: "Next month",
    thisYear: "This year",
    lastYear: "Last year",
    nextYear: "Next year"
  },

  // Common messages
  messages: {
    welcome: "Welcome!",
    goodbye: "Goodbye!",
    thankYou: "Thank you!",
    pleaseWait: "Please wait...",
    comingSoon: "Coming soon",
    underMaintenance: "Under maintenance",
    notFound: "Not found",
    accessDenied: "Access denied",
    sessionExpired: "Session expired",
    networkError: "Network error",
    serverError: "Server error",
    unknownError: "Unknown error",
    unexpectedError: "An unexpected error occurred",
    tryAgain: "Try again",
    contactSupport: "Contact support",
    accountCreated: "Account created successfully! Please check your email to confirm your account."
  },

  // UI interactions
  ui: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    showConfirmPassword: "Show confirm password",
    hideConfirmPassword: "Hide confirm password",
    edit: "Edit",
    copy: "Copy data",
    copied: "Copied!",
    copyError: "Error copying to clipboard"
  },

  // Account types
  account: {
    playerAccount: "Player Account",
    organizerAccount: "Organizer Account",
    organizerApproved: "Approved Organizer Account"
  },

  // Pagination
  pagination: {
    page: "Page",
    of: "of",
    items: "items",
    itemsPerPage: "items per page",
    first: "First",
    last: "Last",
    showing: "Showing",
    to: "to",
    total: "total"
  },

  // Confirmation dialogs
  confirmation: {
    areYouSure: "Are you sure?",
    thisActionCannotBeUndone: "This action cannot be undone",
    confirmDelete: "Do you confirm you want to delete this?",
    confirmCancel: "Do you confirm you want to cancel?",
    unsavedChanges: "You have unsaved changes",
    loseChanges: "Do you want to leave without saving changes?"
  },

  // File handling
  file: {
    upload: "Upload file",
    download: "Download file",
    delete: "Delete file",
    size: "Size",
    type: "Type",
    name: "Name",
    lastModified: "Last modified",
    dragAndDrop: "Drag and drop files here",
    browseFiles: "Browse files",
    maxSize: "Maximum size",
    allowedTypes: "Allowed types",
    uploadSuccess: "File uploaded successfully",
    uploadError: "Error uploading file",
    invalidType: "Invalid file type",
    fileTooLarge: "File too large"
  },

  // Validation messages
  validation: {
    required: "This field is required",
    firstNameRequired: "First name is required",
    firstNameMinLength: "First name must be at least 2 characters",
    lastNameRequired: "Last name is required",
    lastNameMinLength: "Last name must be at least 2 characters",
    playerIdRequired: "Player ID is required",
    playerIdMinLength: "Player ID must be at least 3 characters",
    birthYearRequired: "Birth year is required",
    birthYearInvalid: "Birth year must be a valid year between 1900 and current year",
    organizationNameRequired: "Organization name is required when requesting organizer role",
    invalidUrl: "Please enter a valid URL",
    invalidProtocol: "URL must start with http:// or https://"
  },

  // Page specific
  pages: {
    home: {
      loading: "Loading Rotom Tracks...",
      loadingTooLong: "The application is taking longer than expected to load...",
      connectionError: "Connection error: {{error}}",
      loadingAuth: "Loading authentication..."
    },
    profile: {
      title: "My Profile",
      updateProfile: "Update Profile",
      completeProfile: "Complete Profile"
    },
    tournaments: {
      title: "Tournaments"
    },
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
    authError: {
      title: "Authentication Error",
      description: "There was a problem with your authentication link.",
      expired: "The confirmation link has expired. Please request a new one.",
      invalid: "The confirmation link is invalid or has already been used.",
      requestNewConfirmation: "Request New Confirmation"
    },
    debug: {
      title: "Supabase Diagnostic",
      description: "Debug your Supabase connection and configuration",
      helpText: "This diagnostic tool helps identify connection issues with Supabase. If you see errors, check your environment variables and network connection."
    }
  }
} as const;