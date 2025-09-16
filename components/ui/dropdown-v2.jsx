"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DropdownV2 = ({
  options = [],
  value = "",
  placeholder = "Select option",
  disabled = false,
  loading = false,
  error = false,
  touched = false,
  onChange,
  onBlur,
  onFocus,
  onOpenChange,
  name,
  className = "",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);

        // Call onOpenChange callback
        if (onOpenChange) {
          onOpenChange(false);
        }

        // Trigger blur when clicking outside
        if (onBlur) {
          onBlur({ target: { name: name || "" } });
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur, onOpenChange, name]);

  // Handle dropdown toggle
  const handleToggle = () => {
    if (disabled || loading) return;

    const newState = !isOpen;
    setIsOpen(newState);

    // Call onOpenChange callback
    if (onOpenChange) {
      onOpenChange(newState);
    }

    if (newState) {
      setFocused(true);
      if (onFocus) {
        onFocus({ target: { name: name || "" } });
      }
    } else {
      setFocused(false);
      if (onBlur) {
        onBlur({ target: { name: name || "" } });
      }
    }
  };

  // Handle option selection
  const handleSelect = (optionValue) => {
    if (disabled || loading) return;

    if (onChange) {
      onChange({ target: { name: name || "", value: optionValue } });
    }

    setIsOpen(false);
    setFocused(false);

    // Call onOpenChange callback
    if (onOpenChange) {
      onOpenChange(false);
    }

    // Trigger blur after selection
    setTimeout(() => {
      if (onBlur) {
        onBlur({ target: { name: name || "" } });
      }
    }, 0);
  };

  // Get selected option display value
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={cn(
          "w-full h-10 px-3.5 py-2.5 rounded-[6px] border flex items-center justify-between",
          "text-gray-scale-60 text-input-field transition-colors",

          error && touched && !isOpen
            ? "border-danger-scale-60 focus:ring-danger-scale-60"
            : "border-gray-scale-30 focus:ring-indigo-500",
          focused && !error ? "border-indigo-500" : "",
          disabled || loading
            ? "opacity-50 cursor-not-allowed bg-gray-50"
            : "hover:border-gray-scale-40 cursor-pointer",
          className
        )}
      >
        <span className="text-left truncate">
          {displayValue || placeholder}
        </span>

        {loading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
        ) : (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Dropdown Options */}
      {isOpen && !disabled && !loading && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1",
            "bg-white border border-slate-200 rounded-[6px]",
            "shadow-[0px_0px_20px_0px_rgba(52,64,84,0.3)]",
            "max-h-60 overflow-y-auto",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options available
            </div>
          ) : (
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors",
                    "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                    "flex items-center justify-between",
                    value === option.value
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownV2;
