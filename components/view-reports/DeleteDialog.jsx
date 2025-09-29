import React from "react";
import { Trash2, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonModal from "@/components/common/CommonModal";

const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Delete Confirmation",
  description = "Are you sure you want to Delete",
  itemName = "this",
  warningText = "If you Delete this item, it will be permanently removed.",
  confirmText = "Delete",
  cancelText = "Cancel",
  IconComponent = Trash2,
  className = "",
  showCloseButton = false,
}) => {
  if (!open) return null;

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      subtitle2={`${itemName} ?`}
      icon={<IconComponent className="w-5 h-5" />}
      size="md"
      className={className}
      showCloseButton={showCloseButton}
      isBorderShow={false}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
          >
            <X className="w-5 h-5" />
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            {loading ? "Deleting..." : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-2 bg-yellow-50 rounded-lg py-1.5 px-2.5 border border-yellow-100">
        <div>
          <Info className="w-5 h-5 text-yellow-600" />
        </div>
        <p className="text-yellow-600 text-sm font-semibold">{warningText}</p>
      </div>
    </CommonModal>
  );
};

export default DeleteDialog;
