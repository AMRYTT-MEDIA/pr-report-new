"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const DialogContext = React.createContext();

const useDialog = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    // Return default values instead of throwing error during SSR/static generation
    return {
      open: false,
      setOpen: () => {},
    };
  }
  return context;
};

const Dialog = ({ children, open: openProp, onOpenChange }) => {
  const [open, setOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : open;

  // Improved scroll lock that preserves header visibility
  React.useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Apply minimal scroll lock that preserves header visibility
      document.body.style.overflow = "hidden";
      document.body.style.position = "relative";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Store scroll position for restoration
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      // Restore scroll position and unlock
      const scrollY = parseInt(document.body.dataset.scrollY || "0");

      // Reset body styles
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      delete document.body.dataset.scrollY;

      // Restore scroll position smoothly
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    }

    return () => {
      // Cleanup on unmount
      const scrollY = parseInt(document.body.dataset.scrollY || "0");

      // Reset all styles
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      delete document.body.dataset.scrollY;

      // Restore scroll position if needed
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isOpen]);

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
    <DialogContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = React.forwardRef(
  ({ children, asChild = false, ...props }, ref) => {
    const { setOpen } = useDialog();

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
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);

const DialogPortal = ({ children }) => <>{children}</>;

const DialogClose = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { setOpen } = useDialog();

    const handleClick = React.useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: handleClick,
        ref: ref || children.ref,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          className
        )}
        {...props}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    );
  }
);

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { setOpen } = useDialog();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed top-[-25px] left-0 right-0 bottom-0 z-[9999] bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      style={{ pointerEvents: "auto" }}
      onClick={handleOverlayClick}
      {...props}
    />
  );
});

const DialogContent = React.forwardRef(
  ({ className, children, showCloseButton = true, ...props }, ref) => {
    const { open } = useDialog();

    if (!open) return null;

    return (
      <DialogPortal>
        <DialogOverlay />
        <div
          ref={ref}
          data-dialog-content="true"
          className={cn(
            "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-[550px] translate-x-[-50%] translate-y-[-50%] gap-5 border bg-background p-5 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl",
            className
          )}
          style={{ pointerEvents: "auto", margin: 0 }}
          {...props}
        >
          {children}
          {showCloseButton && <DialogClose />}
        </div>
      </DialogPortal>
    );
  }
);

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground")} {...props} />
));

Dialog.displayName = "Dialog";
DialogPortal.displayName = "DialogPortal";
DialogOverlay.displayName = "DialogOverlay";
DialogClose.displayName = "DialogClose";
DialogTrigger.displayName = "DialogTrigger";
DialogContent.displayName = "DialogContent";
DialogHeader.displayName = "DialogHeader";
DialogFooter.displayName = "DialogFooter";
DialogTitle.displayName = "DialogTitle";
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
