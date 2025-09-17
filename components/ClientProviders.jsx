"use client";

import { AuthProvider } from "@/lib/auth";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";
import { Toaster } from "@/components/ui/sonner";

export function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <BreadcrumbProvider>
        {children}
        <Toaster />
      </BreadcrumbProvider>
    </AuthProvider>
  );
}
