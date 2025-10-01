import * as React from "react";
import { cn } from "@/lib/utils";

const PopoverContext = React.createContext(null);

const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    // Return default values instead of throwing error during SSR/static generation
    return {
      open: false,
      setOpen: () => {},
    };
  }
  return context;
};

const Popover = ({ children, open: openProp, onOpenChange }) => {
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
    <PopoverContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>{children}</PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef(({ children, asChild = false, ...props }, ref) => {
  const { setOpen } = usePopover();

  const handleClick = React.useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ref: ref || children.ref,
      ...props,
    });
  }

  return (
    <div ref={ref} onClick={handleClick} {...props}>
      {children}
    </div>
  );
});

const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, children, ...props }, _ref) => {
  const { open } = usePopover();
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      const top = triggerRect.bottom + sideOffset;
      let { left } = triggerRect;

      // Align content
      switch (align) {
        case "start":
          ({ left } = triggerRect);
          break;
        case "center":
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          break;
        case "end":
          left = triggerRect.right - contentRect.width;
          break;
      }

      setPosition({ top, left });
    }
  }, [open, align, sideOffset]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "fixed z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

Popover.displayName = "Popover";
PopoverTrigger.displayName = "PopoverTrigger";
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
