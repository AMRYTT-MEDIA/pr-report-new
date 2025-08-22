"use client";

import { usePathname } from "next/navigation";
import PRReportsNavigation from "./PRReportsNavigation";
import PRBreadcrumb from "./PRBreadcrumb";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();

  const isPRPage = pathname.includes("/report") || pathname.includes("/login");

  return (
    <>
      {/* Show navigation on all protected pages */}
      <PRReportsNavigation isViewPRPage={isPRPage} />
      <PRBreadcrumb />
      {children}
    </>
  );
};

export default LayoutWrapper;
