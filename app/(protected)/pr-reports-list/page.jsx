import { PRReportsListClient } from "@/components/pr-reports-list";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "All PR Reports",
  description:
    "View and manage all your press release distribution reports. Track performance, share reports, and analyze campaign results.",
};

export default function PRReportsList() {
  return <PRReportsListClient />;
}
