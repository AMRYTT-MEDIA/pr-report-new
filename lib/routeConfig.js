// Simple route configuration - easy to extend
export const ROUTE_CONFIG = {
  // Public pages: accessible to everyone, but redirect to dashboard if logged in
  PUBLIC: [
    "/", // Home page
    "/login", // Login page
    "/register", // Register page
    "/contact", // Contact page
    "/pricing", // Pricing page
    "/services", // Services page
    "/report", // Public shared reports
  ],

  // Protected pages: require authentication
  PROTECTED: [
    "/pr-reports", // Upload reports
    "/pr-reports-list", // View all reports
    "/view-pr", // View specific report
    "/profile", // User profile
    "/settings", // User settings
  ],
};

// Helper function to check route type
export function getRouteType(path) {
  // Check if it's a public route
  if (ROUTE_CONFIG.PUBLIC.some((route) => path.startsWith(route))) {
    return "public";
  }

  // Check if it's a protected route
  if (ROUTE_CONFIG.PROTECTED.some((route) => path.startsWith(route))) {
    return "protected";
  }

  // Default to protected for unknown routes
  return "protected";
}

// Helper function to check if route is public
export function isPublicRoute(path) {
  return getRouteType(path) === "public";
}

// Helper function to check if route is protected
export function isProtectedRoute(path) {
  return getRouteType(path) === "protected";
}

// Helper function to get redirect URL for protected routes
export function getLoginRedirectUrl(originalPath) {
  return `/login?redirect=${encodeURIComponent(originalPath)}`;
}

// Helper function to get dashboard redirect URL for public routes
export function getDashboardRedirectUrl() {
  return "/pr-reports";
}
