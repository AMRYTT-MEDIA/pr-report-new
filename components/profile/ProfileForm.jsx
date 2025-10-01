"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik, FormikProvider } from "formik";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, PasswordField } from "@/components/forms";
import { PencilLine, Save, X } from "lucide-react";
import {
  profileValidationSchema,
  getProfileInitialValues,
  transformProfileValues,
} from "@/lib/validations/profileSchema";
import { cn, getAvatarUrl } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { userService } from "@/services/user";
import { toast } from "sonner";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import Loading from "../ui/loading";
import AvatarSelectionPopup from "./AvatarSelectionPopup";
import Image from "next/image";

/**
 * Optimized Profile Form Component using Formik and Yup
 * Responsive design with proper validation and error handling
 */
export const ProfileForm = ({ className = "" }) => {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState(false);

  // Set breadcrumb for this page
  useBreadcrumbDirect([{ name: "Profile", href: "/profile", current: true }]);

  // Handle form submission with all the logic
  const handleSubmit = useCallback(
    async (values) => {
      setIsLoading(true);

      try {
        // Check if password fields are being changed
        const isPasswordChange = values.newPassword && values.currentPassword && values.confirmPassword;

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
              // eslint-disable-next-line no-use-before-define
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.currentPassword, formik.values.newPassword, formik.values.confirmPassword]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    // formik.resetForm();
    router.back(); // Navigate to the previous page
  }, [router]);

  // Avatar selection handler
  const handleAvatarSelect = useCallback(
    (selectedAvatar) => {
      formik.setFieldValue("avatar", selectedAvatar);
    },
    [formik]
  );

  // Handle delete picture - show default avatar
  const handleDeletePicture = useCallback(async () => {
    try {
      const current = formik.values?.avatar || user?.avatar;
      // Derive filename if URL/path provided
      const filename = typeof current === "string" && current.includes("/") ? current.split("/").pop() : current;

      if (filename) {
        // Delete from server folder
        await fetch(`/api/profile/delete-avatar?filename=${encodeURIComponent(filename)}`, {
          method: "DELETE",
        });
      }

      // Update backend user to clear avatar
      await userService.updateProfile({ avatar: "" });

      // Clear local form state and user context avatar if present
      formik.setFieldValue("avatar", null);
      if (user?.avatar) {
        setUser({ ...user, avatar: null });
      }
      toast.success("Profile picture removed");
    } catch (err) {
      console.error("Delete avatar error:", err);
      toast.error("Failed to delete profile picture");
    }
  }, [formik, user, setUser]);

  return (
    <div className={cn("p-[10px] sm:p-[15px]", className)}>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} autoComplete="off" noValidate data-lpignore="true">
          {/* Main Container */}
          <div className="flex gap-4  mx-auto flex-col md:flex-row">
            {/* Left Avatar Panel */}
            <div className="w-full md:w-[296px] flex-shrink-0">
              <Card className="bg-white rounded-xl border border-slate-200 h-fit">
                <CardContent className="p-5">
                  <div className="flex flex-col items-center space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-5">
                      <div className="relative">
                        <div className="w-[110px] h-[110px] rounded-full overflow-hidden bg-slate-100">
                          {user?.avatar && user?.avatar !== "" && getAvatarUrl(user.avatar) ? (
                            <Image
                              src={getAvatarUrl(user.avatar) || "/placeholder.svg"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              width={110}
                              height={110}
                              unoptimized={true}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-semibold">
                              {(formik.values?.fullName || user?.fullName)?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        {/* Edit Button */}
                        <button
                          type="button"
                          className="absolute bottom-1 right-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"
                          onClick={() => setIsAvatarPopupOpen(true)}
                        >
                          <PencilLine className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Delete Picture Button */}
                      <button
                        type="button"
                        className="bg-blue-50 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                        onClick={handleDeletePicture}
                      >
                        Delete Picture
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-slate-200"></div>

                    {/* User Info Display */}
                    <div className="w-full space-y-5">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-800">User Name</p>
                        <p className="text-base text-slate-500">{formik.values?.fullName || user?.fullName || "N/A"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-800">Email Address</p>
                        <p className="text-base text-slate-500">{formik.values?.email || user?.email || "N/A"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-800">User Role</p>
                        <p className="text-base text-slate-500">{formik.values?.role || user?.role || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 max-w-[849px] ">
              <Card className="bg-white rounded-xl border border-slate-200">
                <CardContent className="p-6 max-h-auto md:max-h-[calc(100vh-74px)] overflow-y-auto scrollbar-custom">
                  <div className="space-y-6">
                    {/* Form Header */}
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Edit Profile</h2>
                      <div className="w-full h-px bg-slate-200 mt-6"></div>
                    </div>

                    {/* Status Message */}
                    {formik.status && (
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600">{formik.status}</p>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-6">
                      {/* User Name Field */}
                      <div className="space-y-2">
                        <FormField name="fullName" label="User Name" placeholder="Enter your full name" required />
                      </div>

                      {/* Password Fields */}
                      <div className="space-y-6">
                        {/* Current Password */}
                        <div className="space-y-2">
                          <PasswordField
                            name="currentPassword"
                            label="Current Password"
                            placeholder="Enter current password"
                            required
                          />
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <PasswordField
                            name="newPassword"
                            label="New Password"
                            placeholder="Enter new password"
                            required
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <PasswordField
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={formik.isSubmitting || isLoading}
                          className="rounded-full px-4 py-2 h-10 border-slate-300 text-slate-600 hover:bg-slate-50 bg-white"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            formik.isSubmitting || isLoading || !formik.dirty || Object.keys(formik.errors).length > 0
                          }
                          className="rounded-full px-4 py-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
                        >
                          {formik.isSubmitting || isLoading ? (
                            <Loading size="sm" color="white" className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Avatar Selection Popup */}
        <AvatarSelectionPopup
          isOpen={isAvatarPopupOpen}
          onClose={() => setIsAvatarPopupOpen(false)}
          onSelectAvatar={handleAvatarSelect}
          currentAvatar={formik.values?.avatar || user?.avatar}
          userName={formik.values?.fullName || user?.fullName}
        />
      </FormikProvider>
    </div>
  );
};

export default ProfileForm;
