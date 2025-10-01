/**
 * Role-Based Access Control (RBAC) utilities
 */

// Define role constants [[memory:6580424]]
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
};

// Alternative role names that might be used in the database
export const ROLE_ALIASES = {
  admin: ["admin", "administrator", "Admin", "Administrator"],
  manager: ["manager", "Manager", "project_manager", "Project Manager"],
  staff: ["staff", "Staff", "employee", "Employee", "user", "User"],
};

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canAccessUsers: true,
    canManageUsers: true,
    canAccessReports: true,
    canAccessWebsite: true,
    canManageWebsite: true, // Admin can add, edit, delete websites
    canDeleteReports: true, // Admin can delete reports
  },
  [ROLES.MANAGER]: {
    canAccessUsers: false,
    canManageUsers: false,
    canAccessReports: true,
    canAccessWebsite: true,
    canManageWebsite: true, // Manager can add, edit, delete websites
    canDeleteReports: true, // Manager can delete reports
  },
  [ROLES.STAFF]: {
    canAccessUsers: false,
    canManageUsers: false,
    canAccessReports: true,
    canAccessWebsite: true,
    canManageWebsite: false, // Staff can only view websites, no add/edit/delete
    canDeleteReports: false, // Staff cannot delete reports
  },
};

/**
 * Normalize role name to standard format
 * @param {string} roleName - Role name to normalize
 * @returns {string|null} - Normalized role name or null if not found
 */
export const normalizeRoleName = (roleName) => {
  if (!roleName) return null;

  const lowerRoleName = roleName.toLowerCase();

  // Check each role alias
  for (const [standardRole, aliases] of Object.entries(ROLE_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === lowerRoleName)) {
      return standardRole;
    }
  }

  return lowerRoleName; // Return as-is if no alias found
};

/**
 * Get user's role name - handles multiple data structures
 * @param {Object} user - User object from Firebase API
 * @returns {string|null}
 */
export const getUserRole = (user) => {
  // Only use role.name - no other checks
  if (user?.role?.name) return user.role.name;

  return null;
};

/**
 * Check if a user has a specific role
 * @param {Object} user - User object from Firebase API
 * @param {string} roleName - Role name to check
 * @returns {boolean}
 */
export const hasRole = (user, roleName) => {
  if (!user) return false;

  const userRole = normalizeRoleName(getUserRole(user));
  const targetRole = normalizeRoleName(roleName);

  return userRole === targetRole;
};

/**
 * Check if a user has any of the specified roles
 * @param {Object} user - User object from Firebase API
 * @param {string[]} roleNames - Array of role names to check
 * @returns {boolean}
 */
export const hasAnyRole = (user, roleNames) => {
  if (!user || !user.role || !Array.isArray(roleNames)) return false;
  return roleNames.some((roleName) => hasRole(user, roleName));
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object from Firebase API
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user) {
    return false;
  }

  const originalRole = getUserRole(user);
  const userRole = normalizeRoleName(originalRole);
  const rolePermissions = ROLE_PERMISSIONS[userRole];

  // If we don't have specific permissions for this role, provide fallback logic
  if (!rolePermissions) {
    // Fallback: deny access to users module for unknown roles, allow others
    if (permission === "canAccessUsers" || permission === "canManageUsers") {
      return false;
    }
    // Allow access to reports and website for unknown roles
    return true;
  }

  const result = rolePermissions[permission] === true;
  return result;
};

/**
 * Check if user can access the Users module
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const canAccessUsers = (user) => hasPermission(user, "canAccessUsers");

/**
 * Check if user can manage users (create, edit, delete)
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const canManageUsers = (user) => hasPermission(user, "canManageUsers");

/**
 * Check if user can access PR Reports
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const canAccessReports = (user) => hasPermission(user, "canAccessReports");

/**
 * Check if user can access Website module
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const canAccessWebsite = (user) => hasPermission(user, "canAccessWebsite");

/**
 * Check if user can manage websites (add, edit, delete)
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const canManageWebsite = (user) => hasPermission(user, "canManageWebsite");

/**
 * Check if user can delete reports
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const canDeleteReports = (user) => hasPermission(user, "canDeleteReports");

/**
 * Check if user is admin
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);

/**
 * Check if user is manager
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const isManager = (user) => hasRole(user, ROLES.MANAGER);

/**
 * Check if user is staff
 * @param {Object} user - User object from Firebase API
 * @returns {boolean}
 */
export const isStaff = (user) => hasRole(user, ROLES.STAFF);

/**
 * Get the default landing page for a user based on their role
 * @param {Object} user - User object from Firebase API
 * @returns {string} Default page path for the user
 */
export const getDefaultLandingPage = (user) => {
  if (!user) return "/login";

  // Admin gets Users page as default (highest permission)
  if (canAccessUsers(user)) {
    return "/users";
  }

  // Manager/Staff get PR Reports as default
  if (canAccessReports(user)) {
    return "/pr-reports-list";
  }

  // Fallback to website if available
  if (canAccessWebsite(user)) {
    return "/website";
  }

  // Ultimate fallback
  return "/pr-reports-list";
};

/**
 * Filter navigation items based on user permissions
 * @param {Array} navigationItems - Array of navigation items
 * @param {Object} user - User object from Firebase API
 * @returns {Array} Filtered navigation items
 */
export const filterNavigationByPermissions = (navigationItems, user) => {
  if (!Array.isArray(navigationItems)) {
    return [];
  }

  // If no user, return empty array (let auth guard handle redirect)
  if (!user) {
    return [];
  }

  const filtered = navigationItems.filter((item) => {
    // Check specific route permissions using same logic as route protection
    switch (item.href) {
      case "/users":
        return canAccessUsers(user);
      case "/block-urls":
        return hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
      case "/pr-reports-list":
        return canAccessReports(user);
      case "/website":
        return canAccessWebsite(user);
      default:
        return true; // Allow access to other routes by default
    }
  });

  return filtered;
};
