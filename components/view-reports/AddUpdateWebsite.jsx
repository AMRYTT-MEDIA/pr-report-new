"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { X, Plus, Save, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import WebsiteConstants from "../website/constans";
import { viewReportsService } from "@/services/viewReports";
import CommonModal from "@/components/common/CommonModal";
import Loading from "../ui/loading";
import { urlValidationSchemas, parseAndNormalizeUrls } from "@/lib/validations/urlSchema";

const AddUpdateWebsite = ({ onWebsiteAdded, isOpen, onClose, initialUrls = "", report, loading = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Determine if we're in edit mode (single URL) or add mode (multiple URLs)
  const isEditMode = initialUrls && initialUrls.trim() !== "";

  // Get initial form values - only Website URLs field
  const getInitialValues = () => ({
    websiteUrls: initialUrls || "",
  });

  // Check if the URL has changed from the original value (for edit mode)
  const hasUrlChanged = () => {
    if (!isEditMode) return true; // Always allow save for add mode
    // eslint-disable-next-line no-use-before-define
    const currentValue = formik?.values?.websiteUrls?.trim() || "";
    const originalValue = initialUrls?.trim() || "";
    return currentValue !== originalValue;
  };

  // Formik configuration - only Website URLs field
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: isEditMode ? urlValidationSchemas.singleUrl : urlValidationSchemas.multipleUrls,
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
          urls,
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
                ...(response.data || response.websites || urls.map((url) => ({ url, success: true })))
              );
            } else {
              throw new Error(response.message || "API call failed");
            }
          } catch (error) {
            //empty catch
            toast.error(error.response.data.message || "Failed to submit URLs to API");
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
          // eslint-disable-next-line no-use-before-define
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
          formattedUrls = `${formattedUrls}, `;
        }
      }
      formik.resetForm({ values: { websiteUrls: formattedUrls } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialUrls]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Custom handler for textarea to add commas on Enter key
  const handleTextareaChange = (e) => {
    const { value } = e.target;

    // Don't interfere with user typing - let them type naturally
    formik.setFieldValue("websiteUrls", value);

    // Trigger validation on change
    formik.setFieldTouched("websiteUrls", true);

    // Trigger validation immediately while typing
    setTimeout(() => {
      formik.validateField("websiteUrls");
    }, 0);
  };

  // Handle blur to normalize comma spacing

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
      const needsComma = trimmedBefore.length > 0 && !trimmedBefore.endsWith(",");

      // Add comma and space, then move to new line
      const newValue = `${beforeCursor + (needsComma ? ", " : "")}\n${afterCursor}`;
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

      const beforeCursor = currentValue.substring(0, cursorPosition).trim();
      const afterCursor = currentValue.substring(cursorPosition).trim();

      // Only add comma if there's content before cursor and it doesn't end with comma or newline
      const needsComma = beforeCursor.length > 0 && !beforeCursor.endsWith(", ") && !beforeCursor.endsWith("\n");
      const finalText = beforeCursor + (needsComma ? ", " : "") + processedText + afterCursor;

      formik.setFieldValue("websiteUrls", finalText);

      // Set cursor position after pasted text
      setTimeout(() => {
        const newCursorPosition = (beforeCursor.length > 0 ? beforeCursor.length + 2 : 0) + processedText.length;
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
    <form onSubmit={formik.handleSubmit}>
      <CommonModal
        open={isOpen}
        onClose={handleClose}
        title={`${isEditMode ? "Edit" : "Bulk Add"} Website ${isEditMode ? "URL" : "URLs"}`}
        subtitle={
          isEditMode
            ? "Edit the website URL below"
            : "Enter multiple website URLs separated by commas to create them in bulk"
        }
        icon={
          initialUrls ? <PencilLine className="w-7 h-7 text-slate-700" /> : <Plus className="w-7 h-7 text-slate-700" />
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
              disabled={isLoading || !formik.isValid || !hasUrlChanged() || loading}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
            >
              {!isLoading && !loading && <Save className="w-5 h-5" />}
              {isLoading || loading ? <Loading size="sm" color="white" showText={true} text="Save" /> : "Save"}
            </Button>
          </>
        }
      >
        {/* Form Fields - Only Website URLs */}
        <div className="flex flex-col gap-5">
          {/* Website URLs Field */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Website {isEditMode ? "URL" : "URLs"} <span className="text-red-500">*</span>
            </Label>
            <textarea
              name="websiteUrls"
              placeholder={isEditMode ? "Enter website URL..." : "Enter website URLs..."}
              value={formik.values.websiteUrls}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              rows={isEditMode ? 3 : 8}
              className={`w-full rounded-lg border border-slate-300 text-slate-700 placeholder:text-slate-400 p-3 resize-none focus:outline-none focus:border-indigo-500 ${
                formik.errors.websiteUrls && formik.touched.websiteUrls ? "border-red-300 focus:border-red-500" : ""
              }`}
            />
            {formik.errors.websiteUrls && formik.touched.websiteUrls && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.websiteUrls}</p>
            )}
          </div>
        </div>
      </CommonModal>
    </form>
  );
};

export default AddUpdateWebsite;
