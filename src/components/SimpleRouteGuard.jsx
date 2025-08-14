"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";

const SimpleRouteGuard = ({
  children,
  requireAuth = true,
  fallback = null,
}) => {
  const { canRender, loading } = useAuthGuard(requireAuth);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full border-b-2 border-purple-600 h-12 w-12"></div>
      </div>
    );
  }

  if (!canRender) {
    return fallback;
  }

  return children;
};

export default SimpleRouteGuard;
