import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

const CustomSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  className,
  size = "default",
}) => {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-4 p-0.5",
    default: "w-10 h-5 p-0.5",
    lg: "w-12 h-6 p-1",
  };

  const circleSizeClasses = {
    sm: "w-3 h-3",
    default: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const iconSizeClasses = {
    sm: "w-2 h-2",
    default: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-none",
        checked ? "bg-indigo-500 justify-end" : "bg-slate-500 justify-start",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        sizeClasses[size],
        className
      )}
      data-state={checked ? "checked" : "unchecked"}
    >
      {/* X Icon Circle - Always present */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          circleSizeClasses[size],
          checked
            ? "" // No background when active (X is hidden behind white circle)
            : "bg-white shadow-[0px_4px_8px_-2px_rgba(23,23,23,0.1),0px_2px_4px_-2px_rgba(23,23,23,0.06)]" // White background when inactive
        )}
      >
        <X
          className={cn(
            checked ? "text-white" : "text-slate-600", // Darker when visible on white background
            iconSizeClasses[size]
          )}
        />
      </div>

      {/* Check Icon Circle - Always present */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          circleSizeClasses[size],
          checked
            ? "bg-white shadow-[0px_4px_8px_-2px_rgba(23,23,23,0.1),0px_2px_4px_-2px_rgba(23,23,23,0.06)]" // White background when active
            : "" // No background when inactive (Check is hidden behind white circle)
        )}
      >
        <Check
          className={cn(
            checked ? "text-indigo-600" : "text-white", // Darker when visible on white background
            iconSizeClasses[size]
          )}
        />
      </div>
    </button>
  );
};

export { CustomSwitch };
