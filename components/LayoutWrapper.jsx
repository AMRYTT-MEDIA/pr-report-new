"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import GlobalRouteGuard from "./GlobalRouteGuard";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const { breadcrumbItems } = useBreadcrumb();
  const isPRPage = pathname.includes("/report") || pathname.includes("/login");

  return (
    <GlobalRouteGuard>
      <div className="min-h-dvh">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="lg:ml-[250px]">
          {/* Header Navigation */}
          <NavBar isViewPRPage={isPRPage} breadcrumbItems={breadcrumbItems} />

          {/* Page Content */}
          <main>
            <div className={"m-[10px] sm:m-[15px]"}>{children}</div>
          </main>
        </div>
      </div>
    </GlobalRouteGuard>
  );
};

export default LayoutWrapper;
