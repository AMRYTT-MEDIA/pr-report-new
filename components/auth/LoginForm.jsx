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
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import {
  EmailIcon,
  LockIcon,
  EyeCloseIcon,
  EyeOpenIcon,
  ArrowRightIcon,
} from "@/components/icon";

const LoginForm = () => {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isIntentionalLogin, setIsIntentionalLogin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isIntentionalLogin) {
        // Only show success toast and redirect if this was an intentional login
        toast.success("Login successful!");
      }
      // Redirect to the intended page or default to pr-reports
      const next = searchParams.get("next") || "/pr-reports";
      router.replace(next);
    }
  }, [user, router, searchParams, isIntentionalLogin]);

  // Reset intentional login flag when user changes or component unmounts
  useEffect(() => {
    if (!user) {
      setIsIntentionalLogin(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    // if (!isVerified) return;
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) return;

    setLoading(true);
    setIsIntentionalLogin(true); // Mark this as an intentional login attempt

    try {
      const result = await login(email, password);
      if (result.success) {
        // Keep loading true until navigation happens
      } else {
        setIsIntentionalLogin(false); // Reset flag on failure
        setLoading(false); // Re-enable button on failure
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      setIsIntentionalLogin(false); // Reset flag on error
      setLoading(false); // Re-enable button on error
      toast.error("An unexpected error occurred");
    }
  };

  // Show loading state if auth is loading or user is already logged in
  if (authLoading || (user && !isIntentionalLogin)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loading
            size="lg"
            color="primary"
            showText={true}
            text="Redirecting..."
          />
        </div>
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
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center pt-[10px] text-[#475569] text-base font-medium card-description">
            Let's sign in to your account and get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-10">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeCloseIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeOpenIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forget-password"
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
                loading ||
                // !isVerified ||
                email.length === 0 ||
                password.length === 0
              }
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading
                    size="sm"
                    color="white"
                    showText={true}
                    text="Signing in..."
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
  );
};

export default LoginForm;
