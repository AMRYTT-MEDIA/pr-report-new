"use client";

import React from "react";
import { Plus, PencilLine } from "lucide-react";
import { toast } from "sonner";
import CommonModal from "@/components/common/CommonModal";
import UserForm from "./components/UserForm";
import FormFooter from "./components/FormFooter";
import { useUserForm } from "./hooks/useUserForm";

const UserDialog = ({ open, onClose, user, onSuccess, roles, rolesLoading }) => {
  const isEdit = !!user;
  const { formik, loading, showPassword, setShowPassword } = useUserForm(user, isEdit, open, roles, rolesLoading);

  const handleSubmit = async () => {
    try {
      await formik.submitForm();
      toast.success(isEdit ? "User updated successfully" : "User created successfully");
      onSuccess?.();
      onClose();
      formik.resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save user");
    }
  };

  const footer = (
    <FormFooter
      loading={loading}
      isValid={formik.isValid}
      dirty={formik.dirty}
      isEdit={isEdit}
      onCancel={onClose}
      onSubmit={handleSubmit}
    />
  );

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Update User" : "Add User"}
      subtitle={isEdit ? `Are you sure you want to Update ` : "Are you sure you want to Add New user ?"}
      subtitle2={isEdit && `${user?.fullName} ?`}
      icon={isEdit ? <PencilLine className="w-7 h-7 text-slate-600" /> : <Plus className="w-7 h-7 text-slate-900" />}
      footer={footer}
      size="lg"
      className="w-full mx-5 md:w-[600px] md:mx-0"
      preventClose={loading}
      noScroll={true}
    >
      <div className="space-y-5">
        <UserForm
          formik={formik}
          isEdit={isEdit}
          roles={roles}
          rolesLoading={rolesLoading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          open={open}
        />
      </div>
    </CommonModal>
  );
};

export default UserDialog;
