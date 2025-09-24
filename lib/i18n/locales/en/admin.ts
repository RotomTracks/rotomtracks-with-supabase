/**
 * English translations for admin panel
 */

export const admin = {
  // General admin
  panel: "Admin Panel",
  verifyingPermissions: "Verifying admin permissions...",
  accessRestricted: "Access Restricted",
  accessRestrictedDescription: "This area is reserved for system administrators. You do not have the necessary permissions to access this section.",

  // Navigation
  navigation: {
    dashboard: "Dashboard",
    dashboardDescription: "Overview and metrics",
    organizerRequests: "Organizer Requests",
    organizerRequestsDescription: "Manage organizer requests",
    settings: "Settings",
    settingsDescription: "System configuration"
  },

  // Dashboard
  dashboard: {
    title: "System Metrics",
    lastUpdated: "Last updated",
    noData: "No data available",
    loading: "Loading...",
    metrics: {
      totalRequests: "Total Requests",
      totalRequestsDescription: "All registered requests",
      pending: "Pending",
      pendingDescription: "Awaiting review",
      approved: "Approved",
      approvedDescription: "Approved requests",
      underReview: "Under Review",
      underReviewDescription: "Being reviewed"
    },
    recentActivity: {
      title: "Recent Activity",
      description: "Latest actions performed by administrators",
      viewAll: "View all requests",
      empty: "No recent activity"
    },
    error: {
      title: "Error loading dashboard",
      loading: "Error loading dashboard data",
      invalidData: "Invalid dashboard data"
    },
    empty: {
      title: "No data available",
      description: "Admin tables have not been configured yet or contain no data."
    },
    actions: {
      approved: "Approved request",
      rejected: "Rejected request",
      underReview: "Marked for review",
      addedNotes: "Added notes",
      changedStatus: "Changed status",
      performedAction: "Performed action"
    }
  },

  // Organizer Requests
  organizerRequests: {
    title: "Organizer Requests",
    description: "Manage organizer requests",
    searchPlaceholder: "Search by organization name or requester...",
    filterPlaceholder: "Filter by status",
    loading: "Loading...",
    requestedBy: "Requested by",
    organization: "Organization",
    reviewed: "Reviewed",
    adminNotes: "Admin Notes",
    unknownUser: "Unknown User",
    resultsSummary: "Showing {{count}} of {{total}} requests{{statusFilter}}{{searchTerm}}",
    filters: {
      title: "Filters and Search",
      description: "Search and filter organizer requests",
      allStatuses: "All Statuses"
    },
    error: {
      loading: "Error loading requests",
      updateFailed: "Failed to update request"
    },
    empty: {
      title: "No organizer requests found",
      description: "There are no organizer requests at the moment.",
      descriptionFiltered: "No requests match your current filters. Try adjusting your search criteria."
    }
  },

  // Settings
  settings: {
    title: "System Settings",
    description: "Manage general platform configuration",
    general: {
      title: "General Settings",
      description: "Basic website configuration",
      siteName: "Site Name",
      siteNamePlaceholder: "Enter site name",
      siteDescription: "Site Description",
      siteDescriptionPlaceholder: "Enter site description"
    },
    system: {
      title: "System Settings",
      description: "System behavior configuration",
      maintenanceMode: "Maintenance Mode",
      maintenanceModeDescription: "Enable maintenance mode for all users",
      allowRegistration: "Allow Registration",
      allowRegistrationDescription: "Allow new users to register",
      requireEmailVerification: "Email Verification Required",
      requireEmailVerificationDescription: "Require email verification to activate accounts"
    },
    tournaments: {
      title: "Tournament Settings",
      description: "Tournament-related configuration",
      maxTournamentsPerUser: "Max Tournaments per User",
      maxTournamentsPerUserDescription: "Maximum number of tournaments a user can organize",
      autoApproveOrganizers: "Auto-approve Organizers",
      autoApproveOrganizersDescription: "Automatically approve organizer requests"
    },
    notifications: {
      title: "Notification Settings",
      description: "System notification configuration",
      enableNotifications: "Enable Notifications",
      enableNotificationsDescription: "Send email notifications to users"
    },
    analytics: {
      enableAnalytics: "Enable Analytics",
      enableAnalyticsDescription: "Collect usage data to improve the platform"
    },
    actions: {
      title: "Actions",
      description: "Save or reset configuration",
      save: "Save Settings",
      saving: "Saving...",
      reset: "Reset Values"
    }
  },

  // Activity types
  activity: {
    status_changed: "{{adminName}} changed status of {{organizationName}} from {{previousStatus}} to {{newStatus}}",
    notes_added: "{{adminName}} added notes to {{organizationName}}",
    user_role_assigned: "{{adminName}} assigned role to user"
  }
} as const;
