"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { X, Plus, Save, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";
import WebsiteConstants from "../website/constans";
import { viewReportsService } from "@/services/viewReports";
import CommonModal from "@/components/common/CommonModal";

const AddUpdateWebsite = ({
  onWebsiteAdded,
  isOpen,
  onClose,
  initialUrls = "",
  report,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Determine if we're in edit mode (single URL) or add mode (multiple URLs)
  const isEditMode = initialUrls && initialUrls.trim() !== "";

  // Get initial form values - only Website URLs field
  const getInitialValues = () => {
    return {
      websiteUrls: initialUrls || "",
    };
  };

  // Formik configuration - only Website URLs field
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: Yup.object().shape({
      websiteUrls: Yup.string()
        .trim()
        .required("Website URL is required")
        .test("valid-urls", "Please enter a valid URL", function (value) {
          if (!value) return true; // Let required validation handle empty values

          if (isEditMode) {
            // In edit mode, only allow single URL
            const urlPattern =
              /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/;
            if (!urlPattern.test(value.trim())) {
              return this.createError({
                message: "Please enter a valid URL",
              });
            }
            return true;
          } else {
            // In add mode, allow multiple URLs
            const urls = value
              .split(/[,\n]/)
              .map((url) => url.trim())
              .filter((url) => url.length > 0);
            // Check if all URLs are valid
            const invalidUrls = urls.filter((url) => {
              try {
                // Basic URL validation - check if it starts with http/https or www
                const urlPattern =
                  /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/;
                return !urlPattern.test(url);
              } catch {
                return true;
              }
            });

            if (invalidUrls.length > 0) {
              return this.createError({
                message: `Invalid URLs found: ${invalidUrls.join(", ")}`,
              });
            }
            return true;
          }
        }),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        let urls;

        if (isEditMode) {
          // In edit mode, only process single URL
          urls = [values.websiteUrls.trim()];
        } else {
          // In add mode, process multiple URLs
          urls = values.websiteUrls
            .split(/[,\n]/)
            .map((url) => url.trim())
            .filter((url) => url.length > 0);
        }

        // Create websites for each URL
        const createdWebsites = [];
        const errors = [];

        // Prepare data for API call
        const apiData = {
          grid_id: report?.grid_id || report?._id || report?.id,
          urls: urls.map((url) =>
            url.startsWith("http") ? url : `https://${url}`
          ),
        };

        if (isEditMode) {
          // In edit mode, don't call API - just return the URLs to parent
          createdWebsites.push(...urls.map((url) => ({ url, success: true })));
        } else {
          // In create mode, call the API
          try {
            // Call the API with the required format
            const response = await viewReportsService.createPR(apiData);

            // Handle successful response
            if (response && response.success !== false) {
              createdWebsites.push(
                ...(response.data ||
                  response.websites ||
                  urls.map((url) => ({ url, success: true })))
              );
            } else {
              throw new Error(response.message || "API call failed");
            }
          } catch (error) {
            //empty catch
            toast.error(
              error.response.data.message || "Failed to submit URLs to API"
            );
          }
        }

        if (createdWebsites.length > 0) {
          const message = isEditMode
            ? "Website URL updated successfully!"
            : `Successfully created ${createdWebsites.length} website(s)!`;
          // toast.success(message);

          // Call the callback with the created websites
          if (onWebsiteAdded) {
            onWebsiteAdded({
              websites: createdWebsites,
              urls: createdWebsites.map((w) => w.url || w.domain),
            });
          }
        }

        if (errors.length > 0) {
          const errorUrls = errors.map((e) => e.url).join(", ");
          const errorMessage = isEditMode
            ? `Failed to update website: ${errorUrls}`
            : `Failed to create ${errors.length} website(s): ${errorUrls}`;
          toast.error(errorMessage);
        }

        if (createdWebsites.length > 0) {
          handleClose();
        }
      } catch (error) {
        console.error("Error processing URLs:", error);
        const errorMessage = isEditMode
          ? "Failed to update website. Please try again."
          : "Failed to process URLs. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true,
  });

  // Reset form when dialog opens/closes or initialUrls changes
  useEffect(() => {
    if (isOpen) {
      // Format initial URLs properly - ensure they end with comma and space if not empty
      let formattedUrls = initialUrls || "";
      if (formattedUrls.trim()) {
        // If URLs don't end with comma, add one
        if (!formattedUrls.endsWith(",") && !formattedUrls.endsWith(", ")) {
          formattedUrls = formattedUrls + ", ";
        }
      }
      formik.resetForm({ values: { websiteUrls: formattedUrls } });
    }
  }, [isOpen, initialUrls]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Custom handler for textarea to add commas on Enter key
  const handleTextareaChange = (e) => {
    const value = e.target.value;

    if (isEditMode) {
      // In edit mode, only allow single URL - no comma processing
      formik.setFieldValue("websiteUrls", value);
    } else {
      // In add mode, process multiple URLs with comma handling
      const cleanValue = value
        .toLowerCase()
        .replace(/\s+(?![,\s])/g, "")
        .replace(/\s*,\s*/g, ", ");
      formik.setFieldValue("websiteUrls", cleanValue);
    }

    // Trigger validation on change
    formik.setFieldTouched("websiteUrls", true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (isEditMode) {
        // In edit mode, prevent Enter key from adding new lines or commas
        return;
      }

      const currentValue = formik.values.websiteUrls;
      const cursorPosition = e.target.selectionStart;

      // Only add comma if there's content before cursor
      const beforeCursor = currentValue.substring(0, cursorPosition);
      const afterCursor = currentValue.substring(cursorPosition);

      // Check if there's content before cursor and no comma already
      const hasContentBeforeCursor = beforeCursor.trim().length > 0;
      const endsWithComma =
        beforeCursor.endsWith(",") || beforeCursor.endsWith(", ");
      const needsComma = hasContentBeforeCursor && !endsWithComma;

      const newValue = beforeCursor + (needsComma ? ", " : "") + afterCursor;
      formik.setFieldValue("websiteUrls", newValue);

      // Set cursor position after the comma and space
      setTimeout(() => {
        const newCursorPosition = cursorPosition + (needsComma ? 2 : 0);
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    if (isEditMode) {
      // In edit mode, only allow single URL - replace current content
      formik.setFieldValue("websiteUrls", pastedText.trim());
    } else {
      // In add mode, process multiple URLs with comma handling
      const processedText = pastedText
        .replace(/\n/g, ", ")
        .toLowerCase()
        .replace(/\s+(?![,\s])/g, "") // Remove spaces that are not after commas
        .replace(/\s*,\s*/g, ", "); // Normalize comma spacing

      const currentValue = formik.values.websiteUrls;
      const cursorPosition = e.target.selectionStart;

      const beforeCursor = currentValue.substring(0, cursorPosition);
      const afterCursor = currentValue.substring(cursorPosition);

      // Add comma and space before pasted text if needed
      const needsComma =
        beforeCursor.length > 0 && !beforeCursor.endsWith(", ");
      const finalText =
        beforeCursor + (needsComma ? ", " : "") + processedText + afterCursor;

      formik.setFieldValue("websiteUrls", finalText);

      // Set cursor position after pasted text
      setTimeout(() => {
        const newCursorPosition =
          cursorPosition + processedText.length + (needsComma ? 2 : 0);
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <CommonModal
        open={isOpen}
        onClose={handleClose}
        title={`${isEditMode ? "Edit" : "Bulk Add"} Website ${
          isEditMode ? "URL" : "URLs"
        }`}
        subtitle={
          isEditMode
            ? "Edit the website URL below"
            : "Enter multiple website URLs separated by commas to create them in bulk"
        }
        icon={
          initialUrls ? (
            <PencilLine className="w-7 h-7 text-slate-700" />
          ) : (
            <Plus className="w-7 h-7 text-slate-700" />
          )
        }
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
            >
              <X className="w-5 h-5" />
              {WebsiteConstants.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formik.isValid}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        {/* Form Fields - Only Website URLs */}
        <div className="flex flex-col gap-5">
          {/* Website URLs Field */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Website {isEditMode ? "URL" : "URLs"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <textarea
              name="websiteUrls"
              placeholder={
                isEditMode ? "Enter website URL..." : "Enter website URLs..."
              }
              value={formik.values.websiteUrls}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={formik.handleBlur}
              rows={isEditMode ? 3 : 8}
              className={`w-full rounded-lg border border-slate-300 text-slate-700 placeholder:text-slate-400 p-3 resize-none focus:outline-none focus:border-indigo-500 ${
                formik.errors.websiteUrls && formik.touched.websiteUrls
                  ? "border-red-300 focus:border-red-500"
                  : ""
              }`}
            />
            {formik.errors.websiteUrls && formik.touched.websiteUrls && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.websiteUrls}
              </p>
            )}
          </div>
        </div>
      </CommonModal>
    </form>
  );
};

export default AddUpdateWebsite;
