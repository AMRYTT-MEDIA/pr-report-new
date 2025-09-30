"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Dropdown({
  trigger,
  children,
  className = "",
  align = "right",
  onOpenChange,
  onSelect,
  placeholder = "Select option",
  value = "",
  error = false,
  focused = false,
  disabled = false,
  loading = false,
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

  const handleSelect = (value) => {
    onSelect?.(value);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger || (
          <button
            type="button"
            className={cn(
              "h-10 rounded-[6px] px-3.5 py-2.5 border w-full flex items-center justify-between",
              error ? "border-red-600" : "border-slate-300",
              loading ? "opacity-50 cursor-not-allowed" : "",
              disabled ? "opacity-50 cursor-not-allowed" : ""
            )}
            disabled={disabled || loading}
          >
            <span className="text-slate-600" style={{ opacity: 0.7 }}>
              {value || placeholder}
            </span>
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Content */}
      <div
        className={cn(
          "absolute z-50",
          "flex flex-col items-start",
          "w-full",
          "rounded-[6px] border border-slate-200 bg-white",
          "shadow-[0px_0px_20px_0px_rgba(52,64,84,0.3)]",
          "transition-all duration-200 ease-in-out",
          "origin-top",
          align === "right" && "right-0 top-full",
          align === "left" && "left-0 top-full",
          align === "center" && "left-1/2 top-full transform -translate-x-1/2",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-0 pointer-events-none",
          className
        )}
      >
        <div className="flex flex-col gap-[3px] items-start justify-center overflow-clip relative w-full">
          <div className="bg-white box-border flex flex-col gap-[5px] items-center justify-start px-0 py-[5px] relative rounded-bl-[8px] rounded-br-[8px] shadow-[0px_0px_20px_0px_rgba(52,64,84,0.3)] shrink-0 w-full">
            <div className="box-border flex flex-col items-start justify-start px-1 py-0 relative shrink-0 w-full">
              {React.cloneElement(children, { onSelect: handleSelect })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
