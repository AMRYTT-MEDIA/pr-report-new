"use client";

import { useCallback } from "react";
import { Field } from "formik";
import { Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Reusable file upload component with drag-and-drop support
 * Integrates with Formik for form state management
 */
export const FileUploadField = ({
  name,
  label,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  currentImage,
  fallbackText,
  description = "SVG, PNG, JPG or GIF (max. 800x400px)",
  className = "",
}) => {
  const handleFileChange = useCallback(
    (file, setFieldValue) => {
      if (file && file.size <= maxSize) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFieldValue(name, reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [name, maxSize]
  );

  const handleDrop = useCallback(
    (e, setFieldValue) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      handleFileChange(file, setFieldValue);
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <Field name={name}>
      {({ field, form }) => (
        <div className={cn("space-y-4", className)}>
          {label && (
            <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
          )}

          <div className="flex gap-5 items-start">
            {/* Avatar Preview */}
            <Avatar className="w-16 h-16 flex-shrink-0">
              <AvatarImage src={field.value || currentImage} />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-lg font-medium">
                {fallbackText || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Upload Area */}
            <div className="flex-1">
              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors cursor-pointer"
                onDrop={(e) => handleDrop(e, form.setFieldValue)}
                onDragOver={handleDragOver}
                onClick={() =>
                  document.getElementById(`${name}-upload`).click()
                }
              >
                <input
                  id={`${name}-upload`}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(e.target.files[0], form.setFieldValue)
                  }
                />

                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-slate-500" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm">
                    <button
                      type="button"
                      className="text-indigo-500 font-semibold hover:text-indigo-600 focus:outline-none focus:text-indigo-600"
                    >
                      Click to upload
                    </button>
                    <span className="text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              </div>

              {/* Error Display */}
              {form.errors[name] && form.touched[name] && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {form.errors[name]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Field>
  );
};

export default FileUploadField;
