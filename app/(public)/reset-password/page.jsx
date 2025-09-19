import { Suspense } from "react";
import { ResetPasswordForm, ResetPasswordLoading } from "@/components/auth";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password",
  description:
    "Create a new password for your PR Reports account. Enter your new password to regain access to your account.",
};

export default function ResetPasswordPage({ searchParams }) {
  const oobCode = searchParams?.oobCode || null;

  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm oobCode={oobCode} />
    </Suspense>
  );
}
