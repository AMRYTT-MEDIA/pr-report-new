import React from "react";
import CommonModal from "@/components/common/CommonModal";
import { Button } from "@/components/ui/button";
import { X, Trash2, Info } from "lucide-react";

const WebsiteDeleteDialog = ({ isOpen, website, confirmDelete, cancelDelete }) => {
  // Footer buttons
  const footerButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={cancelDelete}
        className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
      >
        <X className="w-5 h-5" />
        Cancel
      </Button>
      <Button
        type="button"
        onClick={confirmDelete}
        className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
      >
        <Trash2 className="w-5 h-5" />
        Delete
      </Button>
    </>
  );

  return (
    <CommonModal
      open={isOpen}
      onClose={cancelDelete}
      showCloseButton={true}
      size="md"
      title="Delete Confirmation"
      subtitle="Are you sure you want to Delete"
      subtitle2={`${website?.name || "this"} website?`}
      icon={<Trash2 className="w-5 h-5" />}
      footer={footerButtons}
      footerClassName="bg-white"
      isBorderShow={false}
    >
      <div className="flex items-center gap-2 bg-yellow-50 rounded-lg py-1.5 px-2.5 border border-yellow-100">
        <div>
          <Info className="w-5 h-5 text-yellow-600" />
        </div>
        <p className="text-yellow-600 text-sm font-semibold">
          If you Delete this Website, it will be permanently removed.
        </p>
      </div>
    </CommonModal>
  );
};

export default WebsiteDeleteDialog;
