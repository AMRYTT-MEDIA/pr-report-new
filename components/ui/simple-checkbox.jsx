import React from "react";
import { Check } from "lucide-react";

const SimpleCheckbox = ({
  checked = false,
  onChange,
  className = "",
  disabled = false,
  indeterminate = false,
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const getCheckboxState = () => {
    if (indeterminate) return "indeterminate";
    if (checked) return "checked";
    return "unchecked";
  };

  const state = getCheckboxState();

  return (
    <div
      className={`w-5 h-5 rounded-[6px] border-2 cursor-pointer flex items-center justify-center transition-colors ${
        state === "checked" || state === "indeterminate"
          ? "bg-indigo-500 border-indigo-500 text-white"
          : "border-slate-300 bg-white hover:border-indigo-400"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {state === "checked" && <Check className="w-3 h-3" strokeWidth={4} />}
      {state === "indeterminate" && <div className="w-2 h-0.5 bg-white rounded"></div>}
    </div>
  );
};

export { SimpleCheckbox };
