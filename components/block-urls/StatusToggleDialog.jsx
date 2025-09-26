"use client";

import { useState } from "react";
import { Ban, CheckCircle, CircleCheck, CircleX, X } from "lucide-react";
import { toast } from "sonner";
import CommonModal from "@/components/common/CommonModal";
import { blockUrlsService } from "@/services/blockUrls";

export default function StatusToggleDialog({
  isOpen,
  onClose,
  onSuccess,
  urlData,
  newStatus,
  isBulkOperation = false,
  selectedCount = 0,
  onBulkConfirm = null,
}) {
  const [loading, setLoading] = useState(false);

  const isActivating = newStatus === true;
  const actionText = isActivating ? "Enable" : "Disable";
  const confirmationText = isActivating ? "Enabling" : "Disabling";

  const handleConfirm = async () => {
    if (isBulkOperation && onBulkConfirm) {
      setLoading(true);
      try {
        await onBulkConfirm(newStatus);
        onClose();
      } catch (error) {
        // Error handling is done in the bulk confirm function
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!urlData) return;

    setLoading(true);

    try {
      const response = await blockUrlsService.updateBlock(urlData._id, {
        isActive: newStatus,
      });
      toast.success(
        response.message ||
          `URL ${isActivating ? "enabled" : "disabled"} successfully!`
      );

      onClose();

      if (onSuccess) {
        onSuccess(urlData._id, newStatus);
      }
    } catch (error) {
      console.error(`Error ${confirmationText} URL:`, error);
      toast.error(
        error?.response?.data?.message ||
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

  if (!isOpen) return null;
  if (!isBulkOperation && !urlData) return null;

  return (
    <CommonModal
      open={isOpen}
      onClose={handleCancel}
      title={isActivating ? "Enable Confirmation" : "Disable Confirmation"}
      isBorderShow={false}
      subtitle2={
        isBulkOperation ? (
          <>
            <div className="text-slate-400 text-sm">
              Are you sure you want {actionText.toLowerCase()}{" "}
              <span className="font-bold">{selectedCount} URL(s)</span> ?
            </div>
          </>
        ) : (
          <>
            <div className="text-slate-400 text-sm">
              Are you sure you want {actionText.toLowerCase()}{" "}
              <span className="font-bold">{urlData?.domain}</span> ?
            </div>
          </>
        )
      }
      icon={
        isActivating ? (
          <CircleCheck className="w-7 h-7 text-slate-600" />
        ) : (
          <CircleX className="w-7 h-7 text-slate-600" />
        )
      }
      size="md"
      footer={
        <>
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
            className={`px-4 py-2.5 rounded-full flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50 bg-indigo-500 text-white hover:bg-indigo-600`}
          >
            {isActivating ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <CircleX className="w-5 h-5" />
            )}
            {loading ? `${actionText}ing...` : actionText}
          </button>
        </>
      }
    ></CommonModal>
  );
}
