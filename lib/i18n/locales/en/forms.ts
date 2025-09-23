/**
 * English translations for forms and validation
 */

export const forms = {
  // Common form labels
  labels: {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    phone: "Phone",
    birthYear: "Birth Year",
    playerId: "Player ID",
    organizationName: "Organization Name",
    experienceDescription: "Experience Description",
    pokemonLeagueUrl: "Pokémon League URL",
    tournamentName: "Tournament Name",
    tournamentType: "Tournament Type",
    city: "City",
    startDate: "Start Date",
    endDate: "End Date",
    maxParticipants: "Max Participants",
    description: "Description",
    rules: "Rules",
    prizes: "Prizes",
    entryFee: "Entry Fee",
    registrationDeadline: "Registration Deadline",
    checkInTime: "Check-in Time",
    startTime: "Start Time"
  },

  // Placeholders
  placeholders: {
    firstName: "Enter your first name",
    lastName: "Enter your last name",
    email: "Enter your email address",
    password: "Enter your password",
    confirmPassword: "Confirm your password",
    phone: "Enter your phone number",
    birthYear: "Select your birth year",
    playerId: "Enter your Player ID",
    organizationName: "Enter organization name",
    experienceDescription: "Describe your tournament organizing experience",
    pokemonLeagueUrl: "Enter your Pokémon League URL",
    tournamentName: "Enter tournament name",
    city: "Enter city name",
    description: "Enter tournament description",
    rules: "Enter tournament rules",
    prizes: "Describe prizes",
    entryFee: "Enter entry fee amount",
    search: "Search...",
    searchTournaments: "Search tournaments by name, city, type...",
    searchUsers: "Search users...",
    searchOrganizations: "Search organizations..."
  },

  // Validation messages
  validation: {
    required: "This field is required",
    email: "Please enter a valid email address",
    url: "Please enter a valid URL",
    minLength: "Must be at least {{min}} characters",
    maxLength: "Must be no more than {{max}} characters",
    min: "Must be at least {{min}}",
    max: "Must be no more than {{max}}",
    pattern: "Please enter a valid format",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 8 characters",
    passwordTooLong: "Password must be no more than 128 characters",
    passwordWeak: "Password is too weak. Please include uppercase, lowercase, numbers and symbols",
    phoneInvalid: "Please enter a valid phone number",
    dateInvalid: "Please enter a valid date",
    datePast: "Date must be in the future",
    dateTooFar: "Date is too far in the future",
    numberInvalid: "Please enter a valid number",
    positiveNumber: "Must be a positive number",
    integer: "Must be a whole number",
    fileSize: "File size must be less than {{maxSize}}",
    fileType: "File type not supported",
    fileRequired: "Please select a file",
    termsAccepted: "You must accept the terms and conditions",
    ageRestriction: "You must be at least 13 years old",
    uniqueEmail: "This email is already registered",
    uniquePlayerId: "This Player ID is already taken",
    uniqueOrganizationName: "This organization name is already taken"
  },

  // Form sections
  sections: {
    personalInfo: "Personal Information",
    contactInfo: "Contact Information",
    accountInfo: "Account Information",
    organizerInfo: "Organizer Information",
    tournamentInfo: "Tournament Information",
    locationInfo: "Location Information",
    scheduleInfo: "Schedule Information",
    rulesInfo: "Rules and Regulations",
    prizesInfo: "Prizes and Awards",
    additionalInfo: "Additional Information"
  },

  // Form actions
  actions: {
    save: "Save",
    saveAndContinue: "Save and Continue",
    saveDraft: "Save Draft",
    submit: "Submit",
    submitForReview: "Submit for Review",
    cancel: "Cancel",
    reset: "Reset",
    clear: "Clear",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    close: "Close",
    edit: "Edit",
    update: "Update",
    delete: "Delete",
    duplicate: "Duplicate",
    preview: "Preview",
    publish: "Publish",
    unpublish: "Unpublish"
  },

  // Form states
  states: {
    loading: "Loading form...",
    saving: "Saving...",
    submitting: "Submitting...",
    processing: "Processing...",
    success: "Form submitted successfully",
    error: "Error submitting form",
    validationError: "Please fix the errors below",
    networkError: "Network error. Please try again.",
    timeoutError: "Request timed out. Please try again."
  },

  // File upload
  fileUpload: {
    dragAndDrop: "Drag and drop files here, or click to select",
    selectFiles: "Select Files",
    uploadProgress: "Uploading... {{progress}}%",
    uploadComplete: "Upload complete",
    uploadError: "Upload failed",
    fileTooLarge: "File is too large",
    fileTypeNotSupported: "File type not supported",
    maxFilesExceeded: "Maximum number of files exceeded",
    removeFile: "Remove file",
    replaceFile: "Replace file"
  },

  // Search and filters
  search: {
    placeholder: "Search...",
    noResults: "No results found",
    clearSearch: "Clear search",
    searchSuggestions: "Search suggestions",
    recentSearches: "Recent searches",
    popularSearches: "Popular searches"
  },

  filters: {
    all: "All",
    none: "None",
    selectAll: "Select All",
    clearFilters: "Clear Filters",
    applyFilters: "Apply Filters",
    filterBy: "Filter by {{field}}",
    sortBy: "Sort by {{field}}",
    ascending: "Ascending",
    descending: "Descending"
  }
} as const;
