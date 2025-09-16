"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  MenuSquare,
  Settings,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import CommonBreadcrumb from "./CommonBreadcrumb";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MenuIcon } from "./icon";
import DropdownMenu from "./ui/dropdown-menu";

const NavBar = ({ isViewPRPage = false, breadcrumbItems = [] }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync with sidebar state updates
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

  const toggleSidebar = () => {
    const next = !isSidebarOpen;
    setIsSidebarOpen(next);
    try {
      sessionStorage.setItem("app-sidebar-open", String(next));
    } catch {}
    window.dispatchEvent(
      new CustomEvent("app-sidebar-toggle", { detail: { open: next } })
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsDropdownOpen(false);
  };

  if (isViewPRPage) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 ">
      <div className="flex justify-between items-center h-14 mx-[15px]">
        {/* Left: Logo on mobile/tablet, breadcrumb on desktop */}
        <div className="flex items-center">
          {/* Logo (mobile/tablet only) */}
          <Image
            src="/guestpost-link.webp"
            alt="GUESTPOSTLINKS"
            className=" object-contain block lg:hidden"
            height={32}
            width={158}
          />
          {/* Breadcrumb (desktop only) */}
          <div className="hidden lg:block">
            <CommonBreadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Right cluster: hamburger (mobile) + user */}
        <div className="flex items-center space-x-3">
          {/* User Dropdown */}
          <DropdownMenu
            align="right"
            onOpenChange={setIsDropdownOpen}
            showProfile={true}
            profileData={{
              name: user?.fullName || "Main Text",
              role: user?.role?.name || "Test",
              avatar: user?.avatar,
              showStatus: true,
            }}
            menuItems={[
              {
                label: "View Profile",
                icon: User,
                onClick: () => {},
              },
              {
                label: "Settings",
                icon: Settings,
                onClick: () => {},
              },
              {
                label: "Sign Out",
                icon: LogOut,
                onClick: handleLogout,
              },
            ]}
            trigger={
              <div className="flex items-center space-x-2 lg:space-x-3 ">
                {/* User Avatar with Online Status */}
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : user?.fullName ? (
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* User Info (desktop only) */}
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {user?.fullName
                      ? `${user.fullName.substring(0, 10)}...`
                      : "Publish rt..."}
                  </div>
                  <div className="text-xss text-gray-500">
                    {user?.role?.name || "Test"}
                  </div>
                </div>

                {/* Dropdown Button */}
                <div className="p-1 text-gray-secondary  rounded-md ">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform"
                      // isDropdownOpen && "rotate-180"
                    )}
                  />
                </div>
              </div>
            }
          />

          {/* Divider between user and hamburger (mobile/tablet) */}
          <div className="lg:hidden w-px h-8 bg-gray-200" />

          {/* Mobile hamburger to toggle sidebar, positioned after avatar */}
          <button
            className="lg:hidden p-2 hover:bg-gray-50"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={toggleSidebar}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
