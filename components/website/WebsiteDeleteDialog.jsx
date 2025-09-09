import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleX, X, Trash2, Info } from "lucide-react";

const WebsiteDeleteDialog = ({
  isOpen,
  website,
  confirmDelete,
  cancelDelete,
}) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-1xl bg-white boder border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
        showCloseButton={false}
      >
        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl p-5 bg-white overflow-y-auto max-h-[84vh] scrollbar-custom">
          {/* Header */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={cancelDelete}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-font-h2">
                Delete Confirmation
              </h2>
              <p className="text-font-h2-5 text-sm font-medium">
                Are you sure you want to Delete{" "}
                <span className="font-bold">{website?.name || "this"}</span>{" "}
                website?
              </p>
            </div>

            <div className="flex items-center gap-2 bg-warning-5 rounded-lg py-1.5 px-2.5 border border-warning-10">
              <div>
                <Info className="w-5 h-5 text-warning-60" />
              </div>
              <p className="text-warning-60 text-sm font-semibold">
                If you Delete, User is permanent Delete User.
              </p>
            </div>
          </div>
        </div>
        {/* Footer Buttons */}
        <div className="flex gap-2.5 items-center justify-center sm:justify-end p-5">
          <Button
            type="button"
            variant="outline"
            onClick={cancelDelete}
            className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
          >
            <CircleX className="w-5 h-5" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={confirmDelete}
            className="px-6 py-2 bg-primary-50 hover:bg-primary-60 text-white rounded-full font-medium disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteDeleteDialog;
