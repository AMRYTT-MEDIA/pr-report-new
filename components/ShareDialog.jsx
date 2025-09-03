"use client";

import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Share2,
  Copy,
  Lock,
  X,
  LockKeyhole,
  ChevronDown,
  Link2,
  CircleCheckBig,
  CircleMinus,
  Info,
  LockKeyholeOpen,
} from "lucide-react";

import { toast } from "sonner";

// Validation schema for email input
const createEmailValidationSchema = (existingEmails) =>
  Yup.object().shape({
    newEmail: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required")
      .test("unique-email", "This email is already added", function (value) {
        return !existingEmails.includes(value);
      }),
  });

export default function ShareDialog({ isOpen, onClose, report, onShare }) {
  const [isPrivate, setIsPrivate] = useState(true);
  const [emails, setEmails] = useState([]);
  const [shareUrl, setShareUrl] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const resetFormRef = useRef(null);

  // Generate share URL when component mounts
  useEffect(() => {
    if (report) {
      const url = `${window.location.origin}/report/${
        report.grid_id || report._id
      }`;
      if (report.grid_id) {
        setShareUrl(url);
      }
    }
  }, [report]);

  // Initialize emails with shared emails from API if available
  useEffect(() => {
    if (report && report.sharedEmails && report.sharedEmails.length > 0) {
      setEmails(report.sharedEmails);
      // If shared emails exist, set to private mode
      setIsPrivate(true);
    } else {
      setEmails([]);
      setIsPrivate(false);
    }
  }, [report]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmailField = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const addEmailFromFormik = (values, { setFieldValue, resetForm }) => {
    const emailToAdd = values.newEmail.trim();
    if (emailToAdd !== "") {
      setEmails([...emails, emailToAdd]);
      resetForm();
    }
  };

  const handlePrivacyChange = (privacy) => {
    setIsPrivate(privacy === "private");
    if (privacy === "public") {
      setEmails([]);
    } else {
      if (report?.sharedEmails?.length > 0) {
        setEmails(report.sharedEmails);
        setIsPrivate(true);
      }
    }
    setIsDropdownOpen(false);
    if (resetFormRef.current) {
      resetFormRef.current();
    }
  };

  const handleShare = async () => {
    try {
      let payload;

      if (isPrivate) {
        const validEmails = emails.filter((email) => email.trim() !== "");
        if (validEmails.length === 0) {
          toast.error("Please add at least one email address");
          return;
        }

        payload = {
          is_private: true,
          sharedEmails: validEmails,
        };
      } else {
        payload = {
          is_private: false,
        };
      }

      // Call the share API
      await onShare(payload);

      // Don't reset emails if they were pre-populated from API
      if (!report?.sharedEmails || report.sharedEmails.length === 0) {
        setEmails([]);
      }

      onClose();
      window.open(`/report/${report.grid_id || report._id}`, "_blank");
      toast.success("Report shared successfully!");
    } catch (error) {
      console.error("Error sharing report:", error);
      toast.error("Failed to share report");
    }
  };

  const copyLink = async () => {
    try {
      if (report.grid_id) {
        await navigator.clipboard.writeText(shareUrl);
      }
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} onClose={onClose}>
      <DialogContent
        className="sm:max-w-1xl bg-white border border-gray-200 shadow-2xl z-[10000] max-h-[90vh] h-auto overflow-hidden flex flex-col"
        // onPointerDownOutside={(e) => e.preventDefault()}
        // onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
          pointerEvents: "auto",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-purple-70 rounded-xl p-2.5">
            <Share2 className="h-7 w-7" />
          </div>
          <Button
            variant="ghost"
            size="xl"
            onClick={onClose}
            className="h-10 w-10 p-0 hover:bg-gray-100 focus:ring-0 focus:ring-offset-0 border-0 ml-auto"
          >
            <X className="h-10 w-10" />
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-font-h2">
            Share your PR Report
          </h2>
          <p className="text-font-h2-5 text-sm font-medium">
            Invite your client or team member by adding their email address
            below.
          </p>
        </div>

        <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg gap-4 bg-gray-scale-5">
          <div className="flex items-center gap-3.5">
            <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-scale-20">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1 relative dropdown-container">
              <div
                className="flex items-center gap-1 text-sm font-medium text-font-h2 font-semibold cursor-pointer hover:opacity-80"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>
                  {isPrivate ? "Restricted" : "Anyone with the link can view"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-7 left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2">
                  <div
                    onClick={() => handlePrivacyChange("private")}
                    className="flex items-center gap-2 px-3 py-1 text-sm cursor-pointer hover:bg-gray-50 first:rounded-t-md border-b border-gray-200"
                  >
                    {/* <Lock className="h-4 w-4" /> */}
                    Restricted
                  </div>
                  <div
                    onClick={() => handlePrivacyChange("public")}
                    className="flex items-center gap-2 px-3 py-1 text-sm cursor-pointer hover:bg-gray-50 last:rounded-b-md"
                  >
                    {/* <LockKeyholeOpen className="h-4 w-4" /> */}
                    Anyone with the link
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 text-font-h2 opacity-50 break-all truncate w-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[340px]">
                {shareUrl || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-md py-1 px-2 border border-border-gray">
            {isPrivate ? (
              <>
                <LockKeyhole className="h-5 w-4 text-gray-secondary" />
                <p className="text-xs font-medium text-gray-secondary mt-0.5">
                  Private
                </p>
              </>
            ) : (
              <>
                <LockKeyholeOpen className="h-5 w-4 text-gray-secondary" />
                <p className="text-xs font-medium text-gray-secondary mt-0.5">
                  Public
                </p>
              </>
            )}
          </div>
        </div>

        {/* People With Access Section - Only show for private */}
        <div className="">
          <div className="flex flex-col gap-1">
            <Label className="text-base font-medium text-font-h2 font-semibold">
              Authorized Email Addresses
            </Label>
            <p className="text-sm text-font-h2 opacity-50 font-medium">
              Only emails from approved domains are allowed.
            </p>
            {report?.sharedEmails &&
              report.sharedEmails.length > 0 &&
              isPrivate && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    📧 {report.sharedEmails.length} email(s) already shared with
                    this report
                  </p>
                </div>
              )}
          </div>
        </div>

        <Formik
          initialValues={{ newEmail: "" }}
          validationSchema={createEmailValidationSchema(emails)}
          onSubmit={addEmailFromFormik}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            resetForm,
          }) => {
            // Store resetForm function in ref
            resetFormRef.current = resetForm;

            return (
              <Form onSubmit={handleSubmit}>
                <div>
                  <Field name="newEmail">
                    {({ field, meta }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                        className={`flex-1 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none ${
                          meta.touched && meta.error
                            ? "border-danger-60 focus:border-danger-60"
                            : "border-gray-300 focus:border-gray-300"
                        }`}
                        disabled={!isPrivate}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubmit();
                          }
                        }}
                      />
                    )}
                  </Field>
                  {errors.newEmail && touched.newEmail && (
                    <div className="text-danger-60 text-xs font-medium mt-2 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> {errors.newEmail}
                    </div>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>

        {emails.length > 0 && isPrivate && (
          <div className="flex flex-col gap-3.5">
            <Label className="text-sm font-medium">People With Access</Label>
            <div className="flex flex-col gap-2.5 max-h-[90px] overflow-y-auto scrollbar-custom">
              {emails.map((email, index) => (
                <div key={index} className="relative">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="flex-1 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:outline-none border-gray-300 focus:border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmailField(index)}
                    className="h-8 w-8 p-0 text-danger-60 hover:text-danger-70 absolute top-1.5 right-2 hover:bg-white"
                  >
                    <CircleMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-2.5 items-center justify-end">
          <Button
            variant="default"
            onClick={copyLink}
            className="gap-1.5 px-4 py-2.5 bg-primary-10 hover:bg-primary-20 text-primary-50 hover:text-primary-60 rounded-3xl font-semibold"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Button
            variant="default"
            onClick={handleShare}
            className="gap-1.5 px-4 py-2.5 bg-primary-50 hover:bg-primary-60 text-white rounded-3xl font-semibold"
          >
            <CircleCheckBig className="h-4 w-4" />
            Grant Access
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
