import { LoginPageClient } from "@/components/login";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login",
  description:
    "Sign in to your PR Reports account to access your press release distribution dashboard and manage your campaigns.",
};

export default function LoginPage({ searchParams }) {
  return <LoginPageClient searchParams={searchParams} />;
}
