"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Globe,
  FileText,
  Menu,
  X,
  LayoutList,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { prReportsService } from "@/services/prReports";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prReportsCount, setPrReportsCount] = useState(0);

  const normalizePath = (path) => {
    if (!path) return "/";
    const trimmed = path.replace(/\/+$/, "");
    return trimmed === "" ? "/" : trimmed;
  };

  // Fetch PR reports count
  const fetchPRReportsCount = async () => {
    try {
      if (user) {
        const response = await prReportsService.getPRReportTotalCount();
        if (response && response?.data !== undefined) {
          setPrReportsCount(response?.data);
        }
      }
    } catch (error) {
      console.error("Error fetching PR reports count:", error);
    }
  };

  // Only the three navigation items as requested
  const navigationItems = [
    {
      name: "Users",
      href: "/users",
      icon: Users,
      badge: null,
    },
    {
      name: "Website",
      href: "/website/",
      icon: Globe,
      badge: null,
    },
    {
      name: "PR Reports",
      href: "/pr-reports-list/",
      icon: FileSpreadsheet,
      badge: prReportsCount > 0 ? prReportsCount.toString() : null,
    },
  ];

  const isActiveRoute = (href) => {
    return normalizePath(href) === normalizePath(pathname);
  };

  const handleNavigation = (href) => {
    router.push(href);
    setIsSidebarOpen(false);
  };

  // Fetch PR reports count when user is available
  useEffect(() => {
    if (user) {
      fetchPRReportsCount();
    }
  }, [user]);

  // Sync with global toggle events
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      if (e?.detail && typeof e.detail.open === "boolean") {
        setIsSidebarOpen(e.detail.open);
      }
    };
    window.addEventListener("app-sidebar-toggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("app-sidebar-toggle", handleSidebarToggle);
  }, []);

  // Restore persisted state
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("app-sidebar-open");
      if (saved !== null) setIsSidebarOpen(saved === "true");
    } catch {}
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        window.dispatchEvent(
          new CustomEvent("app-sidebar-toggle", { detail: { open: false } })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Broadcast and persist state so NavBar button reflects it
    try {
      sessionStorage.setItem("app-sidebar-open", String(isSidebarOpen));
    } catch {}
    window.dispatchEvent(
      new CustomEvent("app-sidebar-toggle", { detail: { open: isSidebarOpen } })
    );

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm pointer-events-auto cursor-default"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full border-r bg-white lg:bg-[#F8FAFC] border-slate-200 lg:border-[#E2E8F0] z-50 w-[250px] transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        id="app-sidebar"
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col justify-start items-start h-full px-4 py-8">
          {/* Top Section */}
          <div className="self-stretch flex flex-col justify-start items-start gap-8">
            {/* Logo */}
            <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
              <Image
                src="/guestpost-link.webp"
                alt="GUESTPOSTLINKS"
                width={202}
                height={41}
                className=" object-contain"
              />
            </div>

            {/* Navigation Items */}
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "self-stretch  h-[41px] px-3 py-2 rounded-full inline-flex justify-start items-center gap-2 overflow-hidden transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none active:outline-none focus:ring-0 active:ring-0",
                      active
                        ? "bg-slate-100 border border-slate-200"
                        : "hover:bg-slate-100/50 border border-transparent"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <div className="flex-1 flex justify-start items-center gap-2">
                      {/* Icon Container */}
                      <div className="w-5 h-5 relative flex items-center justify-center">
                        <Icon className=" text-slate-500" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 justify-start text-gray-scale-80 text-sm font-medium">
                        {item.name}
                      </div>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <div className="px-2.5 py-1 bg-indigo-50 rounded-full outline outline-1 outline-offset-[-1px] outline-indigo-300 flex justify-center items-center gap-1.5 overflow-hidden">
                        <div className="flex justify-center items-center gap-[5px]">
                          <div className="text-center justify-start text-indigo-600 text-sm font-semibold font-['Inter'] leading-none">
                            {item.badge}
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating close button to the right of the sidebar (mobile/tablet) */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="lg:hidden fixed top-4 left-[260px] p-2 rounded-xl border border-gray-200 bg-white shadow-md z-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
          onClick={() => {
            setIsSidebarOpen(false);
            try {
              sessionStorage.setItem("app-sidebar-open", "false");
            } catch {}
            window.dispatchEvent(
              new CustomEvent("app-sidebar-toggle", { detail: { open: false } })
            );
          }}
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
