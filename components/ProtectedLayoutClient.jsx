"use client";

import { AuthGuard } from "@/components/AuthGuard";
import LayoutWrapper from "@/components/LayoutWrapper";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";

export function ProtectedLayoutClient({ children }) {
  return (
    <AuthGuard requireAuth={true}>
      <BreadcrumbProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
      </BreadcrumbProvider>
    </AuthGuard>
  );
}
