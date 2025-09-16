"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

const CustomTooltip = React.memo(
  ({
    children,
    content,
    position = "top",
    className = "",
    contentClassName = "",
    delay = 300,
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }, [delay]);

    const handleMouseLeave = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    }, []);

    // Memoized position classes for tooltip
    const positionClasses = useMemo(() => {
      const baseClasses = "absolute z-50 pointer-events-none";

      switch (position) {
        case "top":
          return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
        case "bottom":
          return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
        case "left":
          return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
        case "right":
          return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
        default:
          return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      }
    }, [position]);

    // Memoized arrow classes for tooltip pointer
    const arrowClasses = useMemo(() => {
      const baseArrowClasses = "absolute w-0 h-0";

      switch (position) {
        case "top":
          return `${baseArrowClasses} top-full left-1/2 transform -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white`;
        case "bottom":
          return `${baseArrowClasses} bottom-full left-1/2 transform -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white`;
        case "left":
          return `${baseArrowClasses} left-full top-1/2 transform -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-white`;
        case "right":
          return `${baseArrowClasses} right-full top-1/2 transform -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-white`;
        default:
          return `${baseArrowClasses} top-full left-1/2 transform -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white`;
      }
    }, [position]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div
        className={cn("relative inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}

        {isVisible && content && (
          <div className={positionClasses}>
            {/* Tooltip Container */}
            <div
              className={cn(
                "bg-white rounded-[6px] px-2 py-2 text-sm font-medium text-[#101010] whitespace-nowrap",
                "shadow-[0px_0px_20px_0px_rgba(52,64,84,0.2)]",
                "animate-in fade-in-0 zoom-in-95 duration-200",
                contentClassName
              )}
            >
              {content}

              {/* Arrow/Pointer */}
              <div className={arrowClasses} />
            </div>
          </div>
        )}
      </div>
    );
  }
);

CustomTooltip.displayName = "CustomTooltip";

export default CustomTooltip;
