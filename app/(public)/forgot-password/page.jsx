import { ForgotPasswordForm } from "@/components/auth";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forgot Password",
  description:
    "Reset your PR Reports account password. Enter your email to receive password reset instructions.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
