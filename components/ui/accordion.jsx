import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const AccordionContext = React.createContext();

const Accordion = React.forwardRef(
  ({ className, type = "single", defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState(
      value || (type === "single" ? (defaultValue ? [defaultValue] : []) : defaultValue || [])
    );

    const handleValueChange = React.useCallback(
      (itemValue) => {
        if (type === "single") {
          const newValue = openItems.includes(itemValue) ? [] : [itemValue];
          setOpenItems(newValue);
          onValueChange?.(newValue[0]);
        } else {
          const newValue = openItems.includes(itemValue)
            ? openItems.filter((item) => item !== itemValue)
            : [...openItems, itemValue];
          setOpenItems(newValue);
          onValueChange?.(newValue);
        }
      },
      [openItems, type, onValueChange]
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setOpenItems(type === "single" ? (value ? [value] : []) : value || []);
      }
    }, [value, type]);

    return (
      <AccordionContext.Provider value={{ openItems, handleValueChange, type }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { openItems, handleValueChange } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
      onClick={() => handleValueChange(value)}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "animate-accordion-down" : "animate-accordion-up"
      )}
      {...props}
    >
      {isOpen && <div className={cn("pb-4 pt-0", className)}>{children}</div>}
    </div>
  );
});

AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
