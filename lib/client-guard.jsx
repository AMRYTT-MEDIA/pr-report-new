"use client";
import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth";
import Loading from "@/components/ui/loading";

export function Guard({ mode, children }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent infinite loops
    if (hasRedirected.current) return;

    // Wait for auth to be fully initialized
    if (!initialized || loading) return;
    if (mode === "public") return;

    if (!user) {
      hasRedirected.current = true;
      router.replace(`/login?next=${encodeURIComponent(path)}`);
    }
  }, [mode, user, loading, initialized, path, router]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (user) {
      hasRedirected.current = false;
    }
  }, [user]);

  // Show loading state while auth is initializing or not yet initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="lg" showText={true} text="Loading..." textColor="black" textPosition="bottom" />
      </div>
    );
  }

  // Don't render protected/private content if no user and auth is initialized
  if (mode !== "public" && !user && initialized) return null;

  return <>{children}</>;
}
