"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Users, Globe, FileText, Menu, X, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Image from "next/image";

export default function ProtectedSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      href: "/website",
      icon: Globe,
      badge: null,
    },
    {
      name: "PR Reports",
      href: "/pr-reports/",
      icon: LayoutList,
      badge: "10", // Badge as shown in the image
    },
  ];

  const isActiveRoute = (href) => {
    return href === pathname;
  };

  const handleNavigation = (href) => {
    router.push(href);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full border-r border-slate-200 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          width: "288px",
          background: "var(--sidebar-background, #F8FAFC)",
        }}
      >
        <div className="flex flex-col justify-start items-start h-full px-4 py-8">
          {/* Top Section */}
          <div className="self-stretch flex flex-col justify-start items-start gap-8">
            {/* Logo */}
            <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
              <Image
                src="/guestpost-link.webp"
                alt="GUESTPOSTLINKS"
                width={224}
                height={44}
                className="w-56 h-11 object-contain"
                priority
              />
            </div>

            {/* Navigation Items */}
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <div
                    key={item.name}
                    className={cn(
                      "self-stretch min-h-12 px-3 py-2.5 rounded-full inline-flex justify-start items-center gap-2 overflow-hidden cursor-pointer transition-all duration-200",
                      isActive
                        ? "" // Active state styling applied via CSS variables
                        : "hover:bg-slate-100/50" // Hover state only for non-active items
                    )}
                    onClick={() => handleNavigation(item.href)}
                    style={{
                      ...(isActive && {
                        borderRadius:
                          "var(--border-radius-radius-full, 9999px)",
                        border: "1px solid var(--Gray-20, #E2E8F0)",
                        background: "var(--Gray-10, #F1F5F9)",
                      }),
                    }}
                  >
                    <div className="flex-1 flex justify-start items-center gap-2">
                      {/* Icon Container */}
                      <div className="w-6 h-6 relative flex items-center justify-center">
                        <Icon className="w-5 h-3.5 text-slate-500" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 justify-start text-slate-800 text-base font-medium font-['Inter']">
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main content margin for desktop */}
      <div className="hidden lg:block" style={{ marginLeft: "288px" }} />
    </>
  );
}
