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
import { EmailIcon, ArrowRightIcon, LeftArrow } from "@/components/icon";
import { useFormik } from "formik";
import { isEmail } from "validator";
import * as Yup from "yup";
import ErrorMessage from "@/components/ui/error-message";
import { MoveLeft } from "lucide-react";

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
    setEmailSent(false);
    router.push("/login");
  };

  const EMAIL_PROVIDERS = [
    {
      name: "Gmail",
      url: "https://mail.google.com/mail",
      icon: "/email.svg",
      alt: "gmail",
    },
    {
      name: "Outlook",
      url: "https://outlook.live.com/mail",
      icon: "/outlook.svg",
      alt: "outlook",
    },
  ];
  if (emailSent) {
    return (
      <div className="bg-slate-50 content-stretch flex items-center justify-center relative size-full min-h-screen">
        <div className="bg-white relative rounded-[24px] shrink-0 w-[607px] max-w-[607px]">
          <div className="content-stretch flex flex-col items-center justify-end overflow-clip relative w-[607px]">
            <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[45px] relative shrink-0 w-full">
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
                    <div className=" font-semibold relative shrink-0 text-[24px] text-slate-800 w-full">
                      <p className="leading-[24.2px]">
                        Verify Your Email Address
                      </p>
                    </div>
                    <div className="font-['Inter:Medium',_sans-serif] font-medium relative shrink-0 text-[16px] text-slate-600 w-full">
                      <p className="leading-[normal]">
                        <span>We've sent mail to </span>
                        <span className="font-['Inter:Medium',_sans-serif] font-medium not-italic text-indigo-500">
                          {formik.values.email || "your email"}
                        </span>
                        <span> with a link to activate your account.</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Provider Buttons */}
                <div className="content-stretch flex flex-col gap-8 items-start justify-start relative shrink-0 w-full">
                  <div className="content-stretch flex gap-5 items-start justify-start relative shrink-0 w-full">
                    {EMAIL_PROVIDERS.map((provider) => (
                      <div
                        key={provider.name}
                        className="basis-0 grow h-[38px] min-h-px min-w-px relative shrink-0"
                      >
                        <Link
                          href={provider.url}
                          target="_blank"
                          className="block h-full"
                        >
                          <div className="absolute bg-white bottom-0 left-0 right-0 rounded-[6px] top-0">
                            <div className="overflow-clip relative size-full">
                              <div className="absolute content-stretch flex gap-[7px] items-center justify-center top-1/2 translate-x-[-50%] translate-y-[-50%] left-1/2">
                                <div className="overflow-clip relative shrink-0 size-6">
                                  <Image
                                    src={provider.icon}
                                    alt={provider.alt}
                                    width={24}
                                    height={24}
                                  />
                                </div>
                                <div className="flex flex-col  font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-indigo-500 text-nowrap">
                                  <p className="leading-[16.9px] whitespace-pre">
                                    {provider.name === "Gmail"
                                      ? "Open Gmail"
                                      : provider.name}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div
                              aria-hidden="true"
                              className="absolute border border-[#dbe2ed] border-solid inset-0 pointer-events-none rounded-[6px]"
                            />
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Divider Line */}
                  <div className="h-0 relative shrink-0 w-full">
                    <div className="absolute  border-b-2 border-dashed border-gray-200 left-0 right-0 top-[-2px]">
                      <div className="w-full bg-slate-200"></div>
                    </div>
                  </div>

                  {/* Spam Folder Message */}
                  <div className=" font-medium leading-[0] not-italic relative shrink-0 text-[#263145] text-sm w-full">
                    <p className="leading-[normal] ">
                      Didn't Receive an Email? Check Your Spam Folder!
                    </p>
                  </div>

                  {/* Resend Button */}
                  <div className="content-stretch flex  gap-3 items-start justify-start relative shrink-0 w-full">
                    <Button
                      variant="outline"
                      className="w-full text-primary-50 hover:text-primary-50 border-primary-50 hover:border-primary-50 text-base box-border content-stretch flex gap-2.5 items-center justify-center min-h-12 overflow-clip px-5 py-3 relative rounded-[1234px] hover:bg-primary-5"
                      onClick={() => {
                        handleBackToLogin();
                      }}
                    >
                      <MoveLeft
                        width={20}
                        height={20}
                        className="text-primary-50"
                      />
                      Back to Login
                    </Button>
                    <Button
                      onClick={() => {
                        setEmailSent(false);
                        formik.handleSubmit();
                      }}
                      className="bg-indigo-600 text-base box-border w-full flex gap-2.5 items-center justify-center min-h-12 overflow-clip px-5 py-3 relative rounded-[1234px]  hover:bg-indigo-700 transition-colors"
                    >
                      {formik.isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loading
                            size="sm"
                            color="white"
                            showText={true}
                            text="Resending email..."
                            textPosition="start"
                          />
                        </div>
                      ) : (
                        <>
                          Resend Email
                          <ArrowRightIcon className="h-5 w-5 text-white" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_0px_0px_8px_rgba(255,255,255,0.25),0px_990px_277px_0px_rgba(0,0,0,0),0px_634px_253px_0px_rgba(0,0,0,0.01),0px_356px_214px_0px_rgba(0,0,0,0.05),0px_158px_158px_0px_rgba(0,0,0,0.09),0px_40px_87px_0px_rgba(0,0,0,0.1)]"
          />
        </div>
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
                  <div className=" font-semibold relative shrink-0 text-[24px] text-slate-800 w-full">
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
                <form
                  onSubmit={formik.handleSubmit}
                  className="w-full"
                  autoComplete="off"
                >
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
                                autoComplete="off"
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
                            textPosition="start"
                          />
                        </div>
                      ) : (
                        <>
                          <div className=" font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-nowrap">
                            <p className="leading-[normal] whitespace-pre">
                              Send Email
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
