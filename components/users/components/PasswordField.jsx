import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorMessage from "@/components/ui/error-message";
import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  showPassword,
  onTogglePassword,
}) => {
  return (
    <div className="w-full">
      <div className="space-y-3">
        <Label className="text-slate-600">
          Password <span className="text-rose-600">*</span>
        </Label>
        <div className="relative">
          <Input
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Enter Password"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className={`pr-10 text-gray-scale-60 text-input-field ${
              touched && error
                ? "border-danger-scale-60"
                : "border-gray-scale-30"
            }`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      <ErrorMessage
        message={touched && error ? error : null}
        className="mt-1.5"
      />
    </div>
  );
};

export default PasswordField;
