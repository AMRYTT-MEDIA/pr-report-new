"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  getRouteType,
  getLoginRedirectUrl,
  getDashboardRedirectUrl,
} from "../lib/routeConfig";
import PRReportsNavigation from "./PRReportsNavigation";
import PRBreadcrumb from "./PRBreadcrumb";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  const isPRPage = pathname.includes("/report");

  return (
    <>
      {/* Show navigation on all PR pages when authenticated */}
      {user && (
        <>
          <PRReportsNavigation isViewPRPage={isPRPage} />
          <PRBreadcrumb />
        </>
      )}
      {children}
    </>
  );
};

export default LayoutWrapper;
