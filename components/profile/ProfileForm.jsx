"use client";

import { useCallback } from "react";
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

/**
 * Optimized Profile Form Component using Formik and Yup
 * Responsive design with proper validation and error handling
 */
export const ProfileForm = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  className = "",
}) => {
  console.log("user", user);
  // Initialize formik
  const formik = useFormik({
    initialValues: getProfileInitialValues(user),
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(null);
        const transformedValues = transformProfileValues(values);
        await onSubmit(transformedValues);
      } catch (error) {
        setStatus(
          error.message || "An error occurred while saving your profile"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    formik.resetForm();
    if (onCancel) {
      onCancel();
    }
  }, [onCancel, formik]);

  return (
    <div className={cn("", className)}>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          {/* Desktop & Laptop Layout */}
          <div className="hidden lg:block">
            <div className="max-w-[1270px] mx-auto  py-6">
              <div className="flex gap-8">
                {/* Left Side - Title & Description */}
                <div className="w-[204px] flex-shrink-0">
                  <h1 className="text-sm font-semibold text-slate-700 leading-5">
                    Personal info
                  </h1>
                  <p className="text-sm font-normal text-slate-500 leading-5 mt-1">
                    Update your personal details.
                  </p>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1">
                  <Card className="bg-white rounded-xl shadow-[0px_0px_20px_0px_rgba(10,13,18,0.05)] border-0">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Status Message */}
                        {formik.status && (
                          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">
                              {formik.status}
                            </p>
                          </div>
                        )}

                        {/* Avatar Upload */}
                        <FileUploadField
                          name="avatar"
                          currentImage={user?.avatar}
                          fallbackText={
                            formik.values?.fullName?.charAt(0)?.toUpperCase() ||
                            user?.fullName?.charAt(0)?.toUpperCase()
                          }
                        />

                        {/* Form Fields */}
                        <div className="space-y-4">
                          <FormField
                            name="fullName"
                            label="User Name"
                            placeholder="Enter your full name"
                            required
                          />

                          <FormField
                            name="role"
                            label="User Role"
                            disabled
                            className="bg-slate-50"
                          />

                          <FormField
                            name="email"
                            label="Email Address"
                            type="email"
                            disabled
                            className="bg-slate-50"
                            required
                          />

                          {/* Password Fields */}
                          <div className="grid grid-cols-2 gap-6">
                            <PasswordField
                              name="newPassword"
                              label="New Password"
                              placeholder="Enter new password"
                              required
                            />

                            <PasswordField
                              name="confirmPassword"
                              label="Confirm Password"
                              placeholder="Confirm new password"
                              required
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={formik.isSubmitting || isLoading}
                            className="rounded-full px-4 py-2 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              formik.isSubmitting || isLoading || !formik.dirty
                            }
                            className="rounded-full px-4 py-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
                          >
                            <Save className="w-4 h-4 mr-2" />
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

          {/* Tablet Layout */}
          <div className="hidden md:block lg:hidden">
            <div className="px-8 py-4">
              <div className="space-y-4">
                {/* Title & Description */}
                <div className="w-[204px]">
                  <h1 className="text-sm font-semibold text-slate-700 leading-5">
                    Personal info
                  </h1>
                  <p className="text-sm font-normal text-slate-500 leading-5 mt-1">
                    Update your personal details.
                  </p>
                </div>

                {/* Form Card */}
                <Card className="bg-white rounded-xl shadow-[0px_0px_20px_0px_rgba(10,13,18,0.05)] border-0">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Status Message */}
                      {formik.status && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-sm text-red-600">
                            {formik.status}
                          </p>
                        </div>
                      )}

                      {/* Avatar Upload */}
                      <FileUploadField
                        name="avatar"
                        currentImage={user?.avatar}
                        fallbackText={
                          formik.values?.fullName?.charAt(0)?.toUpperCase() ||
                          user?.fullName?.charAt(0)?.toUpperCase()
                        }
                      />

                      {/* Form Fields */}
                      <div className="space-y-6">
                        <FormField
                          name="fullName"
                          label="User Name"
                          placeholder="Enter your full name"
                          required
                        />

                        <FormField
                          name="role"
                          label="User Role"
                          disabled
                          className="bg-slate-50"
                        />

                        <FormField
                          name="email"
                          label="Email Address"
                          type="email"
                          disabled
                          className="bg-slate-50"
                          required
                        />

                        {/* Password Fields */}
                        <div className="grid grid-cols-2 gap-6">
                          <PasswordField
                            name="newPassword"
                            label="New Password"
                            placeholder="Enter new password"
                          />

                          <PasswordField
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={formik.isSubmitting || isLoading}
                          className="rounded-full px-4 py-2 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            formik.isSubmitting || isLoading || !formik.dirty
                          }
                          className="rounded-full px-4 py-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
                        >
                          <Save className="w-4 h-4 mr-2" />
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

          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="px-4 py-4">
              <div className="space-y-4">
                {/* Title & Description */}
                <div>
                  <h1 className="text-sm font-semibold text-slate-700 leading-5">
                    Personal info
                  </h1>
                  <p className="text-sm font-normal text-slate-500 leading-5 mt-1">
                    Update your personal details.
                  </p>
                </div>

                {/* Form Card */}
                <Card className="bg-white rounded-xl shadow-[0px_1px_3px_0px_rgba(10,13,18,0.1),0px_1px_2px_0px_rgba(10,13,18,0.06)] border-0">
                  <CardContent className="p-4">
                    <div className="space-y-6">
                      {/* Status Message */}
                      {formik.status && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-sm text-red-600">
                            {formik.status}
                          </p>
                        </div>
                      )}

                      {/* Form Fields First on Mobile */}
                      <div className="space-y-6">
                        <FormField
                          name="fullName"
                          label="User Name"
                          placeholder="Enter your full name"
                          required
                        />

                        <FormField
                          name="role"
                          label="User Role"
                          disabled
                          className="bg-slate-50"
                        />

                        <FormField
                          name="email"
                          label="Email Address"
                          type="email"
                          disabled
                          className="bg-slate-50"
                          required
                        />

                        {/* Password Fields - Stack vertically on mobile */}
                        <div className="space-y-4">
                          <PasswordField
                            name="newPassword"
                            label="New Password"
                            placeholder="Enter new password"
                          />

                          <PasswordField
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      {/* Avatar Upload - After form fields on mobile */}
                      <FileUploadField
                        name="avatar"
                        currentImage={user?.avatar}
                        fallbackText={
                          formik.values?.fullName?.charAt(0)?.toUpperCase() ||
                          user?.fullName?.charAt(0)?.toUpperCase()
                        }
                      />

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={formik.isSubmitting || isLoading}
                          className="rounded-full px-4 py-2 h-10 border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            formik.isSubmitting || isLoading || !formik.dirty
                          }
                          className="rounded-full px-4 py-2 h-10 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50"
                        >
                          <Save className="w-4 h-4 mr-2" />
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
        </form>
      </FormikProvider>
    </div>
  );
};

export default ProfileForm;
