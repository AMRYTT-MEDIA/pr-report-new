"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik, FormikProvider } from "formik";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, PasswordField, FileUploadField } from "@/components/forms";
import { Save, X } from "lucide-react";
import {
  profileValidationSchema,
  getProfileInitialValues,
  transformProfileValues,
} from "@/lib/validations/profileSchema";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { userService } from "@/services/user";
import { toast } from "sonner";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";

/**
 * Optimized Profile Form Component using Formik and Yup
 * Responsive design with proper validation and error handling
 */
export const ProfileForm = ({ className = "" }) => {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Set breadcrumb for this page
  useBreadcrumbDirect([{ name: "Profile", href: "/profile", current: true }]);

  // Handle form submission with all the logic
  const handleSubmit = useCallback(
    async (values) => {
      setIsLoading(true);

      try {
        // Check if password fields are being changed
        const isPasswordChange =
          values.newPassword &&
          values.currentPassword &&
          values.confirmPassword;

        const response = await userService.updateProfile(values);

        if (response.user) {
          toast.success(response.message || "Profile updated successfully!");

          // If password was changed, logout the user
          if (isPasswordChange) {
            // Logout immediately after password change
            await logout();
            router.push("/login");
          } else {
            // If only username/avatar was changed, update user context with latest data
            if (values.fullName || values.avatar) {
              formik.resetForm();
              setUser(response.user);
            }
          }

          // Return success to indicate form should be reset
          return { user: true };
        } else {
          toast.error(response.message || "Failed to update profile");
          // Return failure to indicate form should NOT be reset
          return { user: false };
        }
      } catch (error) {
        console.error("Profile update error:", error);

        // Handle different error types
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to update profile. Please try again.");
        }

        // Return failure to indicate form should NOT be reset
        return { user: false };
      } finally {
        setIsLoading(false);
      }
    },
    [user, router, logout, setUser]
  );

  // Initialize formik
  const formik = useFormik({
    initialValues: getProfileInitialValues(user),
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(null);
        const transformedValues = transformProfileValues(values);
        const result = await handleSubmit(transformedValues);

        // Only reset form if submission was successful
        if (result && result.user) {
          // Reset form after successful submission
          formik.resetForm({ values: getProfileInitialValues(user) });
        }
      } catch (error) {
        // Don't show form error status since toast notifications handle this
        // The error is already handled in the parent component with toast
        console.error("Form submission error:", error);
        // Don't reset form on error - keep user's entered data
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Effect to validate all password fields when any password field changes
  useEffect(() => {
    const { currentPassword, newPassword, confirmPassword } = formik.values;

    // If any password field has a value, validate all password fields
    if (currentPassword || newPassword || confirmPassword) {
      // Set touched state for all password fields to show errors immediately
      formik.setTouched({
        ...formik.touched,
        currentPassword: true,
        newPassword: true,
        confirmPassword: true,
      });

      // Trigger validation for the entire form to ensure cross-field validation works
      formik.validateForm();
    } else {
      // If all password fields are empty, reset their touched state
      formik.setTouched({
        ...formik.touched,
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
    }
  }, [
    formik.values.currentPassword,
    formik.values.newPassword,
    formik.values.confirmPassword,
  ]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    formik.resetForm();
    router.back(); // Navigate to the previous page
  }, [formik, router]);

  return (
    <div className={cn("bg-white", className)}>
      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          autoComplete="off"
          noValidate
          data-lpignore="true"
        >
          {/* Single Unified Responsive Layout */}
          <div className="bg-slate-50 md:bg-white min-h-screen md:min-h-0">
            {/* Main Container */}
            <div className="bg-neutral-50 md:bg-transparent px-4 md:px-8  lg:mx-auto py-5 md:py-4 lg:py-6">
              <div className="md:flex md:gap-8">
                {/* Title & Description */}
                <div className="md:w-[204px] md:flex-shrink-0 mb-6 md:mb-0">
                  <h1 className="text-sm font-semibold text-slate-700 leading-5">
                    Personal info
                  </h1>
                  <p className="text-sm font-normal text-slate-500 leading-5 mt-1">
                    Update your personal details.
                  </p>
                </div>

                {/* Form Card */}
                <div className="md:flex-1">
                  <Card className="bg-white rounded-xl shadow-[0px_1px_3px_0px_rgba(10,13,18,0.1),0px_1px_2px_0px_rgba(10,13,18,0.06)] md:shadow-[0px_0px_20px_0px_rgba(10,13,18,0.05)] border-0">
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-6">
                        {/* Status Message */}
                        {formik.status && (
                          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">
                              {formik.status}
                            </p>
                          </div>
                        )}

                        {/* Avatar Upload - Different order on mobile vs desktop */}
                        <div className="md:order-1 order-5">
                          <div className="md:block hidden">
                            <FileUploadField
                              name="avatar"
                              currentImage={user?.avatar || null}
                              fallbackText={
                                (formik.values?.fullName || user?.fullName)
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"
                              }
                            />
                          </div>

                          {/* Mobile Avatar Section */}
                          <div className="md:hidden block">
                            <div className="flex items-center gap-5">
                              <div className="flex-1">
                                <FileUploadField
                                  name="avatar"
                                  currentImage={user?.avatar || null}
                                  fallbackText={
                                    (formik.values?.fullName || user?.fullName)
                                      ?.charAt(0)
                                      ?.toUpperCase() || "U"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4 md:space-y-4 md:order-2 order-1">
                          {/* User Name Field */}
                          <div className="space-y-2">
                            <FormField
                              name="fullName"
                              label="User Name"
                              placeholder="Enter your full name"
                              required
                            />
                          </div>

                          {/* User Role Field */}
                          <div className="space-y-2">
                            <FormField
                              name="role"
                              label="User Role"
                              disabled
                              className="bg-slate-50"
                            />
                          </div>

                          {/* Email Field */}
                          <div className="space-y-2">
                            <FormField
                              name="email"
                              label="Email Address"
                              type="email"
                              disabled
                              className="bg-slate-50"
                              required
                            />
                          </div>

                          {/* Password Fields - Different layout on mobile vs desktop */}
                          <div className="space-y-4 md:space-y-4">
                            {/* Current Password - Hidden on mobile */}
                            <div className="block">
                              <PasswordField
                                name="currentPassword"
                                label="Current Password"
                                placeholder="Enter current password"
                                required
                                autoComplete="current-password"
                              />
                            </div>

                            {/* New Password & Confirm Password */}
                            <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                              <PasswordField
                                name="newPassword"
                                label="New Password"
                                placeholder="Enter new password"
                                required
                                autoComplete="new-password"
                              />

                              <PasswordField
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Confirm new password"
                                required
                                autoComplete="new-password"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2.5 md:gap-3 justify-end pt-4 md:order-3 order-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={formik.isSubmitting || isLoading}
                            className="rounded-full px-4 py-2.5 md:py-2 h-10 border-slate-300 text-slate-600 hover:bg-slate-50 bg-white"
                          >
                            <X className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              formik.isSubmitting ||
                              isLoading ||
                              !formik.dirty ||
                              Object.keys(formik.errors).length > 0
                            }
                            className="rounded-full px-4 py-2.5 md:py-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
                          >
                            <Save className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                            {formik.isSubmitting || isLoading
                              ? "Saving..."
                              : "Save"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ProfileForm;
