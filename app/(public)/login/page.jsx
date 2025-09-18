"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { getDefaultLandingPage } from "@/lib/rbac";
import { LoginForm } from "@/components/auth";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }) {
  // Get redirect URL from searchParams or use role-based landing page
  const getRedirectUrl = () => {
    return searchParams?.next || null; // Let AuthGuard handle default landing page
  };

  return (
    <AuthGuard requireAuth={false} redirectTo={getRedirectUrl()}>
      <LoginForm searchParams={searchParams} />
    </AuthGuard>
  );
}
