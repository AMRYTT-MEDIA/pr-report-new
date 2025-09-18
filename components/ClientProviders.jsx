"use client";

import { AuthProvider } from "@/lib/auth";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { Toaster } from "@/components/ui/sonner";

export function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BreadcrumbProvider>
          {children}
          <Toaster />
        </BreadcrumbProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}
