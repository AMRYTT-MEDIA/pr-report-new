import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorMessage from "@/components/ui/error-message";

const FormField = ({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  readOnly = false,
  autoComplete = "off",
  value,
  onChange,
  onBlur,
  error,
  touched,
  className = "",
  children, // For custom input components like dropdown
}) => {
  return (
    <div className="w-full">
      <div className="space-y-3">
        <Label className="text-slate-600">
          {label} {required && <span className="text-rose-600">*</span>}
        </Label>
        {children || (
          <Input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            readOnly={readOnly}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className={`text-slate-600 text-input-field ${
              readOnly
                ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                : touched && error
                ? "border-red-600"
                : "border-slate-300"
            } ${className}`}
          />
        )}
      </div>
      <ErrorMessage
        message={touched && error ? error : null}
        className="mt-1.5"
      />
    </div>
  );
};

export default FormField;
