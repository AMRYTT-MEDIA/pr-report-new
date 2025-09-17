"use client";

import { Guard } from "@/lib/client-guard";
import LayoutWrapper from "@/components/LayoutWrapper";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";

export function ProtectedLayoutClient({ children }) {
  return (
    <Guard mode="protected">
      <BreadcrumbProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
      </BreadcrumbProvider>
    </Guard>
  );
}
