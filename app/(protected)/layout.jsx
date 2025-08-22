"use client";
import { Guard } from "@/lib/client-guard";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function ProtectedLayout({ children }) {
  return (
    <Guard mode="protected">
      <LayoutWrapper>{children}</LayoutWrapper>
    </Guard>
  );
}
