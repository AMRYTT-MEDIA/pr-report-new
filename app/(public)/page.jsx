"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getDefaultLandingPage } from "@/lib/rbac";
import Loading from "@/components/ui/loading";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function HomePage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Wait for auth to initialize
    if (!initialized) return;

    // If user is logged in, redirect to role-based landing page
    if (user) {
      const landingPage = getDefaultLandingPage(user);
      router.replace(landingPage);
    } else {
      // If no user, redirect to login
      router.replace("/login");
    }
  }, [user, initialized, router]);

  // Show minimal loading while determining redirect
  if (!initialized || loading) {
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

  // Don't render anything while redirecting
  return null;
}
