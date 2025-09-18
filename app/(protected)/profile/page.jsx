"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import ProfileForm from "@/components/profile/ProfileForm";

/**
 * Profile Page Component
 * Optimized with Formik, Yup validation, and reusable components
 * Fully responsive design matching Figma specifications
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Set breadcrumb for this page
  useBreadcrumbDirect([{ name: "Profile", href: "/profile", current: true }]);

  // Optimized submit handler with proper error handling
  const handleSubmit = useCallback(async (values) => {
    setIsLoading(true);

    try {
      // TODO: Implement actual API call to update profile
      console.log("Updating profile with values:", values);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // const response = await updateUserProfile(values);
      // if (response.success) {
      //   toast.success('Profile updated successfully!');
      //   // Update user context if needed
      // }

      alert("Profile updated successfully! (Demo)");
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimized cancel handler - navigate back to previous page
  const handleCancel = useCallback(() => {
    console.log("Profile edit cancelled - navigating back");
    router.back(); // Navigate to the previous page
  }, [router]);

  return (
    <ProfileForm
      user={user}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}
