"use client";
import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth";
import Loading from "@/components/ui/loading";

export function PublicGuard({ children }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent infinite loops
    if (hasRedirected.current) return;

    // Wait for auth to be fully initialized
    if (!initialized) return;

    // If user is already logged in and on login page, redirect to dashboard
    if (user && (path === "/login" || path === "/")) {
      hasRedirected.current = true;
      router.replace("/pr-reports-list");
    }
  }, [user, initialized, path, router]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (!user) {
      hasRedirected.current = false;
    }
  }, [user]);

  // Show minimal loading only if not initialized
  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading
          size="lg"
          showText={true}
          text="Loading..."
          textColor="black"
          textPosition="bottom"
        />
      </div>
    );
  }

  // Don't render login page if user is already logged in
  if (user && (path === "/login" || path === "/")) return null;

  return <>{children}</>;
}
