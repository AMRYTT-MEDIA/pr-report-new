"use client";

import { useEffect, useState } from "react";
import { Ban, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { blockUrlsService } from "@/services/blockUrls";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function BlockUrlDialog({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { websiteUrls: "" },
    validationSchema: Yup.object().shape({
      websiteUrls: Yup.string()
        .trim()
        .required("Website URL is required")
        .test("valid-urls", "Please enter a valid URL", function (value) {
          if (!value) return true;
          const urls = value
            .split(/[\,\n]/)
            .map((u) => u.trim())
            .filter((u) => u.length > 0);
          const urlPattern =
            /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/;
          const invalid = urls.filter((u) => !urlPattern.test(u));
          if (invalid.length > 0) {
            return this.createError({
              message: `Invalid URLs found: ${invalid.join(", ")}`,
            });
          }
          return true;
        }),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const urls = values.websiteUrls
          .split(/[\,\n]/)
          .map((u) => u.trim())
          .filter((u) => u.length > 0);

        const response = await blockUrlsService.bulkCreateBlocks(
          urls.map((u) => (u.startsWith("http") ? u : `https://${u}`))
        );

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
          error.message || "Failed to block URL(s). Please try again."
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
    const cleanValue = e.target.value
      .toLowerCase()
      .replace(/\s+(?![,\s])/g, "")
      .replace(/\s*,\s*/g, ", ");
    formik?.setFieldValue("websiteUrls", cleanValue);
    formik?.setFieldTouched("websiteUrls", true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentValue = formik.values.websiteUrls;
      const cursorPosition = e.target.selectionStart;
      const beforeCursor = currentValue.substring(0, cursorPosition);
      const afterCursor = currentValue.substring(cursorPosition);
      const hasContentBeforeCursor = beforeCursor.trim().length > 0;
      const endsWithComma =
        beforeCursor.endsWith(",") || beforeCursor.endsWith(", ");
      const needsComma = hasContentBeforeCursor && !endsWithComma;
      const newValue = beforeCursor + (needsComma ? ", " : "") + afterCursor;
      formik.setFieldValue("websiteUrls", newValue);
      setTimeout(() => {
        const newCursorPosition = cursorPosition + (needsComma ? 2 : 0);
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const processedText = pastedText
      .replace(/\n/g, ", ")
      .toLowerCase()
      .replace(/\s+(?![,\s])/g, "")
      .replace(/\s*,\s*/g, ", ");
    const currentValue = formik.values.websiteUrls;
    const cursorPosition = e.target.selectionStart;
    const beforeCursor = currentValue.substring(0, cursorPosition);
    const afterCursor = currentValue.substring(cursorPosition);
    const needsComma = beforeCursor.length > 0 && !beforeCursor.endsWith(", ");
    const finalText =
      beforeCursor + (needsComma ? ", " : "") + processedText + afterCursor;
    formik.setFieldValue("websiteUrls", finalText);
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
        className="sm:max-w-1xl bg-white border border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
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
                Confirm blocking this website?
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-300"></div>

            {/* Input Section */}
            <div className="space-y-2">
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
