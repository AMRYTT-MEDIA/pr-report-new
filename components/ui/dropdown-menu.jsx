import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext(null);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      "useDropdownMenu must be used within a DropdownMenu component"
    );
  }
  return context;
};

const DropdownMenu = ({ children, open: openProp, onOpenChange }) => {
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
    <DropdownMenuContext.Provider
      value={{ open: isOpen, setOpen: handleOpenChange }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ children, asChild = false, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenu();

    const handleClick = React.useCallback(() => {
      setOpen(!open);
    }, [open, setOpen]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: handleClick,
        ref: ref || children.ref,
        ...props,
      });
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);

const DropdownMenuGroup = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const DropdownMenuPortal = ({ children }) => <>{children}</>;

const DropdownMenuSub = ({ children }) => <>{children}</>;

const DropdownMenuSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </div>
  )
);

const DropdownMenuSubContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  )
);

const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 4, children, ...props }, ref) => {
    const { open } = useDropdownMenu();

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          className
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
);

const DropdownMenuCheckboxItem = React.forwardRef(
  (
    { className, children, checked = false, onCheckedChange, ...props },
    ref
  ) => {
    const handleClick = React.useCallback(() => {
      onCheckedChange?.(!checked);
    }, [checked, onCheckedChange]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);

const DropdownMenuRadioItem = React.forwardRef(
  ({ className, children, value, onValueChange, ...props }, ref) => {
    const handleClick = React.useCallback(() => {
      onValueChange?.(value);
    }, [value, onValueChange]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Circle className="h-2 w-2 fill-current" />
        </span>
        {children}
      </div>
    );
  }
);

const DropdownMenuLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
);

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
);

const DropdownMenuShortcut = ({ className, ...props }) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};

const DropdownMenuRadioGroup = ({ children }) => <>{children}</>;

DropdownMenu.displayName = "DropdownMenu";
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
DropdownMenuGroup.displayName = "DropdownMenuGroup";
DropdownMenuPortal.displayName = "DropdownMenuPortal";
DropdownMenuSub.displayName = "DropdownMenuSub";
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";
DropdownMenuContent.displayName = "DropdownMenuContent";
DropdownMenuItem.displayName = "DropdownMenuItem";
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";
DropdownMenuLabel.displayName = "DropdownMenuLabel";
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
