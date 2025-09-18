"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProfileOverlay Component
 * A reusable profile dropdown overlay that can be positioned anywhere in the header
 * Follows the Figma design patterns and integrates with existing auth system
 */
export default function ProfileOverlay({
  className = "",
  align = "right",
  showUserInfo = true,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        closeOverlay();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeOverlay = () => {
    setIsOpen(false);
    setTimeout(() => setIsVisible(false), 150);
  };

  const openOverlay = () => {
    setIsVisible(true);
    requestAnimationFrame(() => setIsOpen(true));
  };

  const handleToggle = () => {
    if (isOpen) {
      closeOverlay();
    } else {
      openOverlay();
    }
  };

  const handleProfileClick = () => {
    closeOverlay();
    if (onProfileClick) {
      onProfileClick();
    } else {
      router.push("/profile");
    }
  };

  const handleSettingsClick = () => {
    closeOverlay();
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleLogoutClick = async () => {
    closeOverlay();
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      try {
        await logout();
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  return (
    <div className={cn("relative", className)} ref={overlayRef}>
      {/* Profile Trigger Button */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        className="flex items-center space-x-2 lg:space-x-3 p-2 hover:bg-slate-50 rounded-lg"
      >
        {/* User Avatar with Online Status */}
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 font-semibold text-sm">
              {user?.fullName?.charAt(0)?.toUpperCase() || (
                <User className="w-4 h-4" />
              )}
            </AvatarFallback>
          </Avatar>
          {/* Online Status Indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        {/* User Info (desktop only) */}
        {showUserInfo && (
          <div className="hidden lg:block text-left">
            <div className="text-sm font-semibold text-gray-900">
              {user?.fullName
                ? `${user.fullName.substring(0, 10)}...`
                : "Publish rt..."}
            </div>
            <div className="text-xs text-gray-500">
              {user?.role?.name || "Admin"}
            </div>
          </div>
        )}

        {/* Dropdown Chevron */}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {/* Overlay Dropdown */}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-[240px] origin-top-right transition-all duration-150",
            "bg-white rounded-xl border border-slate-200 shadow-[0_0_35px_0_rgba(208,213,221,0.50)]",
            "overflow-hidden",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
            align === "right" && "right-0",
            align === "left" && "left-0",
            align === "center" && "left-1/2 transform -translate-x-1/2"
          )}
        >
          {/* Profile Header */}
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 font-semibold text-lg">
                  {user?.fullName?.charAt(0)?.toUpperCase() || (
                    <User className="w-5 h-5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user?.fullName || "Main User"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email || "user@example.com"}
                </div>
                <div className="text-xs text-indigo-600 font-medium">
                  {user?.role?.name || "Admin"}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>View Profile</span>
            </button>

            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </button>

            <div className="border-t border-slate-100 my-1"></div>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
