/**
 * Centralized Route Configuration
 * Single source of truth for all route definitions and sidebar navigation
 */

import { ROUTES, NAVIGATION_ITEMS } from "@/constants/index.js";
import {
  Users,
  Globe,
  FileText,
  FileSpreadsheet,
  Ban,
  Home,
  LogIn,
  Lock,
  Shield,
} from "lucide-react";

// Icon mapping for dynamic icon rendering
export const ICON_MAP = {
  Users,
  Globe,
  FileText,
  FileSpreadsheet,
  Ban,
  Home,
  LogIn,
  Lock,
  Shield,
};

/**
 * Complete route configuration with metadata
 * Used for routing, navigation, permissions, and SEO
 */
export const ROUTE_CONFIG = [
  // Public Routes
  {
    path: ROUTES.HOME,
    name: "Home",
    title: "Home - PR Reports",
    description: "Professional PR distribution platform",
    icon: "Home",
    isPublic: true,
    isPrivate: false,
    showInSidebar: false,
    requireAuth: false,
    permission: null,
    component: "HomePage",
  },
  {
    path: ROUTES.LOGIN,
    name: "Login",
    title: "Login - PR Reports",
    description: "Sign in to your account",
    icon: "LogIn",
    isPublic: true,
    isPrivate: false,
    showInSidebar: false,
    requireAuth: false,
    permission: null,
    component: "LoginPage",
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    name: "Forgot Password",
    title: "Forgot Password - PR Reports",
    description: "Reset your password",
    icon: "Lock",
    isPublic: true,
    isPrivate: false,
    showInSidebar: false,
    requireAuth: false,
    permission: null,
    component: "ForgotPasswordPage",
  },
  {
    path: ROUTES.RESET_PASSWORD,
    name: "Reset Password",
    title: "Reset Password - PR Reports",
    description: "Create a new password",
    icon: "Lock",
    isPublic: true,
    isPrivate: false,
    showInSidebar: false,
    requireAuth: false,
    permission: null,
    component: "ResetPasswordPage",
  },
  {
    path: ROUTES.FORBIDDEN,
    name: "Access Denied",
    title: "403 - Access Denied",
    description: "You don't have permission to access this page",
    icon: "Shield",
    isPublic: true,
    isPrivate: false,
    showInSidebar: false,
    requireAuth: false,
    permission: null,
    component: "ForbiddenPage",
  },

  // Protected Routes
  {
    path: ROUTES.USERS,
    name: "Users",
    title: "Users - PR Reports",
    description: "Manage system users and permissions",
    icon: "Users",
    isPublic: false,
    isPrivate: true,
    showInSidebar: true,
    requireAuth: true,
    permission: "canAccessUsers",
    component: "UsersPage",
    badge: null,
    order: 1,
  },
  {
    path: ROUTES.WEBSITE,
    name: "Website",
    title: "Website Management - PR Reports",
    description: "Manage websites and publications",
    icon: "Globe",
    isPublic: false,
    isPrivate: true,
    showInSidebar: true,
    requireAuth: true,
    permission: "canAccessWebsite",
    component: "WebsitePage",
    badge: null,
    order: 2,
  },
  {
    path: ROUTES.BLOCK_URLS,
    name: "Block URLs",
    title: "Block URLs - PR Reports",
    description: "Manage blocked URLs and domains",
    icon: "Ban",
    isPublic: false,
    isPrivate: true,
    showInSidebar: true,
    requireAuth: true,
    permission: null, // Available to all authenticated users
    component: "BlockUrlsPage",
    badge: null,
    order: 3,
  },
  {
    path: ROUTES.PR_REPORTS,
    name: "PR Reports",
    title: "PR Reports - PR Reports",
    description: "View and manage PR reports",
    icon: "FileSpreadsheet",
    isPublic: false,
    isPrivate: true,
    showInSidebar: true,
    requireAuth: true,
    permission: "canAccessReports",
    component: "PRReportsPage",
    badge: "dynamic", // Will be populated with count
    order: 4,
  },
  {
    path: ROUTES.VIEW_PR,
    name: "View PR Report",
    title: "View PR Report - PR Reports",
    description: "View detailed PR report",
    icon: "FileText",
    isPublic: false,
    isPrivate: true,
    showInSidebar: false, // Don't show dynamic routes in sidebar
    requireAuth: true,
    permission: "canAccessReports",
    component: "ViewPRPage",
    badge: null,
  },
];

/**
 * Get routes that should be shown in sidebar navigation
 * Filtered by user permissions and sorted by order
 */
export const getSidebarRoutes = (user = null) => {
  return ROUTE_CONFIG.filter((route) => {
    // Only show routes marked for sidebar
    if (!route.showInSidebar) return false;

    // If no user, don't show any private routes
    if (!user && route.isPrivate) return false;

    // Check permissions if specified
    if (route.permission && user) {
      // Import permissions dynamically to avoid circular dependencies
      const { hasPermission } = require("@/lib/rbac");
      return hasPermission(user, route.permission);
    }

    return true;
  }).sort((a, b) => (a.order || 999) - (b.order || 999));
};

/**
 * Get public routes (accessible without authentication)
 */
export const getPublicRoutes = () => {
  return ROUTE_CONFIG.filter((route) => route.isPublic);
};

/**
 * Get protected routes (require authentication)
 */
export const getProtectedRoutes = () => {
  return ROUTE_CONFIG.filter((route) => route.isPrivate);
};

/**
 * Find route configuration by path
 */
export const getRouteByPath = (path) => {
  return ROUTE_CONFIG.find((route) => route.path === path);
};

/**
 * Check if a route exists
 */
export const routeExists = (path) => {
  return ROUTE_CONFIG.some((route) => route.path === path);
};

/**
 * Get route metadata for SEO
 */
export const getRouteMetadata = (path) => {
  const route = getRouteByPath(path);
  if (!route) return null;

  return {
    title: route.title,
    description: route.description,
  };
};

/**
 * Generate breadcrumbs for a given path
 */
export const generateBreadcrumbs = (path) => {
  const route = getRouteByPath(path);
  if (!route) return [];

  const breadcrumbs = [
    { name: "Dashboard", href: ROUTES.USERS, current: false },
  ];

  if (path !== ROUTES.USERS) {
    breadcrumbs.push({
      name: route.name,
      href: route.path,
      current: true,
    });
  } else {
    breadcrumbs[0].current = true;
  }

  return breadcrumbs;
};
