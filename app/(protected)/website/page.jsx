import { WebsiteTableClient } from "@/components/website";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function WebsitePage() {
  return <WebsiteTableClient />;
}
