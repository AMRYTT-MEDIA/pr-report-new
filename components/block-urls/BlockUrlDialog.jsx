"use client";

import { useEffect, useState } from "react";
import { Ban, Info, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { blockUrlsService } from "@/services/blockUrls";
import { useFormik } from "formik";
import {
  urlValidationSchemas,
  parseAndNormalizeUrls,
} from "@/lib/validations/urlSchema";
import ErrorMessage from "../ui/error-message";

export default function BlockUrlDialog({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { websiteUrls: "" },
    validationSchema: urlValidationSchemas.blockUrls,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const urls = parseAndNormalizeUrls(values.websiteUrls);

        const response = await blockUrlsService.bulkCreateBlocks(urls);

        toast.success(
          response.message ||
            `Blocked ${urls.length} URL${
              urls.length > 1 ? "s" : ""
            } successfully!`
        );

        formik.resetForm({ values: { websiteUrls: "" } });
        onClose();
        onSuccess && onSuccess();
      } catch (error) {
        console.error("Error blocking URL(s):", error);
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            "Failed to block URL(s). Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  // Ensure clean state on each open/close
  useEffect(() => {
    if (isOpen) {
      formik.resetForm({ values: { websiteUrls: "" } });
    }
  }, [isOpen]);

  const handleOpenChange = (open) => {
    if (!open) {
      formik.resetForm({ values: { websiteUrls: "" } });
      onClose();
    }
  };

  const handleTextareaChange = (e) => {
    // Only clean the value, don't interfere with user typing
    formik?.setFieldValue("websiteUrls", e.target.value);
    formik?.setFieldTouched("websiteUrls", true);

    // Trigger validation immediately while typing
    setTimeout(() => {
      formik.validateField("websiteUrls");
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
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

    // Keep newlines as-is for better URL separation
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

    // Trigger validation immediately after pasting
    formik.setFieldTouched("websiteUrls", true);

    // Validate the field immediately
    setTimeout(() => {
      formik.validateField("websiteUrls");
    }, 0);

    // Set cursor position after pasted text
    setTimeout(() => {
      const newCursorPosition =
        cursorPosition + processedText.length + (needsComma ? 2 : 0);
      e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-1xl bg-slate-100 border border-slate-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0  gap-0 max-w-[90vw] sm:max-w-[550px]"
      >
        <form onSubmit={formik.handleSubmit}>
          <div className="bg-white rounded-xl border border-slate-300 p-5 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="bg-white rounded-[10px] border border-slate-300 w-12 h-12 flex items-center justify-center">
                <Ban className="w-6 h-6 text-slate-600" />
              </div>
              <button
                onClick={handleCancel}
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Title and Description */}
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#263145]">
                Block Website URL
              </h2>
              <p className="text-sm font-medium text-[#263145] opacity-50">
                Enter multiple website URLs separated by commas to create them
                in bulk.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full border-b-2 border-dashed border-slate-300"></div>

            {/* Input Section */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-800">
                Block Website URLs <span className="text-rose-600">*</span>
              </label>
              <textarea
                name="websiteUrls"
                value={formik.values.websiteUrls}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={formik.handleBlur}
                placeholder="Enter website URLs..."
                rows={8}
                className={`w-full rounded-lg border border-slate-300 text-slate-700 placeholder:text-slate-400 p-3 resize-none focus:outline-none focus:border-indigo-500 ${
                  formik.errors.websiteUrls && formik.touched.websiteUrls
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }`}
              />
              {formik.errors.websiteUrls && formik.touched.websiteUrls && (
                <ErrorMessage message={formik.errors.websiteUrls} />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-full flex items-center gap-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !formik.isValid}
              className="px-4 py-2.5 bg-rose-100 rounded-full flex items-center gap-2 text-sm font-semibold text-rose-600 hover:bg-rose-200 transition-colors disabled:opacity-50"
            >
              <Ban className="w-5 h-5" />
              {loading ? "Blocking..." : "Block URL"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
