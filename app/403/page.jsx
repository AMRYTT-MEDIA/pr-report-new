import ForbiddenContent from "@/components/ForbiddenContent";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Access Denied",
  description:
    "You don't have permission to access this page. Please contact your administrator for access.",
};

export default function ForbiddenPage() {
  return <ForbiddenContent />;
}
