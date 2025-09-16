"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { checkRouteAccess } from "@/lib/routeProtection";
import Loading from "@/components/ui/loading";

/**
 * Global route protection component
 * Automatically protects routes based on configuration
 */
const GlobalRouteGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // If no user, let auth guard handle login redirect
    if (!user) return;

    // Normalize pathname for checking
    const normalizedPath =
      pathname.endsWith("/") && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;

    // Force redirect for Manager role on users page
    if (normalizedPath === "/users" && user?.role?.name === "Manager") {
      router.replace("/403");
      return;
    }

    // Check if current route needs protection
    const { isProtected, hasAccess, redirectTo } = checkRouteAccess(
      pathname,
      user
    );

    if (isProtected && !hasAccess && redirectTo) {
      router.replace(redirectTo);
    }
  }, [user, loading, pathname, router]);

  // Don't render children if we're redirecting or checking protection
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  // Block rendering for protected routes without access
  if (!loading && user) {
    const { isProtected, hasAccess } = checkRouteAccess(pathname, user);
    if (isProtected && !hasAccess) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loading
            size="lg"
            color="purple"
            showText={true}
            text="Redirecting..."
            textColor="black"
            textPosition="bottom"
          />
        </div>
      );
    }
  }

  return children;
};

export default GlobalRouteGuard;
