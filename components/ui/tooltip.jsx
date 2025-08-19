import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipContext = React.createContext(null);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
};

const TooltipProvider = ({ children, delayDuration = 700 }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

const Tooltip = ({ children, open: openProp, onOpenChange }) => {
  const [open, setOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : open;

  const handleOpenChange = React.useCallback(
    (newOpen) => {
      if (!isControlled) {
        setOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <TooltipContext.Provider
      value={{ open: isOpen, setOpen: handleOpenChange }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef(
  ({ children, asChild = false, ...props }, ref) => {
    const { setOpen } = useTooltip();
    const [showTimeout, setShowTimeout] = React.useRef();

    const handleMouseEnter = React.useCallback(() => {
      setShowTimeout.current = setTimeout(() => setOpen(true), 700);
    }, [setOpen]);

    const handleMouseLeave = React.useCallback(() => {
      if (showTimeout.current) {
        clearTimeout(showTimeout.current);
      }
      setOpen(false);
    }, [setOpen]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ref: ref || children.ref,
        ...props,
      });
    }

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const TooltipContent = React.forwardRef(
  (
    { className, sideOffset = 4, side = "top", align = "center", ...props },
    ref
  ) => {
    const { open } = useTooltip();
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const triggerRef = React.useRef(null);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
      if (open && triggerRef.current && contentRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (side) {
          case "top":
            top = triggerRect.top - contentRect.height - sideOffset;
            left =
              triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
            break;
          case "bottom":
            top = triggerRect.bottom + sideOffset;
            left =
              triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
            break;
          case "left":
            top =
              triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
            left = triggerRect.left - contentRect.width - sideOffset;
            break;
          case "right":
            top =
              triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
            left = triggerRect.right + sideOffset;
            break;
        }

        setPosition({ top, left });
      }
    }, [open, side, sideOffset]);

    if (!open) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          "fixed z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
          className
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
        {...props}
      />
    );
  }
);

TooltipProvider.displayName = "TooltipProvider";
Tooltip.displayName = "Tooltip";
TooltipTrigger.displayName = "TooltipTrigger";
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
