import * as React from "react";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef(
  ({ className, variant, size, type = "single", value, onValueChange, children, ...props }, ref) => {
    const [selectedValues, setSelectedValues] = React.useState(
      type === "single" ? (value ? [value] : []) : value || []
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(type === "single" ? (value ? [value] : []) : value || []);
      }
    }, [value, type]);

    const handleValueChange = React.useCallback(
      (itemValue) => {
        let newValues;

        if (type === "single") {
          newValues = selectedValues.includes(itemValue) ? [] : [itemValue];
        } else {
          newValues = selectedValues.includes(itemValue)
            ? selectedValues.filter((v) => v !== itemValue)
            : [...selectedValues, itemValue];
        }

        setSelectedValues(newValues);
        onValueChange?.(type === "single" ? newValues[0] || "" : newValues);
      },
      [selectedValues, type, onValueChange]
    );

    return (
      <div ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
        <ToggleGroupContext.Provider value={{ variant, size }}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                selectedValues,
                onValueChange: handleValueChange,
              });
            }
            return child;
          })}
        </ToggleGroupContext.Provider>
      </div>
    );
  }
);

const ToggleGroupItem = React.forwardRef(
  ({ className, children, variant, size, value, selectedValues = [], onValueChange, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);
    const isSelected = selectedValues.includes(value);

    const handleClick = React.useCallback(() => {
      onValueChange?.(value);
    }, [value, onValueChange]);

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          isSelected && "bg-accent text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ToggleGroup.displayName = "ToggleGroup";
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
