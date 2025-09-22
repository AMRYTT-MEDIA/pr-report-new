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

const ChangePasswordDialog = ({
  open = false,
  onClose,
  user = null,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
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
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to change password";
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
  }, [open]);

  const handleClose = () => {
    formik.resetForm();
    onClose?.();
  };

  const subtitle = (
    <span>
      Are you sure you want to change{" "}
      {user?.fullName ? (
        <span className="font-bold">{user.fullName}'s</span>
      ) : (
        "this user's"
      )}{" "}
      password?
    </span>
  );

  const footer = (
    <>
      <Button
        type="button"
        variant="default"
        onClick={handleClose}
        disabled={submitting}
        className="gap-1.5 px-4 py-2.5 bg-white hover:bg-white-20 text-gray-scale-60 hover:text-primary-60 rounded-3xl font-semibold w-full sm:w-auto"
      >
        <CircleXIcon className="h-4 w-4" />
        Cancel
      </Button>
      <Button
        type="submit"
        form="changePasswordForm"
        variant="default"
        disabled={submitting || !formik.isValid || !formik.dirty}
        className="gap-1.5 px-4 py-2.5 bg-primary-50 hover:bg-primary-60 text-white rounded-3xl font-semibold w-full sm:w-auto"
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
        <form
          id="changePasswordForm"
          onSubmit={formik.handleSubmit}
          autoComplete="off"
        >
          <div className="grid gap-4">
            <PasswordField
              name="newPassword"
              label="New Password"
              placeholder="Enter new password"
              required
            />
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
