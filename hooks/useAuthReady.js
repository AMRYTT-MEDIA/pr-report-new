"use client";

import { useAuth } from "@/lib/auth";

/**
 * Custom hook that returns true only when auth state is fully initialized
 * and ready for API calls that depend on Firebase UID.
 *
 * This ensures API calls don't fire until authentication is complete.
 */
export const useAuthReady = () => {
  const { initialized, loading, user } = useAuth();

  // Auth is ready when:
  // 1. Auth state is initialized
  // 2. Not currently loading
  // 3. We have a user (for protected routes) OR we know there's no user (for public routes)
  const isAuthReady = initialized && !loading;

  return {
    isAuthReady,
    user,
    initialized,
    loading,
  };
};
