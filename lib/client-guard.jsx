"use client";
import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth";
import Loading from "@/components/ui/loading";

export function Guard({ mode, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent infinite loops
    if (hasRedirected.current) return;

    if (loading) return; // Wait for auth to load
    if (mode === "public") return;

    if (!user) {
      hasRedirected.current = true;
      router.replace(`/login?next=${encodeURIComponent(path)}`);
    }
  }, [mode, user, loading, path, router]);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (user) {
      hasRedirected.current = false;
    }
  }, [user]);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="lg" color="purple" />
      </div>
    );
  }

  // Don't render protected/private content if no user
  if (mode !== "public" && !user) return null;

  return <>{children}</>;
}
