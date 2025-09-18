"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormField from "./FormField";

/**
 * Specialized password field component with show/hide toggle
 * Built on top of FormField for consistency
 */
export const PasswordField = ({
  name,
  label,
  placeholder = "Enter password",
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      name={name}
      label={label}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      rightElement={
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      }
      {...props}
    />
  );
};

export default PasswordField;
