"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, CircleXIcon, Info } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";

/**
 * DeleteUserDialog Component
 *
 * A dialog component for deleting users using the CommonModal layout.
 * Uses the shared layout but provides specific content and actions for user deletion.
 */

const DeleteUserDialog = ({
  open = false,
  onClose,
  onConfirm,
  user = null,
  loading = false,
}) => {
  if (!user) return null;

  const handleConfirm = () => {
    onConfirm?.(user);
  };

  // Footer with custom buttons
  const footer = (
    <>
      <Button
        variant="default"
        onClick={onClose}
        className="gap-1.5 px-4 py-2.5 bg-white hover:bg-white-20 text-gray-scale-60 hover:text-primary-60 rounded-3xl font-semibold w-full sm:w-auto"
      >
        <CircleXIcon className="h-4 w-4" />
        Cancel
      </Button>
      <Button
        variant="default"
        onClick={handleConfirm}
        disabled={loading}
        className="gap-1.5 px-4 py-2.5 bg-primary-50 hover:bg-primary-60 text-white rounded-3xl font-semibold w-full sm:w-auto"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </>
  );

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title={`Delete User Confirmation`}
      icon={<Trash2 className="w-[25px] h-[25px]" />}
      footer={footer}
      size="sm"
      preventClose={loading}
      subtitle={`Are you sure you want to ${"delete"} this`}
      subtitle2={`${user.fullName} ?`}
    >
      {/* Main Content */}
      <div className="space-y-4">
        {/* Warning Message */}

        {/* User Details */}
        <div className="flex items-center gap-2 py-[6px] px-[10px] rounded-md border border-yellow-200 bg-yellow-50">
          <Info className="w-5 h-5 text-warning-60" />
          <p className="text-sm font-medium text-warning-60 capitalize">
            If you Delete, User is permanent Delete User.
          </p>
        </div>
      </div>
    </CommonModal>
  );
};

export default DeleteUserDialog;
