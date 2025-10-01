"use client";

import React from "react";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import CommonModal from "@/components/common/CommonModal";
import { PasswordField } from "@/components/forms";
import { KeyRound, CircleCheckBig, CircleXIcon } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user";
import Loading from "../ui/loading";

const ChangePasswordDialog = ({ open = false, onClose, user = null, onSuccess }) => {
  const [submitting, setSubmitting] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(6, "New password must be at least 6 characters")
        .max(50, "New password must be less than 50 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
          "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
        .required("New password is required"),
      confirmPassword: Yup.string()
        .min(6, "Confirm password must be at least 6 characters")
        .max(50, "Confirm password must be less than 50 characters")
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
          "Confirm password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setSubmitting(true);
        if (!user || !user.email) {
          throw new Error("No user email found");
        }
        await userService.changePassword({
          email: user.email,
          password: values.newPassword,
        });
        toast.success("Password changed successfully");
        resetForm();
        onSuccess?.();
        onClose?.();
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || "Failed to change password";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
    validateOnMount: true,
  });

  // Reset when dialog closes
  React.useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    formik.resetForm();
    onClose?.();
  };

  const subtitle = (
    <span>
      Are you sure you want to change{" "}
      {user?.fullName ? <span className="font-bold">{user.fullName}'s</span> : "this user's"} password?
    </span>
  );

  const footer = (
    <>
      <Button
        type="button"
        variant="default"
        onClick={handleClose}
        disabled={submitting}
        className="gap-1.5 px-4 py-2.5 bg-white hover:bg-white-200 text-slate-500 hover:text-slate-600 rounded-3xl font-semibold w-full sm:w-auto"
      >
        <CircleXIcon className="h-4 w-4" />
        Cancel
      </Button>
      <Button
        type="submit"
        form="changePasswordForm"
        variant="default"
        disabled={submitting || !formik.isValid || !formik.dirty}
        className="gap-1.5 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-3xl font-semibold w-full sm:w-auto"
      >
        {submitting ? (
          <Loading size="sm" color="white" className="w-4 h-4 animate-spin" />
        ) : (
          <CircleCheckBig className="w-4 h-4" />
        )}
        Save
      </Button>
    </>
  );

  return (
    <CommonModal
      open={open}
      onClose={handleClose}
      title="Change Password"
      icon={<KeyRound className="w-[25px] h-[25px]" />}
      size="sm"
      preventClose={submitting}
      subtitle={subtitle}
      noScroll
      footer={footer}
    >
      <FormikProvider value={formik}>
        <form id="changePasswordForm" onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="grid gap-4">
            <PasswordField name="newPassword" label="New Password" placeholder="Enter new password" required />
            <PasswordField
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter new password"
              required
            />
          </div>
        </form>
      </FormikProvider>
    </CommonModal>
  );
};

export default ChangePasswordDialog;
