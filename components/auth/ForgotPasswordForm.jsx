"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import Link from "next/link";
import { EmailIcon, ArrowRightIcon } from "@/components/icon";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailSent, setEmailSent] = useState(false);
  const [checkedEmails, setCheckedEmails] = useState(new Set()); // Track checked emails
  const router = useRouter();

  // Simple function to just try sending the reset email directly
  const sendResetEmailDirectly = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, userExists: true };
    } catch (error) {
      console.error("Direct reset email failed:", error);

      if (error.code === "auth/user-not-found") {
        return { success: false, userExists: false, error };
      }

      return { success: false, userExists: true, error }; // Assume user exists for other errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    if (loading) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if we've already verified this email
    if (checkedEmails.has(email)) {
      // Email already checked, proceed directly to sending reset
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset link has been sent to your email!");
        // Add a small delay to ensure toast is visible before state change
        setTimeout(() => {
          setEmailSent(true);
        }, 500);
      } catch (error) {
        let errorMessage = "Failed to send password reset email";

        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Please try again later";
            break;
          case "auth/network-request-failed":
            errorMessage =
              "Network error. Please check your connection and try again";
            break;
          default:
            errorMessage = "An error occurred. Please try again later";
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    try {
      // Use the direct approach - try to send reset email and handle the response
      const result = await sendResetEmailDirectly(email);

      if (result.success) {
        // Email sent successfully, user exists
        setCheckedEmails((prev) => new Set([...prev, email]));
        toast.success("Password reset link has been sent to your email!");
        setTimeout(() => {
          setEmailSent(true);
        }, 500);
      } else if (!result.userExists) {
        // User doesn't exist
        toast.error(
          "No account found with this email address. Please check your email or create a new account."
        );
        setTimeout(() => {
          setLoading(false);
        }, 100);
        return;
      } else {
        // Other error occurred, but user might exist
        toast.error(
          "Failed to send password reset email. Please try again later."
        );
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setCheckedEmails(new Set()); // Reset checked emails
    router.push("/login");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-[607px] rounded-3xl border border-gray-200 bg-white/99 shadow-login-card p-[45px]">
          <CardHeader className="text-center p-0">
            <div className="flex justify-center items-center">
              <Image
                src="/guestpost-link.webp"
                alt="PR Reports"
                width={223}
                height={45}
                priority={true}
              />
            </div>
            <CardTitle className="text-center text-[#1E293B] font-inter text-2xl font-semibold leading-[24.2px] pt-10 card-title">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center pt-[10px] text-[#475569] text-base font-medium card-description">
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-10">
            <div className="space-y-6">
              <div className="text-center text-sm text-[#64748B]">
                <p>
                  Check your email and click the reset link to reset your
                  password.
                </p>
                <p className="mt-2">
                  If you don't see an email, check your spam folder.
                </p>
                <p className="mt-2">The reset link will expire in 1 hour.</p>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full rounded-[1234px] bg-primary-60 hover:bg-primary-70 text-white transition-colors border border-primary-40 flex items-center justify-center gap-2 py-3"
                >
                  Back to Login
                  <ArrowRightIcon className="h-5 w-5 text-white" />
                </Button>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setCheckedEmails(new Set()); // Reset checked emails
                  }}
                  variant="outline"
                  className="w-full rounded-[1234px] border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors py-3"
                >
                  Send Another Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[607px] rounded-3xl border border-gray-200 bg-white/99 shadow-login-card p-[45px]">
        <CardHeader className="text-center p-0">
          <div className="flex justify-center items-center">
            <Image
              src="/guestpost-link.webp"
              alt="PR Reports"
              width={223}
              height={45}
              priority={true}
            />
          </div>
          <CardTitle className="text-center text-[#1E293B] font-inter text-2xl font-semibold leading-[24.2px] pt-10 card-title">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center pt-[10px] text-[#475569] text-base font-medium card-description">
            Enter your email address below. We'll send a password reset link if
            an account exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#374151]"
                >
                  Email Address
                </label>
                {checkedEmails.has(email) && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EmailIcon height={14} width={17} />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear checked emails when user changes email
                    if (checkedEmails.has(e.target.value)) {
                      setCheckedEmails((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(e.target.value);
                        return newSet;
                      });
                    }
                  }}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-[1234px] bg-primary-60 hover:bg-primary-70 text-white transition-colors border border-primary-40 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading
                    size="sm"
                    color="white"
                    showText={true}
                    text="Sending..."
                  />
                </div>
              ) : (
                <>
                  Submit
                  <ArrowRightIcon className="h-5 w-5 text-white" />
                </>
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-brand-scale-60 hover:text-brand-scale-70 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
