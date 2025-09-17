import { ProtectedLayoutClient } from "@/components/ProtectedLayoutClient";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function ProtectedLayout({ children }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
