/**
 * English translations for UI components
 */

export const ui = {
  // Common UI elements
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
    goToDashboard: "Go to Dashboard",
    backToSite: "Back to Site",
    backToTournaments: "Back to Tournaments",
    requestNew: "Request New",
    approve: "Approve",
    reject: "Reject",
    refresh: "Refresh"
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
    disabled: "Disabled",
    unknown: "Unknown",
    approved: "Approved",
    rejected: "Rejected",
    underReview: "Under Review"
  },

  // Form elements
  form: {
    required: "Required field",
    optional: "Optional",
    invalidEmail: "Invalid email address",
    invalidUrl: "Invalid URL",
    passwordTooShort: "Password must be at least 8 characters",
    passwordsDoNotMatch: "Passwords do not match",
    fieldRequired: "This field is required",
    selectOption: "Select an option",
    noOptions: "No options available",
    searchPlaceholder: "Search...",
    loading: "Loading...",
    submit: "Submit",
    cancel: "Cancel",
    reset: "Reset",
    save: "Save",
    update: "Update",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish"
  },

  // Navigation
  navigation: {
    home: "Home",
    tournaments: "Tournaments",
    profile: "Profile",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",
    signUp: "Sign Up",
    language: "Language",
    languageOptions: "Language options",
    theme: "Theme",
    admin: "Admin",
    settings: "Settings",
    account: "Account"
  },

  // Messages and notifications
  messages: {
    success: {
      saved: "Changes saved successfully",
      created: "Created successfully",
      updated: "Updated successfully",
      deleted: "Deleted successfully",
      uploaded: "File uploaded successfully",
      sent: "Message sent successfully"
    },
    error: {
      generic: "An error occurred",
      network: "Network error. Please check your connection.",
      unauthorized: "You are not authorized to perform this action",
      forbidden: "Access denied",
      notFound: "Resource not found",
      serverError: "Server error. Please try again later.",
      validation: "Please check the form for errors",
      timeout: "Request timed out. Please try again.",
      unknown: "An unknown error occurred"
    },
    warning: {
      unsavedChanges: "You have unsaved changes",
      confirmDelete: "Are you sure you want to delete this item?",
      dataLoss: "This action may cause data loss"
    },
    info: {
      noData: "No data available",
      loading: "Loading data...",
      processing: "Processing...",
      success: "Operation completed successfully"
    }
  },

  // Pagination
  pagination: {
    pageOfTotal: "Page {{page}} of {{totalPages}}",
    showingResults: "Showing {{start}} to {{end}} of {{total}} results",
    firstPage: "First page",
    lastPage: "Last page",
    nextPage: "Next page",
    previousPage: "Previous page",
    goToPage: "Go to page",
    resultsPerPage: "Results per page"
  },

  // Accessibility
  accessibility: {
    closeModal: "Close modal",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleMenu: "Toggle menu",
    toggleTheme: "Toggle theme",
    skipToContent: "Skip to main content",
    skipToNavigation: "Skip to navigation",
    loading: "Loading content",
    error: "Error occurred",
    success: "Success",
    warning: "Warning",
    info: "Information",
    hidePassword: "Hide password",
    showPassword: "Show password",
    mainNavigation: "Main navigation",
    goToHomepage: "Go to homepage",
    loadingAuth: "Loading authentication",
    selectLanguage: "Select language",
    currentLanguage: "Current language"
  }
} as const;
