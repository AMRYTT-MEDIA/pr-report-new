import { WebsiteTableClient } from "@/components/website";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Websites",
  description:
    "Manage your website list for press release distribution. Add, edit, and organize websites for your PR campaigns.",
};

export default function WebsitePage() {
  return <WebsiteTableClient />;
}
