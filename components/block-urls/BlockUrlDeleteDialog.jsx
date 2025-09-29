import React from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonModal from "@/components/common/CommonModal";

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

  const getSubtitle = () => {
    if (message) return message;

    if (isBulkDelete) {
      // return `Are you sure you want to delete ${selectedCount} URL(s)? This action cannot be undone.`;
      return (
        <>
          Are you sure you want to delete{" "}
          <span className="font-bold">{selectedCount} URL(s)</span> ? This
          action cannot be undone.
        </>
      );
    }

    return (
      <div className="text-slate-400 text-sm">
        Are you sure you want to delete{" "}
        <span className="font-bold">{urlData.domain} </span>URL(s)?
      </div>
    );
  };

  const getSubtitle2 = () => {
    if (isBulkDelete || message) return "";
    return "This action cannot be undone.";
  };

  const footer = (
    <>
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
        className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
      >
        <Trash2 className="w-5 h-5" />
        {loading ? "Deleting..." : "Delete"}
      </Button>
    </>
  );

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={getSubtitle()}
      icon={<Trash2 className="w-5 h-5" />}
      footer={footer}
      showCloseButton={true}
      size="md"
      className="max-w-[90vw] sm:max-w-[550px]"
      noScroll={false}
      isBorderShow={false}
    ></CommonModal>
  );
};

export default BlockUrlDeleteDialog;
