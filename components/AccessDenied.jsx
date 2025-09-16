"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getUserRole } from "@/lib/rbac";

const AccessDenied = ({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  showBackButton = true,
  showHomeButton = true,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const userRole = getUserRole(user);

  // Set proper 403 status in document title for better UX
  useEffect(() => {
    document.title = "403 - Forbidden";
    return () => {
      document.title = "PR Reports"; // Reset to default
    };
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/pr-reports-list"); // Default dashboard for all users
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">{message}</p>

        {/* User role info */}
        {userRole && (
          <p className="text-sm text-gray-500 mb-8">
            Current role:{" "}
            <span className="font-medium capitalize">{userRole}</span>
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          )}

          {showHomeButton && (
            <Button onClick={handleGoHome} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          )}
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 mt-8">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
