/**
 * Global Constants & Configuration
 * Centralized location for all static values, strings, and reusable config
 */

// Application Configuration
export const APP_CONFIG = {
  name: "GUESTPOSTLINKS PR Reports",
  version: "1.0.0",
  defaultLanguage: "en",
  title: "PR Reports",
  description: "Professional PR distribution platform",
  logo: "/guestpost-link.webp",
  logoAlt: "GUESTPOSTLINKS",
};

// Error Messages
export const ERROR_MESSAGES = {
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",
  LOGIN_FAILED: "Login failed. Please check your credentials.",
  USER_NOT_FOUND: "User not found in system.",
  AUTHENTICATION_FAILED: "Authentication failed. Please sign in again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SESSION_EXPIRED: "Session expired. Please sign in again.",
  ACCESS_DENIED: "Access denied. You don't have permission to view this page.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCOUNT_DISABLED: "Your account has been disabled. Please contact support.",
  TOO_MANY_REQUESTS: "Too many login attempts. Please try again later.",
  WEAK_PASSWORD: "Password should be at least 6 characters long.",
  EMAIL_ALREADY_IN_USE: "An account with this email already exists.",
  INVALID_EMAIL: "Please enter a valid email address.",
  REQUIRED_FIELD: "This field is required.",
  OPERATION_FAILED: "Operation failed. Please try again.",
  DELETE_CONFIRMATION: "Are you sure you want to delete this item?",
  UNSAVED_CHANGES: "You have unsaved changes. Are you sure you want to leave?",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful! Welcome back.",
  LOGOUT_SUCCESS: "You have been logged out successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_RESET_SENT: "Password reset link sent to your email.",
  PASSWORD_CHANGED: "Password changed successfully.",
  DATA_SAVED: "Data saved successfully.",
  DATA_DELETED: "Data deleted successfully.",
  OPERATION_SUCCESS: "Operation completed successfully.",
  EMAIL_VERIFIED: "Email verified successfully.",
  INVITATION_SENT: "Invitation sent successfully.",
};

// Loading Messages
export const LOADING_MESSAGES = {
  DEFAULT: "Loading...",
  AUTHENTICATING: "Authenticating...",
  SAVING: "Saving...",
  DELETING: "Deleting...",
  PROCESSING: "Processing...",
  UPLOADING: "Uploading...",
  FETCHING_DATA: "Fetching data...",
  PLEASE_WAIT: "Please wait...",
  INITIALIZING: "Initializing...",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
};

// Role Display Names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: "Administrator",
  [USER_ROLES.MANAGER]: "Manager",
  [USER_ROLES.STAFF]: "Staff Member",
};

// User Status
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
};

// Status Display Names
export const STATUS_DISPLAY_NAMES = {
  [USER_STATUS.ACTIVE]: "Active",
  [USER_STATUS.INACTIVE]: "Inactive",
  [USER_STATUS.PENDING]: "Pending",
  [USER_STATUS.SUSPENDED]: "Suspended",
};

// Routes Configuration
export const ROUTES = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  REPORT_PUBLIC: "/report",
  FORBIDDEN: "/403",

  // Protected Routes
  DASHBOARD: "/users", // Default dashboard for admins
  USERS: "/users",
  WEBSITE: "/website",
  BLOCK_URLS: "/block-urls",
  PR_REPORTS: "/pr-reports-list",
  VIEW_PR: "/view-pr",
};

// Navigation Items Configuration
export const NAVIGATION_ITEMS = [
  {
    name: "Users",
    href: ROUTES.USERS,
    icon: "Users",
    permission: "canAccessUsers",
    badge: null,
    isPrivate: true,
  },
  {
    name: "Website",
    href: ROUTES.WEBSITE,
    icon: "Globe",
    permission: "canAccessWebsite",
    badge: null,
    isPrivate: true,
  },
  {
    name: "Block URLs",
    href: ROUTES.BLOCK_URLS,
    icon: "Ban",
    permission: null, // Available to all authenticated users
    badge: null,
    isPrivate: true,
  },
  {
    name: "PR Reports",
    href: ROUTES.PR_REPORTS,
    icon: "FileSpreadsheet",
    permission: "canAccessReports",
    badge: "dynamic", // Will be populated with count
    isPrivate: true,
  },
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 5,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: {
    CSV: ["text/csv", "application/vnd.ms-excel"],
    IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    PDF: ["application/pdf"],
  },
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: `File size must be less than ${10}MB`,
    INVALID_TYPE: "Invalid file type",
    UPLOAD_FAILED: "File upload failed. Please try again.",
  },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy HH:mm",
  INPUT: "yyyy-MM-dd",
  API: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  RELATIVE: "relative", // For relative time display
};

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: "indigo",
    SECONDARY: "gray",
    SUCCESS: "green",
    WARNING: "yellow",
    ERROR: "red",
    INFO: "blue",
  },
  SIDEBAR_WIDTH: "250px",
  HEADER_HEIGHT: "64px",
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  URL: {
    MAX_LENGTH: 2048,
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  SIDEBAR_STATE: "app-sidebar-open",
  THEME: "app-theme",
  LANGUAGE: "app-language",
  USER_PREFERENCES: "app-user-preferences",
};

// Default Values
export const DEFAULTS = {
  AVATAR_PLACEHOLDER: "/placeholder.svg",
  COMPANY_LOGO_PLACEHOLDER: "/placeholder.svg",
  ITEMS_PER_PAGE: PAGINATION.DEFAULT_PAGE_SIZE,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
};

// Feature Flags
export const FEATURES = {
  DARK_MODE: false,
  MULTI_LANGUAGE: false,
  EMAIL_NOTIFICATIONS: true,
  ADVANCED_PERMISSIONS: true,
  BULK_OPERATIONS: true,
  EXPORT_DATA: true,
  AUDIT_LOGS: false,
};

// External Links
export const EXTERNAL_LINKS = {
  SUPPORT: "mailto:support@guestpostlinks.com",
  DOCUMENTATION: "#",
  PRIVACY_POLICY: "#",
  TERMS_OF_SERVICE: "#",
};
