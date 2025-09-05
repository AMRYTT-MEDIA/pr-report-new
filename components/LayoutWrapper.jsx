"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const { breadcrumbItems } = useBreadcrumb();

  const isPRPage = pathname.includes("/report") || pathname.includes("/login");

  return (
    <div className="min-h-dvh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:ml-[250px]">
        {/* Header Navigation */}
        <NavBar isViewPRPage={isPRPage} breadcrumbItems={breadcrumbItems} />

        {/* Page Content */}
        <main>
          <div className="m-[15px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
