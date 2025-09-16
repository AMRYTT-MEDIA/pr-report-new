import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { userService } from "@/services/user";
import { toast } from "sonner";

export const useUserForm = (
  user,
  isEdit,
  open,
  roles = [],
  rolesLoading = false
) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get initial values
  const getInitialValues = () => ({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role?._id || "",
    password: "",
  });

  // Formik setup
  const formik = useFormik({
    initialValues: getInitialValues(),
    enableReinitialize: true, // This allows Formik to reinitialize when user changes
    validationSchema: Yup.object({
      fullName: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .required("Name is required"),
      email: isEdit
        ? Yup.string().email("Invalid email address")
        : Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
      role: Yup.string().required("Role is required"),
      password: isEdit
        ? Yup.string()
            .min(6, "Password must be at least 6 characters")
            .max(50, "Password must be less than 50 characters")
        : Yup.string()
            .min(6, "Password must be at least 6 characters")
            .max(50, "Password must be less than 50 characters")
            .required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit) {
          const data = {
            fullName: values.fullName,
            role: values.role,
          };
          await userService.updateUser(user._id, data);
        } else {
          await userService.createUser(values);
        }
        return true; // Success
      } catch (error) {
        console.error("Error saving user:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open && formik) {
      formik.setTouched({}); // Reset touched state
    } else if (!open && formik) {
      formik.resetForm();
    }
  }, [open, user]);

  return {
    formik,
    loading,
    roles,
    rolesLoading,
    showPassword,
    setShowPassword,
  };
};
