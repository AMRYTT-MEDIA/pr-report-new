import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialogContext = React.createContext();

const useAlertDialog = () => {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      "useAlertDialog must be used within an AlertDialog component"
    );
  }
  return context;
};

const AlertDialog = ({ children, open: openProp, onOpenChange }) => {
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
    <AlertDialogContext.Provider
      value={{ open: isOpen, setOpen: handleOpenChange }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { setOpen } = useAlertDialog();

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
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);

const AlertDialogPortal = ({ children }) => <>{children}</>;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));

const AlertDialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open } = useAlertDialog();

    if (!open) return null;

    return (
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <div
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AlertDialogPortal>
    );
  }
);

const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));

const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants(), className)} {...props} />
));

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => {
  const { setOpen } = useAlertDialog();

  const handleClick = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});

AlertDialog.displayName = "AlertDialog";
AlertDialogTrigger.displayName = "AlertDialogTrigger";
AlertDialogPortal.displayName = "AlertDialogPortal";
AlertDialogOverlay.displayName = "AlertDialogOverlay";
AlertDialogContent.displayName = "AlertDialogContent";
AlertDialogHeader.displayName = "AlertDialogHeader";
AlertDialogFooter.displayName = "AlertDialogFooter";
AlertDialogTitle.displayName = "AlertDialogTitle";
AlertDialogDescription.displayName = "AlertDialogDescription";
AlertDialogAction.displayName = "AlertDialogAction";
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
