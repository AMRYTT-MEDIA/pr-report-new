import * as React from "react";
import { cn } from "@/lib/utils";

const HoverCardContext = React.createContext(null);

const useHoverCard = () => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error("useHoverCard must be used within a HoverCard component");
  }
  return context;
};

const HoverCard = ({ children, openDelay = 700, closeDelay = 300 }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { openDelay, closeDelay });
        }
        return child;
      })}
    </HoverCardContext.Provider>
  );
};

const HoverCardTrigger = React.forwardRef(
  (
    { children, asChild = false, openDelay = 700, closeDelay = 300, ...props },
    ref
  ) => {
    const { setOpen } = useHoverCard();
    const [showTimeout, setShowTimeout] = React.useRef(null);
    const [hideTimeout, setHideTimeout] = React.useRef(null);

    const handleMouseEnter = React.useCallback(() => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
      setShowTimeout.current = setTimeout(() => setOpen(true), openDelay);
    }, [setOpen, openDelay]);

    const handleMouseLeave = React.useCallback(() => {
      if (showTimeout.current) {
        clearTimeout(showTimeout.current);
      }
      setHideTimeout.current = setTimeout(() => setOpen(false), closeDelay);
    }, [setOpen, closeDelay]);

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

const HoverCardContent = React.forwardRef(
  (
    { className, align = "center", sideOffset = 4, children, ...props },
    ref
  ) => {
    const { open } = useHoverCard();
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const triggerRef = React.useRef(null);
    const contentRef = React.useRef(null);

    React.useEffect(() => {
      if (open && triggerRef.current && contentRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        let top = triggerRect.top - contentRect.height - sideOffset;
        let left = triggerRect.left;

        // Align content
        switch (align) {
          case "start":
            left = triggerRect.left;
            break;
          case "center":
            left =
              triggerRef.left + triggerRect.width / 2 - contentRect.width / 2;
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
          "fixed z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
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
  }
);

HoverCard.displayName = "HoverCard";
HoverCardTrigger.displayName = "HoverCardTrigger";
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardTrigger, HoverCardContent };
