"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Share2, Link, Copy, Check, Lock, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ShareDialogView({ isOpen, onClose, report, onShare }) {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(true);
  const [emails, setEmails] = useState([""]);
  const [shareUrl, setShareUrl] = useState("");

  // Generate share URL when component mounts
  useEffect(() => {
    if (report) {
      const url = `${window.location.origin}/report/${
        report.grid_id || report._id || report.id
      }`;
      setShareUrl(url);
    }
  }, [report]);

  // Initialize emails with shared emails from API if available
  useEffect(() => {
    if (report && report.sharedEmails && report.sharedEmails.length > 0) {
      setEmails(report.sharedEmails);
      // If shared emails exist, set to private mode
      setIsPrivate(true);
    } else {
      setEmails([""]);
      setIsPrivate(true);
    }
  }, [report]);

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const clearAllEmails = () => {
    setEmails([""]);
  };

  const handleShare = async () => {
    try {
      let payload;

      if (isPrivate) {
        // Filter out empty emails and validate
        const validEmails = emails.filter((email) => email.trim() !== "");
        if (validEmails.length === 0) {
          toast.error("Please add at least one email address");
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = validEmails.filter(
          (email) => !emailRegex.test(email)
        );
        if (invalidEmails.length > 0) {
          toast.error("Please enter valid email addresses");
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
        setEmails([""]);
      }

      onClose();
      window.open(
        `/report/${report.grid_id || report._id || report.id}`,
        "_blank"
      );
      toast.success("Report shared successfully!");
    } catch (error) {
      console.error("Error sharing report:", error);
      toast.error("Failed to share report");
    }
  };

  const copyLink = async () => {
    try {
      if (report.grid_id || report._id || report.id) {
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
        className="sm:max-w-1xl bg-white border border-slate-200 shadow-2xl z-[10000] max-h-[90vh] h-auto overflow-hidden flex flex-col"
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
        <DialogHeader className="p-0 pb-0 flex-shrink-0 bg-white border-b border-slate-900">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-purple-600" />
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Share your PR Report
                </DialogTitle>
                {report?.sharedEmails && report.sharedEmails.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Editing existing shared emails
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-slate-900 focus:ring-0 focus:ring-offset-0 border-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-6 px-0 py-2 overflow-y-auto min-h-0">
          {/* Share Link Section */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700">
                  Anyone with the Email can view
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className="h-6 px-2 text-xs"
                >
                  {isPrivate ? "Private" : "Public"}
                  <Lock className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="text-sm text-slate-500 break-all">{shareUrl}</div>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant={isPrivate ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPrivate(true)}
              className="flex-1"
            >
              <Lock className="h-4 w-4 mr-2" />
              Private
            </Button>
            <Button
              variant={!isPrivate ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPrivate(false)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Public
            </Button>
          </div>

          {/* People With Access Section - Only show for private */}
          {isPrivate && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">
                  People With Access
                </Label>
                <p className="text-xs text-slate-500">
                  Email addresses at these domains are allowed.
                </p>
                {report?.sharedEmails && report.sharedEmails.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-700">
                      📧 {report.sharedEmails.length} email(s) already shared
                      with this report
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="flex-1 focus:ring-0 focus:ring-offset-0 focus:outline-none border-slate-300 focus:border-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    />
                    {emails.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmailField(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEmailField}
                  className="w-full"
                >
                  + Add another email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllEmails}
                  className="w-full text-red-600 hover:text-red-700"
                >
                  Clear All Emails
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-0 pt-4 flex-shrink-0 bg-white border-t border-slate-900">
          <Button variant="outline" onClick={copyLink} className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
