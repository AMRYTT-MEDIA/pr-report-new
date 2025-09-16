/**
 * Global route protection configuration
 * Define which routes require which permissions
 */

import { canAccessUsers, canAccessReports, canAccessWebsite } from "./rbac";

// Define protected routes and their permission check functions
export const PROTECTED_ROUTES = {
  "/users": {
    permission: "admin",
    checkFunction: canAccessUsers,
    redirectTo: "/403",
  },
  "/pr-reports-list": {
    permission: ["admin", "manager", "staff"],
    checkFunction: canAccessReports,
    redirectTo: "/403",
  },
  "/website": {
    permission: ["admin", "manager", "staff"],
    checkFunction: canAccessWebsite,
    redirectTo: "/403",
  },
  // Add more protected routes here as needed
};

/**
 * Check if current route is protected and user has access
 * @param {string} pathname - Current route path
 * @param {Object} user - User object
 * @returns {Object} { isProtected, hasAccess, redirectTo }
 */
export const checkRouteAccess = (pathname, user) => {
  // Normalize pathname - remove trailing slash
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  // Check exact route match first
  let routeConfig = PROTECTED_ROUTES[normalizedPath];

  // If no exact match, check for pattern matches
  if (!routeConfig) {
    // Check for dynamic routes like /view-pr/[id]
    if (normalizedPath.startsWith("/view-pr")) {
      routeConfig = PROTECTED_ROUTES["/pr-reports-list"]; // Use same protection as PR reports
    }
  }

  if (!routeConfig) {
    return { isProtected: false, hasAccess: true, redirectTo: null };
  }

  // Route is protected, check access
  const hasAccess = routeConfig.checkFunction(user);

  return {
    isProtected: true,
    hasAccess,
    redirectTo: hasAccess ? null : routeConfig.redirectTo,
  };
};

/**
 * Get all protected routes for a user (for navigation filtering)
 * @param {Object} user - User object
 * @returns {Array} Array of accessible route paths
 */
export const getAccessibleRoutes = (user) => {
  const accessibleRoutes = [];

  Object.entries(PROTECTED_ROUTES).forEach(([path, config]) => {
    if (config.checkFunction(user)) {
      accessibleRoutes.push(path);
    }
  });

  return accessibleRoutes;
};
