"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();

  const isPRPage = pathname.includes("/report") || pathname.includes("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:ml-[250px]">
        {/* Header Navigation */}
        <NavBar isViewPRPage={isPRPage} />

        {/* Page Content */}
        <main className="bg-slate-50">
          <div className="m-[15px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
