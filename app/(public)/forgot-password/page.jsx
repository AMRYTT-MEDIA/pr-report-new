import { ForgotPasswordForm } from "@/components/auth";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
