"use client";
import { Guard } from "@/lib/client-guard";
import LayoutWrapper from "@/components/LayoutWrapper";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";

export default function ProtectedLayout({ children }) {
  return (
    <Guard mode="protected">
      <BreadcrumbProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
      </BreadcrumbProvider>
    </Guard>
  );
}
