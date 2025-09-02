"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/auth";
import Loading from "@/components/ui/loading";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is already logged in, redirect to dashboard
      router.replace("/pr-reports-list");
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loading size="lg" color="purple" showText={true} text="Loading..." />
        </div>
      </div>
    );
  }

  // Show login form only if user is not logged in
  if (!user) {
    return <LoginForm />;
  }

  // This should not be reached due to the redirect above, but just in case
  return null;
}
