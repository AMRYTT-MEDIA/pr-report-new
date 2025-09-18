"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { ROUTES } from "@/constants/index.js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login immediately since this is just a landing page
    router.replace(ROUTES.LOGIN);
  }, [router]);

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    </AuthGuard>
  );
}
