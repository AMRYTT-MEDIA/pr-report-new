"use client";

import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export function ClientProviders({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
