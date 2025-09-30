"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { X, Plus, Save, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import WebsiteConstants from "../website/constans";
import { viewReportsService } from "@/services/viewReports";
import {
  urlValidationSchemas,
  parseAndNormalizeUrls,
} from "@/lib/validations/urlSchema";
import Loading from "../ui/loading";

const AddUpdateWebsite = ({
  onWebsiteAdded,
  isOpen,
  onClose,
  initialUrls = "",
  report,
  loading = false,
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

  // Check if the URL has changed from the original value (for edit mode)
  const hasUrlChanged = () => {
    if (!isEditMode) return true; // Always allow save for add mode
    const currentValue = formik?.values?.websiteUrls?.trim() || "";
    const originalValue = initialUrls?.trim() || "";
    return currentValue !== originalValue;
  };

  // Formik configuration - only Website URLs field
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: isEditMode
      ? urlValidationSchemas.singleUrl
      : urlValidationSchemas.multipleUrls,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        let urls;

        if (isEditMode) {
          // In edit mode, only process single URL
          urls = [values.websiteUrls.trim()];
        } else {
          // In add mode, process multiple URLs using shared utility
          urls = parseAndNormalizeUrls(values.websiteUrls);
        }

        // Create websites for each URL
        const createdWebsites = [];
        const errors = [];

        // Prepare data for API call
        const apiData = {
          grid_id: report?.grid_id || report?._id || report?.id,
          urls: urls,
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

        // For create mode, close modal automatically
        // For edit mode, let parent component handle modal closing
        if (createdWebsites.length > 0 && !isEditMode) {
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

    // Don't interfere with user typing - let them type naturally
    formik.setFieldValue("websiteUrls", value);

    // Trigger validation on change
    formik.setFieldTouched("websiteUrls", true);

    // Trigger validation immediately while typing
    setTimeout(() => {
      formik.validateField("websiteUrls");
    }, 0);
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
      const beforeCursor = currentValue.substring(0, cursorPosition);
      const afterCursor = currentValue.substring(cursorPosition);

      // Always add comma and space when Enter is pressed (for URL separation)
      const trimmedBefore = beforeCursor.trim();
      const needsComma =
        trimmedBefore.length > 0 && !trimmedBefore.endsWith(",");

      // Add comma and space, then move to new line
      const newValue =
        beforeCursor + (needsComma ? ", " : "") + "\n" + afterCursor;
      formik.setFieldValue("websiteUrls", newValue);

      // Set cursor position after the comma, space, and newline
      setTimeout(() => {
        const newCursorPosition = cursorPosition + (needsComma ? 3 : 1); // +3 for ", \n" or +1 for "\n"
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
      // In add mode, keep newlines as-is for better URL separation
      const processedText = pastedText;

      const currentValue = formik.values.websiteUrls;
      const cursorPosition = e.target.selectionStart;

      const beforeCursor = currentValue.substring(0, cursorPosition);
      const afterCursor = currentValue.substring(cursorPosition);

      // Only add comma if there's content before cursor and it doesn't end with comma or newline
      const needsComma =
        beforeCursor.length > 0 &&
        !beforeCursor.endsWith(", ") &&
        !beforeCursor.endsWith("\n");
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

    // Trigger validation immediately after pasting (for both edit and add modes)
    formik.setFieldTouched("websiteUrls", true);

    // Validate the field immediately
    setTimeout(() => {
      formik.validateField("websiteUrls");
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-1xl bg-white border border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
        showCloseButton={false}
      >
        <form onSubmit={formik.handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-col gap-5 border border-gray-200 rounded-xl p-5 bg-white overflow-y-auto max-h-[84vh] scrollbar-custom">
            {/* Header */}
            <div className="pb-5 border-b-2 border-dashed border-gray-200">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                  {initialUrls ? (
                    <PencilLine className="w-7 h-7 text-slate-700" />
                  ) : (
                    <Plus className="w-7 h-7 text-slate-700" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-1">
                  <span>{isEditMode ? "Edit" : "Bulk Add"} </span>
                  Website {isEditMode ? "URL" : "URLs"}
                </h2>
                <p className="text-sm font-medium text-slate-600">
                  <span>
                    {isEditMode
                      ? "Edit the website URL below"
                      : "Enter multiple website URLs separated by commas to create them in bulk"}
                  </span>
                </p>
              </div>
            </div>

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
                    isEditMode
                      ? "Enter website URL..."
                      : "Enter website URLs..."
                  }
                  value={formik.values.websiteUrls}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onBlur={formik.handleBlur}
                  rows={isEditMode ? 3 : 8}
                  className={`w-full rounded-lg border border-gray-scale-30 text-gray-scale-70 placeholder:text-gray-scale-40 p-3 resize-none focus:outline-none focus:border-primary-50 ${
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
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2.5 items-center justify-center sm:justify-end p-5">
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
              disabled={
                isLoading || !formik.isValid || loading || !hasUrlChanged()
              }
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
            >
              {isLoading || loading ? (
                <Loading size="sm" color="white" showText={true} text="Save" />
              ) : (
                <>
                  <Save className="w-5 h-5" /> {"Save"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUpdateWebsite;
