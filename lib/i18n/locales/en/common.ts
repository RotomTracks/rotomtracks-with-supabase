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
    retry: "Retry"
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
    tryAgain: "Try again",
    contactSupport: "Contact support"
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
  }
} as const;