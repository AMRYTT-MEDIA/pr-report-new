import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const _MenubarContext = React.createContext();

// Hook for accessing menubar context (currently unused but kept for future use)
// const useMenubar = () => {
//   const context = React.useContext(MenubarContext);
//   if (!context) {
//     // Return default values instead of throwing error during SSR/static generation
//     return {
//       activeMenu: null,
//       setActiveMenu: () => {},
//     };
//   }
//   return context;
// };

const Menubar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
    {...props}
  />
));

const MenubarMenu = ({ children }) => <>{children}</>;

const MenubarGroup = ({ children }) => <>{children}</>;

const MenubarPortal = ({ children }) => <>{children}</>;

const MenubarSub = ({ children }) => <>{children}</>;

const MenubarRadioGroup = ({ children }) => <>{children}</>;

const MenubarTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground",
      className
    )}
    {...props}
  />
));

const MenubarSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
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

const MenubarSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground",
      className
    )}
    {...props}
  />
));

const MenubarContent = React.forwardRef(
  ({ className, align = "start", alignOffset = -4, sideOffset = 8, children, ...props }, ref) => (
    <MenubarPortal>
      <div
        ref={ref}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          className
        )}
        style={{
          "--align": align,
          "--align-offset": `${alignOffset}px`,
          "--side-offset": `${sideOffset}px`,
        }}
        {...props}
      >
        {children}
      </div>
    </MenubarPortal>
  )
);

const MenubarItem = React.forwardRef(({ className, inset, ...props }, ref) => (
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

const MenubarCheckboxItem = React.forwardRef(
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

const MenubarRadioItem = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
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

const MenubarLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
));

const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));

const MenubarShortcut = ({ className, ...props }) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);

Menubar.displayName = "Menubar";
MenubarMenu.displayName = "MenubarMenu";
MenubarGroup.displayName = "MenubarGroup";
MenubarPortal.displayName = "MenubarPortal";
MenubarSub.displayName = "MenubarSub";
MenubarRadioGroup.displayName = "MenubarRadioGroup";
MenubarTrigger.displayName = "MenubarTrigger";
MenubarSubTrigger.displayName = "MenubarSubTrigger";
MenubarSubContent.displayName = "MenubarSubContent";
MenubarContent.displayName = "MenubarContent";
MenubarItem.displayName = "MenubarItem";
MenubarSeparator.displayName = "MenubarSeparator";
MenubarLabel.displayName = "MenubarLabel";
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";
MenubarRadioItem.displayName = "MenubarRadioItem";
MenubarShortcut.displayName = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
