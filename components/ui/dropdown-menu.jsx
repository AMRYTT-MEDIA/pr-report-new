"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function DropdownMenu({
  trigger,
  menuItems = [],
  className = "",
  align = "right",
  onOpenChange,
  showProfile = false,
  profileData = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  const closeWithAnimation = () => {
    setIsOpen(false);
    onOpenChange?.(false);
    // Wait for transition to finish before unmounting
    window.setTimeout(() => setIsVisible(false), 150);
  };

  const handleToggle = () => {
    if (!isOpen) {
      setIsVisible(true);
      // Allow next tick so transition applies
      window.requestAnimationFrame(() => {
        setIsOpen(true);
        onOpenChange?.(true);
      });
    } else {
      closeWithAnimation();
    }
  };

  // Prevent body scroll when dropdown is visible (during animation too)
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    closeWithAnimation();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content with enter/exit animation */}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 origin-top-right transition-all duration-150",
            "flex flex-col items-start",
            "w-[214px]",
            "rounded-[14px] border border-[#E2E8F0] bg-white",
            "shadow-[0_0_35px_0_rgba(208,213,221,0.50)]",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
            align === "right" && "right-0 top-full mt-0",
            align === "left" && "left-0 top-full mt-2",
            align === "center" &&
              "left-1/2 top-full mt-2 transform -translate-x-1/2",
            className
          )}
        >
          {/* Profile Section */}
          {showProfile && profileData && (
            <>
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : profileData.name ? (
                      <span className="text-blue-600 font-semibold text-lg">
                        {profileData.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <div className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  {profileData.showStatus && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="text-base font-bold text-gray-900">
                    {profileData.name || "Main Text"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {profileData.role || "Admin"}
                  </div>
                </div>
              </div>

              {/* SVG Divider */}
              <div className="w-full flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="194"
                  height="2"
                  viewBox="0 0 194 2"
                  fill="none"
                  className="self-stretch"
                >
                  <path
                    d="M194 0.999983L0 1"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </>
          )}

          {/* Menu Items */}
          <div className="px-[10px] py-2 flex flex-col gap-[5px">
            {menuItems.map((item, index) => (
              <div key={index} className="px-[8px]">
                <button
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full flex items-center space-x-3 py-[6px] text-left text-sm text-gray-scale-60 font-medium  transition-colors",
                    item.className
                  )}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <item.icon className="w-[18px] h-[18px] text-gray-scale-60" />
                  )}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
                {/* Add divider after View Profile and Settings only */}
                {index === 1 && (
                  <div className="w-full flex justify-center py-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="194"
                      height="2"
                      viewBox="0 0 194 2"
                      fill="none"
                      className="self-stretch"
                    >
                      <path
                        d="M194 0.999983L0 1"
                        stroke="#E2E8F0"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
