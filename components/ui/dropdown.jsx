"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Dropdown({
  trigger,
  children,
  className = "",
  align = "right",
  onOpenChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50",
            "flex flex-col items-start",
            "w-[214px]",
            "rounded-[14px] border border-[#E2E8F0] bg-white",
            "shadow-[0_0_35px_0_rgba(208,213,221,0.50)]",
            align === "right" && "right-0 top-full mt-0",
            align === "left" && "left-0 top-full mt-2",
            align === "center" &&
              "left-1/2 top-full mt-2 transform -translate-x-1/2",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
