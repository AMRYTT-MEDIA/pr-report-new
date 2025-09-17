import React from "react";
import { Trash2, X, Info } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BlockUrlDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  urlData = null,
  title = "Delete URL",
  message = null,
  selectedCount = 0,
  isBulkDelete = false,
}) => {
  if (!open) return null;

  // For single delete, require urlData
  if (!isBulkDelete && !urlData) return null;

  const handleConfirm = () => {
    if (isBulkDelete) {
      onConfirm();
    } else {
      onConfirm(urlData._id);
    }
  };

  const getDisplayMessage = () => {
    if (message) return message;

    if (isBulkDelete) {
      return `Are you sure you want to delete ${selectedCount} URL(s)? This action cannot be undone.`;
    }

    return (
      <>
        Are you sure you want to delete{" "}
        <span className="font-bold max-w-[500px] break-words">
          {urlData.domain}
        </span>
        ?
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent
        className="sm:max-w-1xl bg-white border border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
        showCloseButton={false}
      >
        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl p-5 bg-white overflow-y-auto max-h-[84vh] scrollbar-custom">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-font-h2">{title}</h2>
              <p className="text-font-h2-5 text-sm font-medium">
                {getDisplayMessage()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 items-center justify-center sm:justify-end p-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
          >
            <X className="w-5 h-5" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-primary-50 hover:bg-primary-60 text-white rounded-full font-medium disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockUrlDeleteDialog;
