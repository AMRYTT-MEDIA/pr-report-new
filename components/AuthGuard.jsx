"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getDefaultLandingPage } from "@/lib/rbac";
import Loading from "@/components/ui/loading";
import { LOADING_MESSAGES, ROUTES } from "@/constants/index.js";

/**
 * Centralized Auth Guard Component
 * Handles all authentication logic including:
 * - Firebase auth state checking
 * - Token validity verification
 * - Automatic token refresh
 * - Route protection and redirection
 * - Loading states during auth initialization
 */
export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = null,
  fallback = null,
}) {
  const { user, loading, initialized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // Wait for auth to be fully initialized
    if (!initialized || loading) return;

    // Handle protected routes
    if (requireAuth) {
      if (!user) {
        hasRedirected.current = true;
        const nextUrl = encodeURIComponent(pathname);
        router.replace(`${ROUTES.LOGIN}?next=${nextUrl}`);
        return;
      }
    }

    // Handle public routes (like login page)
    if (!requireAuth && user) {
      hasRedirected.current = true;
      // Redirect logged-in users away from login/public pages
      if (pathname === ROUTES.LOGIN || pathname === ROUTES.HOME) {
        const landingPage = redirectTo || getDefaultLandingPage(user);
        router.replace(landingPage);
        return;
      }
    }
  }, [requireAuth, user, loading, initialized, pathname, router, redirectTo]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (requireAuth && user) {
      hasRedirected.current = false;
    } else if (!requireAuth && !user) {
      hasRedirected.current = false;
    }
  }, [user, requireAuth]);

  // Show loading state while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading
          size="lg"
          color="purple"
          showText={true}
          text="Loading..."
          textColor="black"
          textPosition="bottom"
        />
      </div>
    );
  }

  // Handle protected routes
  if (requireAuth) {
    // Don't render protected content if no user and auth is initialized
    if (!user && initialized) {
      return fallback || null;
    }

    // User is authenticated, render children
    return <>{children}</>;
  }

  // Handle public routes
  if (!requireAuth) {
    // Don't render public routes (like login) if user is already logged in
    if (user && (pathname === ROUTES.LOGIN || pathname === ROUTES.HOME)) {
      return fallback || null;
    }

    // Render public content
    return <>{children}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-Order Component wrapper for AuthGuard
 * Usage: export default withAuthGuard(YourComponent, { requireAuth: true })
 */
export function withAuthGuard(Component, options = {}) {
  const WrappedComponent = (props) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );

  WrappedComponent.displayName = `withAuthGuard(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
}

/**
 * Hook to check if user has permission to access current route
 */
export function useRoutePermission() {
  const { user } = useAuth();
  const pathname = usePathname();

  const hasPermission = () => {
    if (!user) return false;

    // Import permissions dynamically to avoid circular dependencies
    const {
      canAccessUsers,
      canAccessReports,
      canAccessWebsite,
    } = require("@/lib/rbac");

    switch (pathname) {
      case ROUTES.USERS:
        return canAccessUsers(user);
      case ROUTES.PR_REPORTS:
        return canAccessReports(user);
      case ROUTES.WEBSITE:
        return canAccessWebsite(user);
      default:
        return true; // Allow access to other routes by default
    }
  };

  return {
    hasPermission: hasPermission(),
    user,
    pathname,
  };
}
