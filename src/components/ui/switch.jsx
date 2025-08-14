import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked);

    React.useEffect(() => {
      setIsChecked(checked);
    }, [checked]);

    const handleChange = React.useCallback(
      (e) => {
        const newChecked = e.target.checked;
        setIsChecked(newChecked);
        onCheckedChange?.(newChecked);
      },
      [onCheckedChange]
    );

    return (
      <div
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary" : "bg-input",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
