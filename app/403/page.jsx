import ForbiddenContent from "@/components/ForbiddenContent";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function ForbiddenPage() {
  return <ForbiddenContent />;
}
