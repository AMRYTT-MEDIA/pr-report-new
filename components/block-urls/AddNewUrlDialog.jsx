"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { blockUrlsService } from "@/services/blockUrls";

export default function AddNewUrlDialog({ onUrlAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    websiteName: "",
    websiteUrl: "",
    logoUrl: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.websiteName.trim() || !formData.websiteUrl.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic URL validation
    try {
      const _validUrl = new URL(formData.websiteUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      const newUrl = {
        websiteName: formData.websiteName.trim(),
        websiteUrl: formData.websiteUrl.trim(),
        logoUrl: formData.logoUrl.trim() || "/placeholder.svg",
        isBlocked: false,
      };

      await blockUrlsService.addBlockUrl(newUrl);
      toast.success("URL added successfully!");

      // Reset form
      setFormData({
        websiteName: "",
        websiteUrl: "",
        logoUrl: "",
      });

      setOpen(false);

      // Notify parent component to refresh data
      if (onUrlAdded) {
        onUrlAdded();
      }
    } catch (error) {
      console.error("Error adding URL:", error);
      toast.error("Failed to add URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      websiteName: "",
      websiteUrl: "",
      logoUrl: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New URL</DialogTitle>
          <DialogDescription>Add a new website URL to the block list. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteName">Website Name *</Label>
            <Input
              id="websiteName"
              placeholder="e.g., TechCrunch"
              value={formData.websiteName}
              onChange={(e) => handleInputChange("websiteName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL *</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="e.g., https://techcrunch.com"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="e.g., https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) => handleInputChange("logoUrl", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 text-white">
              {loading ? "Adding..." : "Add URL"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
