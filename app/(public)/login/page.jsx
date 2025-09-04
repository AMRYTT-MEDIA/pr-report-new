"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LoginForm } from "@/components/auth";
import Loading from "@/components/ui/loading";

export default function LoginPage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (initialized && user) {
      // User is already logged in, redirect to intended page or default to pr-reports-list
      setIsRedirecting(true);
      const next = searchParams.get("next") || "/pr-reports-list";
      // Use push instead of replace for better UX, and add a small delay to ensure smooth transition
      setTimeout(() => {
        router.push(next);
      }, 100);
    }
  }, [user, initialized, router, searchParams]);

  // Show loading while checking auth state or redirecting
  if (!initialized || loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loading size="lg" color="purple" showText={false} />
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
