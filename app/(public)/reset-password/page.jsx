import { Suspense } from "react";
import { ResetPasswordForm, ResetPasswordLoading } from "@/components/auth";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function ResetPasswordPage({ searchParams }) {
  const oobCode = searchParams?.oobCode || null;

  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm oobCode={oobCode} />
    </Suspense>
  );
}
