"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getDefaultLandingPage } from "@/lib/rbac";
import { LoginForm } from "@/components/auth";
import Loading from "@/components/ui/loading";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize
    if (!initialized) return;

    // If user is already logged in, redirect to appropriate page
    if (user) {
      // Priority: next parameter > role-based landing page
      const nextUrl = searchParams?.next || getDefaultLandingPage(user);
      router.replace(nextUrl);
    }
  }, [user, initialized, router, searchParams]);

  // Show minimal loading while checking auth
  if (!initialized) {
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

  // Don't render login form if user is already logged in
  if (user) return null;

  return <LoginForm searchParams={searchParams} />;
}
