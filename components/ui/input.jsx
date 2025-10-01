import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
