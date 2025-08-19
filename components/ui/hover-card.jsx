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
    const { setOpen, open } = useHoverCard();

    const handleClick = React.useCallback(() => {
      setOpen(!open);
    }, [setOpen, open]);

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
  }
);

const HoverCardContent = React.forwardRef(
  (
    { className, align = "center", sideOffset = 4, children, ...props },
    ref
  ) => {
    const { open, setOpen } = useHoverCard();
    const contentRef = React.useRef(null);

    // Handle click outside to close
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "absolute z-50 w-48 rounded-md border bg-white shadow-lg outline-none",
          className
        )}
        style={{
          top: "calc(100% + 8px)",
          left: align === "start" ? "0" : align === "center" ? "50%" : "auto",
          right: align === "end" ? "0" : "auto",
          transform: align === "center" ? "translateX(-50%)" : "none",
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
