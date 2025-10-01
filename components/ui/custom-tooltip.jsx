"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const CustomTooltip = React.memo(
  ({ children, content, position = "top", className = "", contentClassName = "", delay = 300 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);
    const triggerRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

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

    // Compute viewport-fixed position for portal tooltip
    const computePosition = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 8; // space between trigger and tooltip

      switch (position) {
        case "top":
          setCoords({ top: rect.top - gap, left: rect.left + rect.width / 2 });
          break;
        case "bottom":
          setCoords({
            top: rect.bottom + gap,
            left: rect.left + rect.width / 2,
          });
          break;
        case "left":
          setCoords({ top: rect.top + rect.height / 2, left: rect.left - gap });
          break;
        case "right":
          setCoords({
            top: rect.top + rect.height / 2,
            left: rect.right + gap,
          });
          break;
        default:
          setCoords({ top: rect.top - gap, left: rect.left + rect.width / 2 });
      }
    }, [position]);

    useEffect(() => {
      if (!isVisible) return;
      computePosition();
      const handle = () => computePosition();
      window.addEventListener("scroll", handle, true);
      window.addEventListener("resize", handle);
      return () => {
        window.removeEventListener("scroll", handle, true);
        window.removeEventListener("resize", handle);
      };
    }, [isVisible, computePosition]);

    // Memoized position classes for tooltip (fixed + transforms only)
    const positionClasses = useMemo(() => {
      const baseClasses = "fixed z-[9999] pointer-events-none";

      switch (position) {
        case "top":
          return `${baseClasses} -translate-x-1/2 -translate-y-full`;
        case "bottom":
          return `${baseClasses} -translate-x-1/2`;
        case "left":
          return `${baseClasses} -translate-y-1/2 -translate-x-full`;
        case "right":
          return `${baseClasses} -translate-y-1/2`;
        default:
          return `${baseClasses} -translate-x-1/2 -translate-y-full`;
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
    useEffect(
      () => () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      },
      []
    );

    return (
      <div
        ref={triggerRef}
        className={cn("relative inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}

        {isVisible &&
          content &&
          createPortal(
            <div className={positionClasses} style={{ top: coords.top, left: coords.left }}>
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
            </div>,
            document.body
          )}
      </div>
    );
  }
);

CustomTooltip.displayName = "CustomTooltip";

export default CustomTooltip;
