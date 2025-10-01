"use client";

import { Field } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ErrorMessage from "../ui/error-message";

/**
 * Reusable FormField component for Formik forms
 * Handles field rendering, validation display, and various input types
 */
export const FormField = ({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  className = "",
  rightElement,
  leftElement,
  description,
  ...props
}) => (
  <Field name={name}>
    {({ field, meta }) => {
      const hasError = meta.touched && meta.error;

      return (
        <div className="space-y-2">
          {/* Label */}
          {label && (
            <Label htmlFor={name} className="text-sm font-semibold text-slate-800">
              {label}
              {required && <span className="text-rose-600 ml-1">*</span>}
            </Label>
          )}

          {/* Description */}
          {description && <p className="text-xs text-slate-500">{description}</p>}

          {/* Input Container */}
          <div className="relative">
            {/* Left Element */}
            {leftElement && <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">{leftElement}</div>}

            {/* Input Field */}
            <Input
              {...field}
              {...props}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "h-10 border-slate-300 focus:border-indigo-500 transition-colors",
                hasError && "border-red-300 focus:border-red-500",
                disabled && "bg-slate-50 cursor-not-allowed",
                leftElement && "pl-10",
                rightElement && "pr-10",
                className
              )}
            />

            {/* Right Element */}
            {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
          </div>

          {/* Error Message */}
          {hasError && <ErrorMessage message={meta.error} />}
        </div>
      );
    }}
  </Field>
);

export default FormField;
