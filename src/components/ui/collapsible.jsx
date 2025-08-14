import * as React from "react";
import { cn } from "@/lib/utils";

const CollapsibleContext = React.createContext();

const Collapsible = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <CollapsibleContext.Provider value={{ open, setOpen }}>
        <div ref={ref} className={cn("", className)} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { setOpen, open } = React.useContext(CollapsibleContext);

    const handleClick = () => {
      setOpen(!open);
    };

    if (asChild) {
      return React.cloneElement(children, {
        ref,
        onClick: handleClick,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn("", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(CollapsibleContext);

    if (!open) return null;

    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    );
  }
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
