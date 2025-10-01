import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const ContextMenuContext = React.createContext();

const useContextMenu = () => {
  const context = React.useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within a ContextMenu component");
  }
  return context;
};

const ContextMenu = ({ children, open: openProp, onOpenChange }) => {
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
    <ContextMenuContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

const ContextMenuTrigger = React.forwardRef(({ children, asChild = false, ...props }, ref) => {
  const { setOpen } = useContextMenu();

  const handleContextMenu = React.useCallback(
    (e) => {
      e.preventDefault();
      setOpen(true);
    },
    [setOpen]
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onContextMenu: handleContextMenu,
      ref: ref || children.ref,
      ...props,
    });
  }

  return (
    <div ref={ref} onContextMenu={handleContextMenu} {...props}>
      {children}
    </div>
  );
});

const ContextMenuGroup = ({ children, ...props }) => <div {...props}>{children}</div>;

const ContextMenuPortal = ({ children }) => <>{children}</>;

const ContextMenuSub = ({ children }) => <>{children}</>;

const ContextMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
));

const ContextMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      className
    )}
    {...props}
  />
));

const ContextMenuContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open } = useContextMenu();

  if (!open) return null;

  return (
    <ContextMenuPortal>
      <div
        ref={ref}
        className={cn(
          "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ContextMenuPortal>
  );
});

const ContextMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));

const ContextMenuCheckboxItem = React.forwardRef(
  ({ className, children, checked = false, onCheckedChange, ...props }, ref) => {
    const handleClick = React.useCallback(() => {
      onCheckedChange?.(!checked);
    }, [checked, onCheckedChange]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
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

const ContextMenuRadioItem = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const handleClick = React.useCallback(() => {
    onValueChange?.(value);
  }, [value, onValueChange]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
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
});

const ContextMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
    {...props}
  />
));

const ContextMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));

const ContextMenuShortcut = ({ className, ...props }) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);

const ContextMenuRadioGroup = ({ children }) => <>{children}</>;

ContextMenu.displayName = "ContextMenu";
ContextMenuTrigger.displayName = "ContextMenuTrigger";
ContextMenuGroup.displayName = "ContextMenuGroup";
ContextMenuPortal.displayName = "ContextMenuPortal";
ContextMenuSub.displayName = "ContextMenuSub";
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";
ContextMenuSubContent.displayName = "ContextMenuSubContent";
ContextMenuContent.displayName = "ContextMenuContent";
ContextMenuItem.displayName = "ContextMenuItem";
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";
ContextMenuLabel.displayName = "ContextMenuLabel";
ContextMenuSeparator.displayName = "ContextMenuSeparator";
ContextMenuShortcut.displayName = "ContextMenuShortcut";
ContextMenuRadioGroup.displayName = "ContextMenuRadioGroup";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
