"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ChevronRight, ChevronDown, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import PRBreadcrumb from "./PRBreadcrumb";
import { useState, useRef, useEffect } from "react";

export default function PRReportsNavigation({ isViewPRPage = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 ">
      <div className="flex justify-between items-center h-16 mx-[15px]">
        <PRBreadcrumb />

        {/* User Profile Section */}
        <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
          {/* Left Divider Line */}
          <div className="w-px h-8 bg-gray-200"></div>

          <div className="flex items-center space-x-3">
            {/* User Avatar with Online Status */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* User Info */}
            <div className="text-right">
              <div className="text-base font-bold text-gray-900">
                {user?.fullName
                  ? `${user.fullName.substring(0, 10)}...`
                  : "Publish rt..."}
              </div>
              <div className="text-sm text-gray-500">Admin</div>
            </div>

            {/* Dropdown Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* Dropdown Overlay */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Blue Line */}
      <div className="h-0.5 bg-blue-500"></div>
    </header>
  );
}
