"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export const useAuthGuard = (requireAuth = true) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to login if authentication is required but user is not logged in
        router.push("/login");
        setCanRender(false);
      } else if (!requireAuth && user) {
        // Redirect to dashboard if user is logged in but page doesn't require auth
        router.push("/pr-reports");
        setCanRender(false);
      } else {
        // Authentication requirements are met
        setCanRender(true);
      }
    }
  }, [user, loading, requireAuth, router]);

  return { canRender, loading, user, isAuthenticated: !!user };
};
