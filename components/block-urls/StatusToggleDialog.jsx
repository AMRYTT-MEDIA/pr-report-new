"use client";

import { useState } from "react";
import { Ban, CheckCircle, X } from "lucide-react";
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

  const isBlocking = newStatus === true;
  const actionText = isBlocking ? "Block" : "Unblock";
  const confirmationText = isBlocking ? "blocking" : "unblocking";

  const handleConfirm = async () => {
    if (!urlData) return;

    setLoading(true);

    try {
      await blockUrlsService.updateBlock(urlData.id, { isBlocked: newStatus });
      toast.success(
        `URL ${isBlocking ? "blocked" : "unblocked"} successfully!`
      );

      onClose();

      if (onSuccess) {
        onSuccess(urlData.id, newStatus);
      }
    } catch (error) {
      console.error(`Error ${confirmationText} URL:`, error);
      toast.error(
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
      <DialogContent className="p-0 max-w-md bg-slate-100 rounded-[14px] border border-slate-300 shadow-[0px_0px_20px_0px_rgba(52,64,84,0.08)]">
        <div className="bg-white rounded-[14px] border border-slate-300 p-5 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="bg-white rounded-[10px] border border-slate-300 w-12 h-12 flex items-center justify-center">
              <Ban className="w-7 h-7 text-slate-600" />
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
              {isBlocking ? "Block Website URL" : "Unblock Confirmation"}
            </h2>
            <p className="text-sm font-medium text-[#263145] opacity-50">
              {isBlocking ? (
                `Confirm ${confirmationText} this website?`
              ) : (
                <>
                  Are you sure you want{" "}
                  <span className="font-normal">{actionText}</span>{" "}
                  <span className="font-bold">{urlData.websiteUrl}</span> ?
                </>
              )}
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
              isBlocking
                ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {isBlocking ? (
              <Ban className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {loading ? `${actionText}ing...` : actionText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
