"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getDefaultLandingPage } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import ErrorMessage from "@/components/ui/error-message";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import { EmailIcon, LockIcon, ArrowRightIcon } from "@/components/icon";
import { useFormik } from "formik";
import { isEmail } from "validator";
import * as Yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { globalConstants } from "@/lib/constants/globalConstants";
import { Eye, EyeClosed } from "lucide-react";

const LoginForm = ({ searchParams }) => {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY;
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user, loading: authLoading, initialized } = useAuth();
  const router = useRouter();

  // Handle redirect for already logged in users
  useEffect(() => {
    if (initialized && user) {
      setIsRedirecting(true);
      const next = searchParams.next || getDefaultLandingPage(user);
      router.push(next);
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

  // Backend API error mapping (kept for future use)
  // const getApiErrorMessage = (error) => {
  //   if (error.response?.status === 401) {
  //     return "User not found. Please check your email and try again.";
  //   } else if (error.response?.status === 404) {
  //     return "Please try again.";
  //   } else if (error.response?.status === 403) {
  //     return "Access denied. Please contact support.";
  //   } else if (error.response?.status >= 500) {
  //     return "Server error. Please try again later.";
  //   } else if (error.response?.data?.message) {
  //     return error.response.data.message;
  //   } else {
  //     return error.message || globalConstants?.SomethingWentWrong;
  //   }
  // };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .test("is-valid-email", "Please enter a valid email address. (e.g., username@example.com)", (value) => {
          if (!value) return false;
          return isEmail(value.trim());
        })
        .required("Email is required"),
      password: Yup.string().required("Password is required").min(8, "Password should be a minimum of 8 characters"),
    }),
    onSubmit: async (values) => {
      if (!isVerified) return;
      setLoading(true);

      try {
        // Step 1: Firebase sign-in
        const result = await signInWithEmailAndPassword(auth, values.email, values.password);
        if (result.user) {
          toast.success("Sign in successful!");

          // const next = searchParams.next || "/pr-reports-list";
          // router.replace(next);
          // // Step 2: Check if user exists in backend database
          // try {
          //   const userData = await getuserdatabyfirebaseid(result.user.uid);
          //   if (userData) {
          //     // User exists in backend - set user data in auth context
          //     setUser(userData);

          //     // Redirect to the intended page or default to pr-reports
          //   } else {
          //     logout();
          //     // User doesn't exist in backend
          //     setLoading(false);
          //     toast.error(
          //       "User not found. Please check your email and try again."
          //     );
          //   }
          // } catch (apiError) {
          //   // Backend API error
          //   setLoading(false);
          //   logout();
          //   const apiErrorMessage = getApiErrorMessage(apiError);
          //   toast.error(apiErrorMessage);
          // }
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
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[607px] rounded-3xl border border-slate-200 bg-white/99 shadow-login-card p-[45px]">
        <CardHeader className="text-center p-0">
          <div className="flex justify-center items-center">
            <Image src="/guestpost-link.webp" alt="PR Reports" width={223} height={45} priority={true} />
          </div>
          <CardTitle className="text-center text-[#1E293B] font-inter text-2xl font-semibold leading-[24.2px] pt-10 card-title">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center pt-[10px] text-[#475569] text-base font-medium card-description">
            Let's sign in to your account and get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-10">
          <form onSubmit={formik.handleSubmit} className="space-y-4" autoComplete="off">
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
                    formik.touched.email && formik.errors.email ? "border-red-500" : ""
                  }`}
                />
              </div>
              {formik.touched.email && formik.errors.email && <ErrorMessage message={formik.errors.email} />}
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
                    formik.touched.password && formik.errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeClosed className="h-5 w-5 text-slate-900" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-900" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <ErrorMessage message={formik.errors.password} />}
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm font-medium text-indigo-500">
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
              className="w-full rounded-[1234px] bg-indigo-600 hover:bg-indigo-700 text-white transition-colors border border-indigo-400 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isVerified || !formik.isValid || !formik.dirty}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading size="sm" color="white" showText={true} text="Signing in..." textPosition="start" />
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
  );
};

export default LoginForm;
