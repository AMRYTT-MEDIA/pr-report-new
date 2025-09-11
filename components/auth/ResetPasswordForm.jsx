"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
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
import {
  LockIcon,
  EyeCloseIcon,
  EyeOpenIcon,
  LeftArrow,
} from "@/components/icon";
import { useFormik } from "formik";
import * as Yup from "yup";
import ErrorMessage from "@/components/ui/error-message";
import {
  ArrowRightIcon,
  Eye,
  EyeClosed,
  LockKeyhole,
  LogOut,
} from "lucide-react";

const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get token from URL params
  const token = searchParams?.get("token");

  useEffect(() => {
    if (user) {
      router.push("/pr-reports");
    }
  }, [user, router]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!token) {
        toast.error("Invalid reset token");
        return;
      }

      setLoading(true);
      try {
        // Here you would implement the actual password reset API call
        // For now, we'll simulate the process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("Password reset successfully!");
        setPasswordReset(true);
      } catch (error) {
        toast.error("Failed to reset password. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleBackToLogin = () => {
    router.push("/login");
  };

  if (passwordReset) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center relative"
        style={{
          background:
            "radial-gradient(40.82% 42.04% at 78.69% 74.73%, #EBECFF 0%, #F8FAFC 100%)",
        }}
      >
        <div className="w-full max-w-md px-5">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-login-card">
            <CardContent className="p-8">
              <div className="flex flex-col gap-6 items-center text-center">
                {/* Success Icon */}
                <div className="bg-center bg-contain bg-no-repeat h-[45px] shrink-0 w-[223px]">
                  <Image
                    src="/guestpost-link.webp"
                    alt="PR Reports"
                    width={223}
                    height={45}
                    priority={true}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Success Message */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-2xl font-bold text-font-h2">
                    Password Reset Successfully!
                  </h2>
                  <p className="text-gray-60 text-base">
                    Your password has been reset successfully. You can now log
                    in with your new password.
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-primary-50 hover:bg-primary-60 text-white font-semibold py-3 px-6 rounded-full transition-colors"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-dvh flex items-center justify-center relative">
      {/* Desktop Design */}
      <div className="hidden md:block bg-white relative rounded-[24px] w-[607px] max-w-full mx-4">
        <div className="flex flex-col items-center justify-end overflow-clip relative">
          <div className="box-border flex gap-2.5 items-center justify-center p-[45px] relative w-full">
            <div className="basis-0 flex flex-col gap-10 grow items-center justify-start min-h-px min-w-px relative w-full">
              {/* Logo */}
              <div className="bg-center bg-contain bg-no-repeat h-[45px] w-[223px]">
                <Image
                  src="/guestpost-link.webp"
                  alt="PR Report Logo"
                  width={223}
                  height={45}
                  priority={true}
                  className="object-contain"
                />
              </div>

              {/* Title Section */}
              <div className="flex flex-col gap-[25px] items-center justify-start relative w-full">
                <div className="flex flex-col gap-2.5 items-center justify-start leading-[0] not-italic relative text-center w-full">
                  <div className="font-['Inter',_sans-serif] font-semibold relative text-[24px] text-slate-800 w-full">
                    <p className="leading-[24.2px]">Reset Password</p>
                  </div>
                  <div className="font-['Inter',_sans-serif] font-medium relative text-[16px] text-slate-600 w-full">
                    <p className="leading-[normal]">
                      Please enter new password and submit to set new password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="flex flex-col gap-8 items-start justify-start relative w-full">
                <form
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col gap-6 items-start justify-start w-full"
                >
                  {/* New Password Field */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="font-['Inter',_sans-serif] font-semibold leading-[0] not-italic text-[14px] text-slate-800 w-full">
                      <p className="leading-[16.9px]">New Password</p>
                    </div>
                    <div className="bg-white h-10 rounded-[6px] w-full border border-slate-200">
                      <div className="box-border flex gap-2 h-10 items-center justify-start overflow-clip px-3.5 py-2.5 relative w-full">
                        <div className="basis-0 flex gap-2 grow items-center justify-start min-h-px min-w-px relative">
                          <div className="basis-0 flex gap-2 grow items-end justify-start min-h-px min-w-px relative">
                            <div className="flex items-center justify-center relative">
                              <LockKeyhole
                                width={20}
                                height={20}
                                className="text-gray-secondary"
                              />
                            </div>
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="*****************"
                              value={formik.values.password}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="basis-0 flex flex-col font-['Inter',_sans-serif] font-normal grow justify-end leading-[0] min-h-px min-w-px not-italic relative text-[16px] text-slate-600 bg-transparent border-none outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="overflow-clip relative w-5 h-5"
                          >
                            {showPassword ? (
                              <EyeClosed className="h-5 w-5 text-gray-scale-100" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-scale-100" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="mt-1">
                        <ErrorMessage message={formik.errors.password} />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="font-['Inter',_sans-serif] font-semibold leading-[0] not-italic text-[14px] text-slate-800 w-full">
                      <p className="leading-[16.9px]">Confirm Password</p>
                    </div>
                    <div className="bg-white h-10 rounded-[6px] w-full border border-slate-200">
                      <div className="box-border flex gap-2 h-10 items-center justify-start overflow-clip px-3.5 py-2.5 relative w-full">
                        <div className="basis-0 flex gap-2 grow items-center justify-start min-h-px min-w-px relative">
                          <div className="basis-0 flex gap-2 grow items-end justify-start min-h-px min-w-px relative">
                            <div className="flex items-center justify-center relative">
                              <LockKeyhole
                                width={20}
                                height={20}
                                className="text-gray-secondary"
                              />
                            </div>
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="*****************"
                              value={formik.values.confirmPassword}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="basis-0 flex flex-col font-['Inter',_sans-serif] font-normal grow justify-end leading-[0] min-h-px min-w-px not-italic relative text-[16px] text-slate-600 bg-transparent border-none outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="overflow-clip relative w-5 h-5"
                          >
                            {showConfirmPassword ? (
                              <EyeClosed className="h-5 w-5 text-gray-scale-100" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-scale-100" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <div className="mt-1">
                          <ErrorMessage
                            message={formik.errors.confirmPassword}
                          />
                        </div>
                      )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col gap-3 items-start justify-start relative w-full">
                    <Button
                      type="submit"
                      className="w-full rounded-[1234px] bg-primary-60 hover:bg-primary-70 text-white transition-colors border border-primary-40 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || !formik.isValid || !formik.dirty}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loading
                            size="sm"
                            color="white"
                            showText={true}
                            text="Resetting password..."
                            textPosition="start"
                          />
                        </div>
                      ) : (
                        <>
                          Submit
                          <LogOut className="h-5 w-5 text-white" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_0px_0px_8px_rgba(255,255,255,0.25),0px_990px_277px_0px_rgba(0,0,0,0),0px_634px_253px_0px_rgba(0,0,0,0.01),0px_356px_214px_0px_rgba(0,0,0,0.05),0px_158px_158px_0px_rgba(0,0,0,0.09),0px_40px_87px_0px_rgba(0,0,0,0.1)]"
        />
      </div>

      {/* Mobile Design */}
      <div className="md:hidden basis-0 bg-[rgba(255,255,255,0.99)] grow h-[777px] min-h-px min-w-px relative shrink-0">
        <div className="flex flex-col h-[777px] items-center justify-center overflow-clip relative w-full">
          <div className="box-border flex gap-2.5 items-center justify-center px-5 py-[45px] relative w-full">
            <div className="basis-0 flex flex-col gap-10 grow items-center justify-start min-h-px min-w-px relative w-full">
              {/* Logo */}
              <div className="bg-center bg-contain bg-no-repeat h-[45px] w-[223px]">
                <Image
                  src="/guestpost-link.webp"
                  alt="PR Report Logo"
                  width={223}
                  height={45}
                  priority={true}
                  className="object-contain"
                />
              </div>

              {/* Title Section */}
              <div className="flex flex-col gap-[25px] items-center justify-start relative w-full">
                <div className="flex flex-col gap-2.5 items-center justify-start leading-[0] not-italic relative text-center w-full">
                  <div className="font-['Inter',_sans-serif] font-semibold relative text-[24px] text-slate-800 w-full">
                    <p className="leading-[24.2px]">Reset Password</p>
                  </div>
                  <div className="font-['Inter',_sans-serif] font-medium relative text-[16px] text-slate-600 w-full">
                    <p className="leading-[normal]">
                      Please enter new password and submit to set new password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="flex flex-col gap-8 items-start justify-start relative w-full">
                <form
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col gap-6 items-start justify-start w-full"
                >
                  {/* New Password Field */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="font-['Inter',_sans-serif] font-semibold leading-[0] not-italic text-[14px] text-slate-800 w-full">
                      <p className="leading-[16.9px]">New Password</p>
                    </div>
                    <div className="bg-white h-10 rounded-[6px] w-full border border-slate-200">
                      <div className="box-border flex gap-2 h-10 items-center justify-start overflow-clip px-3.5 py-2.5 relative w-full">
                        <div className="basis-0 flex gap-2 grow items-center justify-start min-h-px min-w-px relative">
                          <div className="basis-0 flex gap-2 grow items-end justify-start min-h-px min-w-px relative">
                            <div className="flex items-center justify-center relative">
                              <LockKeyhole
                                width={20}
                                height={20}
                                className="text-gray-secondary"
                              />
                            </div>
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="*****************"
                              value={formik.values.password}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="basis-0 flex flex-col font-['Inter',_sans-serif] font-normal grow justify-end leading-[0] min-h-px min-w-px not-italic relative text-[16px] text-slate-600 bg-transparent border-none outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="overflow-clip relative w-5 h-5"
                          >
                            {showPassword ? (
                              <EyeClosed className="h-5 w-5 text-gray-scale-100" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-scale-100" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="mt-1">
                        <ErrorMessage message={formik.errors.password} />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="font-['Inter',_sans-serif] font-semibold leading-[0] not-italic text-[14px] text-slate-800 w-full">
                      <p className="leading-[16.9px]">Confirm Password</p>
                    </div>
                    <div className="bg-white h-10 rounded-[6px] w-full border border-slate-200">
                      <div className="box-border flex gap-2 h-10 items-center justify-start overflow-clip px-3.5 py-2.5 relative w-full">
                        <div className="basis-0 flex gap-2 grow items-center justify-start min-h-px min-w-px relative">
                          <div className="basis-0 flex gap-2 grow items-end justify-start min-h-px min-w-px relative">
                            <div className="flex items-center justify-center relative">
                              <LockKeyhole
                                width={20}
                                height={20}
                                className="text-gray-secondary"
                              />
                            </div>
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="*****************"
                              value={formik.values.confirmPassword}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="basis-0 flex flex-col font-['Inter',_sans-serif] font-normal grow justify-end leading-[0] min-h-px min-w-px not-italic relative text-[16px] text-slate-600 bg-transparent border-none outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="overflow-clip relative w-5 h-5"
                          >
                            {showConfirmPassword ? (
                              <EyeClosed className="h-5 w-5 text-gray-scale-100" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-scale-100" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <div className="mt-1">
                          <ErrorMessage
                            message={formik.errors.confirmPassword}
                          />
                        </div>
                      )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col gap-3 items-start justify-start relative w-full">
                    <Button
                      type="submit"
                      className="w-full rounded-[1234px] bg-primary-60 hover:bg-primary-70 text-white transition-colors border border-primary-40 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || !formik.isValid || !formik.dirty}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loading
                            size="sm"
                            color="white"
                            showText={true}
                            text="Resetting password..."
                            textPosition="start"
                          />
                        </div>
                      ) : (
                        <>
                          Submit
                          <LogOut className="h-5 w-5 text-white" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-slate-200 border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
};

// Wrapper component to handle Suspense
const ResetPasswordFormWithSuspense = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordFormWithSuspense;
