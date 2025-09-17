"use client";

import { useState } from "react";
import { Ban, CheckCircle, CircleCheck, CircleX, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { blockUrlsService } from "@/services/blockUrls";

export default function StatusToggleDialog({
  isOpen,
  onClose,
  onSuccess,
  urlData,
  newStatus,
}) {
  const [loading, setLoading] = useState(false);

  const isActivating = newStatus === true;
  const actionText = isActivating ? "Unblock" : "Block";
  const confirmationText = isActivating ? "unblocking" : "blocking";

  const handleConfirm = async () => {
    if (!urlData) return;

    setLoading(true);

    try {
      const response = await blockUrlsService.updateBlock(urlData._id, {
        isActive: newStatus,
      });
      toast.success(
        response.message ||
          `URL ${isActivating ? "unblocked" : "blocked"} successfully!`
      );

      onClose();

      if (onSuccess) {
        onSuccess(urlData._id, newStatus);
      }
    } catch (error) {
      console.error(`Error ${confirmationText} URL:`, error);
      toast.error(
        error.response.data.message ||
          error.message ||
          `Failed to ${actionText.toLowerCase()} URL. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!urlData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-1xl bg-white border border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
        showCloseButton={false}
      >
        <div className="bg-white rounded-[14px] border border-slate-300 p-5 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="bg-white rounded-[10px] border border-slate-300 w-12 h-12 flex items-center justify-center">
              {isActivating ? (
                <CircleCheck className="w-7 h-7 text-slate-600" />
              ) : (
                <CircleX className="w-7 h-7 text-slate-600" />
              )}
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
              {isActivating ? "Enable Confirmation" : "Disable Confirmation"}
            </h2>
            <p className="text-sm font-medium text-[#263145] opacity-50">
              Are you sure you want {actionText.toLowerCase()}{" "}
              <span className="font-bold">{urlData.domain}</span>?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex justify-end gap-2.5">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-full flex items-center gap-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              isActivating
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "bg-rose-100 text-rose-600 hover:bg-rose-200"
            }`}
          >
            {isActivating ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Ban className="w-5 h-5" />
            )}
            {loading ? `${actionText}ing...` : actionText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
