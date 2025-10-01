"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

/**
 * CommonModal Component
 *
 * A reusable modal component that wraps shared design elements used in all modals.
 * Handles only the layout structure (Dialog, padding, header, footer) while accepting
 * dynamic content and actions as props.
 *
 * Features:
 * - Consistent layout with padding, spacing, border-radius
 * - Responsive design that works on desktop and mobile
 * - Customizable header with icon and title
 * - Flexible content area for any React content
 * - Optional footer for dynamic buttons/actions
 * - Close button in top-right corner
 * - Keyboard navigation support (Escape key)
 * - Overlay click handling
 */

const CommonModal = ({
  open = false,
  onClose,
  title = "",
  icon = null,
  children,
  footer = null,
  showCloseButton = true,
  size = "md", // sm, md, lg, xl, 2xl
  className = "",
  contentClassName = "",
  footerClassName = "bg-slate-100",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventClose = false,
  subtitle = "",
  subtitle2 = "",
  noScroll = false, // Prevent scrolling in modal content
  isBorderShow = true,
  headerActions = null, // Additional actions in header (like Sample CSV button)
  customHeaderLayout = false, // Use custom header layout for specific designs
}) => {
  // Handle modal close
  const handleClose = () => {
    if (!preventClose) {
      onClose?.();
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === "Escape" && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closeOnEscape]);

  // Size classes
  const sizeClasses = {
    sm: "sm:max-w-[425px]",
    md: "sm:max-w-[500px]",
    lg: "sm:max-w-[600px]",
    xl: "sm:max-w-[800px]",
    "2xl": "sm:max-w-[1000px]",
  };

  // Check if custom className overrides default sizing
  const hasCustomSizing = className.includes("max-w-") || className.includes("w-");
  const defaultSizing = hasCustomSizing ? "" : "max-w-[90vw] sm:max-w-[550px]";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`${
          hasCustomSizing ? "" : sizeClasses[size]
        }  border border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-slate-100 border-gray-scale-10 gap-0 ${defaultSizing} ${className}`}
        onPointerDownOutside={handleOverlayClick}
        showCloseButton={false}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
          pointerEvents: "auto",
        }}
      >
        {/* Main Content Container */}
        <div
          className={`flex flex-col gap-5 border border-slate-200 rounded-xl p-5 bg-white ${
            noScroll ? "" : "overflow-y-auto max-h-[80vh] scrollbar-custom"
          }`}
        >
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-purple-70 rounded-lg p-2.5">{icon}</div>
            {showCloseButton && (
              <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded" disabled={preventClose}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Title Section with Custom Layout Support */}
          {customHeaderLayout ? (
            <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-3">
              <div>
                <h2 className="text-lg font-semibold text-font-h2">{title}</h2>
                <p className="text-sm text-font-h2 opacity-50 font-semibold mt-1">{subtitle}</p>
              </div>
              {headerActions && <div className="flex items-center gap-2 justify-end">{headerActions}</div>}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-font-h2">{title}</h2>
              <p className="text-slate-500 text-sm">
                {subtitle} {subtitle2 && <span className="text-slate-500 font-semibold text-sm ">{subtitle2}</span>}
              </p>
            </div>
          )}
          {isBorderShow && <div className="border-b-2 border-dashed border-slate-200" />}
          {/* Dynamic Content */}
          <div className={`${contentClassName}`}>{children}</div>
        </div>

        {/* Footer Section */}
        {footer && (
          <div className={`flex gap-2.5 items-center justify-center sm:justify-end p-5 ${footerClassName}`}>
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommonModal;
