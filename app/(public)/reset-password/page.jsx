import { Suspense } from "react";
import { ResetPasswordForm, ResetPasswordLoading } from "@/components/auth";

const ResetPasswordPage = ({ searchParams }) => {
  // Extract oobCode from searchParams
  const oobCode = searchParams?.oobCode || null;

  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm oobCode={oobCode} />
    </Suspense>
  );
};

export default ResetPasswordPage;
