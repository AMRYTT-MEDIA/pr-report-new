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
import { X, Share2, Link, Copy, Check, Lock, Users } from "lucide-react";
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
        report.grid_id || report._id
      }`;
      setShareUrl(url);
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
      setEmails([""]);
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
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} onClose={onClose}>
      <DialogContent className="sm:max-w-md" isDialogClose={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5 text-purple-600" />
            <DialogTitle className="text-lg font-semibold">
              Share your PR Report
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Link Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link className="h-8 w-8 text-gray-600" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
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
                <div className="text-sm text-gray-500 mt-1 break-all">
                  {shareUrl}
                </div>
              </div>
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
                <p className="text-xs text-gray-500">
                  Email addresses at these domains are allowed.
                </p>
              </div>

              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="flex-1"
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
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
