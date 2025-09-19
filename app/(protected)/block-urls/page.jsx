import { BlockUrlsClient } from "@/components/block-urls";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Block URLs",
  description:
    "Manage blocked URLs and domains for your press release distribution campaigns. Control which sites to exclude from your PR outreach.",
};

export default function BlockUrlsPage() {
  return <BlockUrlsClient />;
}
