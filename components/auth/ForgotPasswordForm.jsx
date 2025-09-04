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
import { useFormik } from "formik";
import { isEmail } from "validator";
import * as Yup from "yup";
import ErrorMessage from "@/components/ui/error-message";

const ForgotPasswordForm = () => {
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .test(
          "is-valid-email",
          "Please enter valid email address. (e.g.,username@example.com)",
          function (value) {
            if (!value) return false;
            return isEmail(value.trim());
          }
        )
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        await sendPasswordResetEmail(auth, values.email);
        toast.success("Password reset link has been sent to your email!");
        setTimeout(() => {
          setEmailSent(true);
        }, 500);
      } catch (error) {
        let errorMessage = "Failed to send password reset email";

        switch (error.code) {
          case "auth/user-not-found":
            errorMessage =
              "No account found with this email address. Please check your email or create a new account.";
            break;
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
      }
    },
  });

  const handleBackToLogin = () => {
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
              We've sent a password reset link to{" "}
              <strong>{formik.values.email}</strong>
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
                    formik.resetForm();
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
      <div className="bg-white relative rounded-[24px] w-full max-w-[607px] shadow-[0px_0px_0px_8px_rgba(255,255,255,0.25),0px_990px_277px_0px_rgba(0,0,0,0),0px_634px_253px_0px_rgba(0,0,0,0.01),0px_356px_214px_0px_rgba(0,0,0,0.05),0px_158px_158px_0px_rgba(0,0,0,0.09),0px_40px_87px_0px_rgba(0,0,0,0.1)]">
        <div className="content-stretch flex flex-col items-center justify-end overflow-clip relative size-full">
          <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[45px] relative shrink-0 w-full">
            <div className="basis-0 content-stretch flex flex-col gap-10 grow items-center justify-start min-h-px min-w-px relative shrink-0">
              {/* Logo */}
              <div className="flex justify-center items-center">
                <Image
                  src="/guestpost-link.webp"
                  alt="PR Reports"
                  width={223}
                  height={45}
                  priority={true}
                />
              </div>

              {/* Title and Description */}
              <div className="content-stretch flex flex-col gap-[25px] items-center justify-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-2.5 items-center justify-start leading-[0] not-italic relative shrink-0 text-center w-full">
                  <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0 text-[24px] text-slate-800 w-full">
                    <p className="leading-[24.2px]">Forgot Password</p>
                  </div>
                  <div className="font-['Inter:Medium',_sans-serif] font-medium relative shrink-0 text-[16px] text-slate-600 w-full">
                    <p className="leading-[normal]">
                      You can always reset it. Enter your email address below
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="content-stretch flex flex-col gap-8 items-start justify-start relative shrink-0 w-full">
                <form onSubmit={formik.handleSubmit} className="w-full">
                  <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-full">
                      <div className="font-semibold leading-[0] min-w-full not-italic relative shrink-0 text-[14px] text-slate-80">
                        <p className="leading-[16.9px]">Email Address</p>
                      </div>
                      <div
                        className={`bg-white h-10 relative rounded-[6px] shrink-0 w-full ${
                          formik.touched.email && formik.errors.email
                            ? "border border-rose-600"
                            : "border border-gray-200"
                        }`}
                      >
                        <div className="box-border content-stretch flex gap-2 h-10 items-center justify-start overflow-clip px-3.5 py-2.5 relative w-full">
                          <div className="basis-0 content-stretch flex gap-2 grow items-center justify-start min-h-px min-w-px relative shrink-0">
                            <div className="basis-0 content-stretch flex gap-2 grow items-end justify-start min-h-px min-w-px relative shrink-0">
                              <div className="overflow-clip relative shrink-0 size-5">
                                <EmailIcon height={20} width={20} />
                              </div>
                              <input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                required
                                disabled={formik.isSubmitting}
                                className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-slate-600 bg-transparent border-none outline-none w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {formik.touched.email && formik.errors.email && (
                        <ErrorMessage message={formik.errors.email} />
                      )}
                    </div>
                  </div>

                  <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full mt-8">
                    <button
                      type="submit"
                      disabled={
                        formik.isSubmitting || !formik.isValid || !formik.dirty
                      }
                      className="bg-indigo-600 box-border content-stretch flex gap-2.5 items-center justify-center min-h-12 overflow-clip px-5 py-3 relative rounded-[1234px] shrink-0 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formik.isSubmitting ? (
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
                          <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-nowrap">
                            <p className="leading-[normal] whitespace-pre">
                              Send OTP
                            </p>
                          </div>
                          <div className="relative shrink-0 size-5">
                            <ArrowRightIcon className="h-5 w-5 text-white" />
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[24px]"
        />
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
