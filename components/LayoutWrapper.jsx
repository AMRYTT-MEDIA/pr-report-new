"use client";

import { usePathname } from "next/navigation";
import ProtectedSidebar from "./ProtectedSidebar";
import PRReportsNavigation from "./PRReportsNavigation";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();

  const isPRPage = pathname.includes("/report") || pathname.includes("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ProtectedSidebar />

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Header Navigation */}
        <PRReportsNavigation isViewPRPage={isPRPage} />

        {/* Page Content */}
        <main className="min-h-screen bg-slate-50">
          <div className="m-[15px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
