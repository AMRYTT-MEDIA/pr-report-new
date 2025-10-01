import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, checked = false, onCheckedChange, ...props }, ref) => {
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
    <div className="relative">
      <input ref={ref} type="checkbox" checked={isChecked} onChange={handleChange} className="sr-only" {...props} />
      <div
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary text-primary-foreground" : "",
          className
        )}
      >
        {isChecked && (
          <div className={cn("flex items-center justify-center text-current")}>
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
