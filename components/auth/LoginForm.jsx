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
import LoadingSpinner from "@/components/LoadingSpinner";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isIntentionalLogin, setIsIntentionalLogin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user && isIntentionalLogin) {
      // Only show success toast and redirect if this was an intentional login
      toast.success("Login successful!");
      const next = searchParams.get("next") || "/pr-reports";
      router.replace(next);
    } else if (user && !isIntentionalLogin) {
      // User is already logged in from page refresh, just redirect without toast
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
    if (!isVerified) return;
    e.preventDefault();
    setLoading(true);
    setIsIntentionalLogin(true); // Mark this as an intentional login attempt

    try {
      const result = await login(email, password);
      if (result.success) {
        // The useEffect will handle the success toast and redirect
        // Don't show toast here to avoid duplicate messages
      } else {
        setIsIntentionalLogin(false); // Reset flag on failure
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      setIsIntentionalLogin(false); // Reset flag on error
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <div className="flex justify-end">
                <Link
                  href="/forget-password"
                  className="text-sm font-medium text-brand-scale-60"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="pt-6 flex justify-center">
                <ReCAPTCHA
                  sitekey="6LfpshMrAAAAAAReSdqQ_dw45mW3VszBqhCHfjo1"
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
              </div>
            </div>
            <Button
              type="submit"
              className="w-full border-radius-lg"
              disabled={loading || !isVerified}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Only authorized users can access this system.</p>
              <p>Contact your administrator for access.</p>
            </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
