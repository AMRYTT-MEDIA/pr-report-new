"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
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
import ErrorMessage from "@/components/ui/error-message";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import {
  EmailIcon,
  LockIcon,
  EyeCloseIcon,
  ArrowRightIcon,
} from "@/components/icon";
import { useFormik } from "formik";
import { isEmail } from "validator";
import * as Yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { globalConstants } from "@/lib/constants/globalConstants";
import { getuserdatabyfirebaseid } from "@/services/user";
import { Eye, EyeClosed } from "lucide-react";

const LoginForm = ({ searchParams }) => {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY;
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    user,
    setUser,
    logout,
    loading: authLoading,
    initialized,
  } = useAuth();
  const router = useRouter();

  // Handle redirect for already logged in users
  useEffect(() => {
    if (initialized && user) {
      setIsRedirecting(true);
      const next = searchParams.next || "/pr-reports-list";
      setTimeout(() => {
        router.push(next);
      }, 100);
    }
  }, [user, initialized, router, searchParams]);

  // Firebase error mapping
  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case "auth/user-not-found":
        return "No user found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials.";
      case "auth/email-not-verified":
        return "Please verify your email address before signing in.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method.";
      default:
        return error.message || globalConstants?.SomethingWentWrong;
    }
  };

  // Backend API error mapping
  const getApiErrorMessage = (error) => {
    if (error.response?.status === 401) {
      return (
        error.response?.data?.message ||
        "User not found. Please check your email and try again."
      );
    } else if (error.response?.status === 404) {
      return "Please try again.";
    } else if (error.response?.status === 403) {
      return "Access denied. Please contact support.";
    } else if (error.response?.status >= 500) {
      return "Server error. Please try again later.";
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else {
      return error.message || globalConstants?.SomethingWentWrong;
    }
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .test(
          "is-valid-email",
          "Please enter a valid email address. (e.g., username@example.com)",
          function (value) {
            if (!value) return false;
            return isEmail(value.trim());
          }
        )
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password should be a minimum of 8 characters"),
    }),
    onSubmit: async (values) => {
      if (!isVerified) return;
      setLoading(true);

      try {
        // Step 1: Firebase sign-in
        const result = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        if (result.user) {
          // Step 2: Check if user exists in backend database
          try {
            const userData = await getuserdatabyfirebaseid(result.user.uid);
            if (userData) {
              // User exists in backend - set user data in auth context
              setUser(userData);
              toast.success("Sign in successful!");

              // Redirect to the intended page or default to pr-reports
              const next = searchParams.next || "/pr-reports-list";
              router.replace(next);
            } else {
              logout();
              // User doesn't exist in backend
              setLoading(false);
              toast.error(
                "User not found. Please check your email and try again."
              );
            }
          } catch (apiError) {
            // Backend API error
            setLoading(false);
            logout();
            const apiErrorMessage = getApiErrorMessage(apiError);
            toast.error(apiErrorMessage);
          }
        }
      } catch (error) {
        setLoading(false);
        const errorMessage = getFirebaseErrorMessage(error);
        toast.error(errorMessage);
      }
    },
  });

  // Handle input changes with trimming
  const handleEmailChange = (e) => {
    const trimmedValue = e.target.value.replace(/\s+/g, "").toLowerCase();
    formik.setFieldValue("email", trimmedValue);
  };

  const handlePasswordChange = (e) => {
    const trimmedValue = e.target.value.replace(/\s+/g, "");
    formik.setFieldValue("password", trimmedValue);
  };

  // Remove the old handleSubmit function as it's now handled by Formik

  // Loading state is handled by parent component (login page)
  // This component only renders when user is not logged in and auth is initialized

  // Show loading while checking auth state or redirecting
  if (!initialized || authLoading || isRedirecting) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loading
            size="lg"
            color="purple"
            showText={true}
            textColor="black"
            textPosition="bottom"
            text={isRedirecting ? "Redirecting..." : "Loading..."}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 content-stretch flex items-center justify-center relative size-full  min-h-dvh">
      {/* Mobile Design */}
      <div className="md:hidden basis-0 bg-[rgba(255,255,255,0.99)] grow h-[777px] min-h-px min-w-px relative shrink-0">
        <div className="content-stretch flex flex-col h-[777px] items-center justify-center overflow-clip relative w-full">
          <div className="basis-0 box-border content-stretch flex gap-2.5 grow items-center justify-center min-h-px min-w-px px-5 py-[45px] relative shrink-0 w-full">
            <div className="basis-0 content-stretch flex flex-col gap-10 grow items-center justify-start min-h-px min-w-px relative shrink-0">
              {/* Logo */}
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

              {/* Title Section */}
              <div className="content-stretch flex flex-col gap-[25px] items-center justify-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-2.5 items-center justify-start leading-[0] not-italic relative shrink-0 text-center w-full">
                  <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0 text-[24px] text-slate-800 w-full">
                    <p className="leading-[24.2px]">Welcome Back.</p>
                  </div>
                  <div className="font-['Inter:Medium',_sans-serif] font-medium relative shrink-0 text-[16px] text-slate-600 w-full">
                    <p className="leading-[normal]">
                      Let's sign in to your account and get started.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="content-stretch flex flex-col gap-8 items-start justify-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-6 items-start justify-start relative shrink-0 w-full">
                    {/* Email Input */}
                    <div className="content-stretch flex flex-col gap-2 items-end justify-start relative shrink-0 w-full">
                      <div className="content-stretch flex flex-col gap-2 items-end justify-start relative shrink-0 w-full">
                        <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[14px] text-slate-800 w-full">
                          <p className="leading-[16.9px]">Email Address</p>
                        </div>
                        <div className="bg-white h-10 relative rounded-[6px] shrink-0 w-full">
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
                                  name="email"
                                  value={formik.values.email}
                                  onChange={handleEmailChange}
                                  onBlur={formik.handleBlur}
                                  required
                                  disabled={loading}
                                  autoComplete="off"
                                  className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-slate-600 bg-transparent border-none outline-none w-full"
                                />
                              </div>
                            </div>
                          </div>
                          <div
                            aria-hidden="true"
                            className={`absolute border border-solid inset-0 pointer-events-none rounded-[6px] ${
                              formik.touched.email && formik.errors.email
                                ? "border-rose-600"
                                : "border-slate-300"
                            }`}
                          />
                        </div>
                        {formik.touched.email && formik.errors.email && (
                          <div className="content-stretch flex gap-[7px] items-center justify-start relative shrink-0">
                            <div className="relative shrink-0 size-[17px]">
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0C3.813 0 0 3.813 0 8.5C0 13.187 3.813 17 8.5 17C13.187 17 17 13.187 17 8.5C17 3.813 13.187 0 8.5 0ZM8.5 12.75C8.085 12.75 7.75 12.415 7.75 12C7.75 11.585 8.085 11.25 8.5 11.25C8.915 11.25 9.25 11.585 9.25 12C9.25 12.415 8.915 12.75 8.5 12.75ZM9.25 9.5C9.25 9.915 8.915 10.25 8.5 10.25C8.085 10.25 7.75 9.915 7.75 9.5V5.5C7.75 5.085 8.085 4.75 8.5 4.75C8.915 4.75 9.25 5.085 9.25 5.5V9.5Z"
                                  fill="#E11D48"
                                />
                              </svg>
                            </div>
                            <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-rose-600">
                              <p className="leading-[normal] whitespace-pre">
                                {formik.errors.email}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-full">
                      <div className="content-stretch flex flex-col gap-2 items-end justify-start relative shrink-0 w-full">
                        <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[14px] text-slate-800 w-full">
                          <p className="leading-[16.9px]">Password</p>
                        </div>
                        <div className="bg-white h-10 relative rounded-[6px] shrink-0 w-full">
                          <div className="box-border content-stretch flex gap-2 h-10 items-center justify-start overflow-clip px-3.5 py-2.5 relative w-full">
                            <div className="basis-0 content-stretch flex gap-2 grow items-center justify-start min-h-px min-w-px relative shrink-0">
                              <div className="basis-0 content-stretch flex gap-2 grow items-end justify-start min-h-px min-w-px relative shrink-0">
                                <div className="flex items-center justify-center relative shrink-0">
                                  <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                                    <LockIcon
                                      height={20}
                                      width={20}
                                      color="#667085"
                                    />
                                  </div>
                                </div>
                                <input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  name="password"
                                  value={formik.values.password}
                                  onChange={handlePasswordChange}
                                  onBlur={formik.handleBlur}
                                  required
                                  disabled={loading}
                                  autoComplete="off"
                                  className="basis-0 flex flex-col font-['Inter:Regular',_sans-serif] font-normal grow justify-end leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-slate-600 bg-transparent border-none outline-none w-full"
                                />
                              </div>
                              <button
                                type="button"
                                className="overflow-clip relative shrink-0 size-5"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeClosed className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Eye className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div
                            aria-hidden="true"
                            className={`absolute border border-solid inset-0 pointer-events-none rounded-[6px] ${
                              formik.touched.password && formik.errors.password
                                ? "border-rose-600"
                                : "border-slate-300"
                            }`}
                          />
                        </div>
                        {formik.touched.password && formik.errors.password && (
                          <div className="content-stretch flex gap-[7px] items-center justify-start relative shrink-0">
                            <div className="relative shrink-0 size-[17px]">
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.5 0C3.813 0 0 3.813 0 8.5C0 13.187 3.813 17 8.5 17C13.187 17 17 13.187 17 8.5C17 3.813 13.187 0 8.5 0ZM8.5 12.75C8.085 12.75 7.75 12.415 7.75 12C7.75 11.585 8.085 11.25 8.5 11.25C8.915 11.25 9.25 11.585 9.25 12C9.25 12.415 8.915 12.75 8.5 12.75ZM9.25 9.5C9.25 9.915 8.915 10.25 8.5 10.25C8.085 10.25 7.75 9.915 7.75 9.5V5.5C7.75 5.085 8.085 4.75 8.5 4.75C8.915 4.75 9.25 5.085 9.25 5.5V9.5Z"
                                  fill="#E11D48"
                                />
                              </svg>
                            </div>
                            <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-rose-600">
                              <p className="leading-[normal] whitespace-pre">
                                {formik.errors.password}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="content-stretch flex gap-4 items-end justify-end relative shrink-0 w-full">
                    <div className="content-stretch flex gap-2 items-center justify-center overflow-clip relative shrink-0">
                      <Link
                        href="/forgot-password"
                        className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[14px] text-indigo-600 text-nowrap"
                      >
                        <p className="leading-[16.9px] whitespace-pre">
                          Forgot Password ?
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* reCAPTCHA */}
                <div className="content-stretch flex flex-col gap-2.5 items-center justify-start relative shrink-0 w-full">
                  <div className="h-[76px] relative shrink-0 w-[302px]">
                    {recaptchaSiteKey && (
                      <ReCAPTCHA
                        sitekey={recaptchaSiteKey}
                        onChange={() => {
                          setIsVerified(true);
                        }}
                        onExpired={() => {
                          setIsVerified(false);
                        }}
                        onErrored={() => {
                          setIsVerified(false);
                        }}
                        className="mb-2"
                      />
                    )}
                  </div>
                </div>

                {/* Sign In Button */}
                <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full">
                  <button
                    type="submit"
                    disabled={loading || !formik.isValid || !formik.dirty}
                    className="bg-indigo-600 box-border content-stretch flex gap-2.5 items-center justify-center min-h-12 overflow-clip px-5 py-3 relative rounded-[1234px] shrink-0 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loading
                          size="sm"
                          color="white"
                          showText={true}
                          text="Signing in..."
                          textPosition="start"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-white">
                          <p className="leading-[normal] whitespace-pre">
                            Sign In
                          </p>
                        </div>
                        <div className="relative shrink-0 size-[16.667px]">
                          <ArrowRightIcon className="h-4 w-4 text-white" />
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-slate-200 border-solid inset-0 pointer-events-none"
        />
      </div>

      {/* Desktop Design */}
      <div className="hidden md:flex min-h-dvh bg-background items-center justify-center p-4">
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
            <CardTitle className="text-center text-[#1E293B]  text-2xl font-semibold leading-[24.2px] pt-10 card-title">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center pt-[10px] text-[#475569] text-base font-medium card-description">
              Let's sign in to your account and get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-10">
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailIcon height={14} width={17} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    name="email"
                    value={formik.values.email}
                    onChange={handleEmailChange}
                    onBlur={formik.handleBlur}
                    required
                    disabled={loading}
                    autoComplete="off"
                    className={`pl-10 text-input-field ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <ErrorMessage message={formik.errors.email} />
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon height={20} width={20} color="#667085" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    name="password"
                    value={formik.values.password}
                    onChange={handlePasswordChange}
                    onBlur={formik.handleBlur}
                    required
                    disabled={loading}
                    autoComplete="off"
                    className={`pl-10 pr-10 text-input-field ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeClosed className="h-5 w-5 text-gray-scale-100" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-scale-100" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <ErrorMessage message={formik.errors.password} />
                )}
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-brand-scale-60"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="pt-6 flex justify-center">
                  {recaptchaSiteKey && (
                    <ReCAPTCHA
                      sitekey={recaptchaSiteKey}
                      onChange={() => {
                        setIsVerified(true);
                      }}
                      onExpired={() => {
                        setIsVerified(false);
                      }}
                      onErrored={() => {
                        setIsVerified(false);
                      }}
                      className="mb-2"
                    />
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-[1234px] bg-primary-60 hover:bg-primary-70 text-white transition-colors border border-primary-40 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  loading || !isVerified || !formik.isValid || !formik.dirty
                }
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading
                      size="sm"
                      color="white"
                      showText={true}
                      text="Signing in..."
                      textPosition="start"
                    />
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="h-5 w-5 text-white" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
