import { ViewPRClient } from "@/components/view-pr";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "View PR Report",
  description:
    "View detailed press release distribution report with analytics, reach metrics, and publication outlets.",
};

export default function ViewPR() {
  return <ViewPRClient />;
}
