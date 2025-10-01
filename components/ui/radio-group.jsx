import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(value);

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleValueChange = React.useCallback(
    (newValue) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  return (
    <div ref={ref} className={cn("grid gap-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            selectedValue,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
});

const RadioGroupItem = React.forwardRef(({ className, value, selectedValue, onValueChange, ...props }, ref) => {
  const isSelected = selectedValue === value;

  const handleChange = React.useCallback(() => {
    onValueChange?.(value);
  }, [value, onValueChange]);

  return (
    <div className="relative">
      <input
        ref={ref}
        type="radio"
        value={value}
        checked={isSelected}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {isSelected && (
          <div className="flex items-center justify-center">
            <Circle className="h-2.5 w-2.5 fill-current text-current" />
          </div>
        )}
      </div>
    </div>
  );
});

RadioGroup.displayName = "RadioGroup";
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
