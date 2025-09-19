"use client";

import { useCallback } from "react";
import { Field } from "formik";
import { Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ErrorMessage from "../ui/error-message";

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
    (file, setFieldValue, setFieldError) => {
      if (!file) return;

      // Check file size
      if (file.size > maxSize) {
        setFieldError(name, "File size too large (max 5MB)");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setFieldError(
          name,
          "Please upload a valid image file (JPG, PNG, GIF, SVG)"
        );
        return;
      }

      // Check file extension
      const fileName = file.name.toLowerCase();
      const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".svg",
        ".webp",
      ];
      if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
        setFieldError(
          name,
          "Invalid file extension. Please use JPG, PNG, GIF, or SVG"
        );
        return;
      }

      // Clear any previous errors
      setFieldError(name, undefined);

      // If all validations pass, read the file
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue(name, reader.result);
      };
      reader.readAsDataURL(file);
    },
    [name, maxSize]
  );

  const handleDrop = useCallback(
    (e, setFieldValue, setFieldError) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      handleFileChange(file, setFieldValue, setFieldError);
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <Field name={name}>
      {({ field, form }) => {
        return (
          <div className={cn("space-y-4", className)}>
            {label && (
              <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
            )}

            <div className="flex flex-col md:flex-row gap-5 items-start">
              {/* Avatar Preview */}
              <Avatar className="w-16 h-16 flex-shrink-0">
                {field.value || currentImage ? (
                  <AvatarImage src={field.value || currentImage} alt="Avatar" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-lg font-medium">
                  {fallbackText || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Upload Area */}
              <div className="flex-1 w-full">
                <div
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors cursor-pointer"
                  onDrop={(e) =>
                    handleDrop(e, form.setFieldValue, form.setFieldError)
                  }
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
                      handleFileChange(
                        e.target.files[0],
                        form.setFieldValue,
                        form.setFieldError
                      )
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
                  <ErrorMessage message={form.errors[name]} />
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Field>
  );
};

export default FileUploadField;
