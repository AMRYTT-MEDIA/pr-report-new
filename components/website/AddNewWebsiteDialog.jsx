import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { X, Plus, Save, CircleX, PencilLine } from "lucide-react";
import { toast } from "sonner";
import WebsiteConstants from "./constans";
import { websitesService } from "@/services/websites";

const AddNewWebsiteDialog = ({
  onWebsiteAdded,
  isOpen,
  onClose,
  editWebsite,
  onEditWebsite,
}) => {
  const [formData, setFormData] = useState({
    websiteName: "",
    websiteUrl: "",
    websiteIcon: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);

  // Reset form when dialog opens/closes or edit website changes
  useEffect(() => {
    if (isOpen) {
      if (editWebsite) {
        // Edit mode - populate form with existing data
        setFormData({
          websiteName: editWebsite.name || "",
          websiteUrl: editWebsite.domain
            ? editWebsite.domain.replace(/^https?:\/\//, "")
            : "",
          websiteIcon: null,
        });
        // Set icon preview for edit mode
        if (editWebsite.logo) {
          setIconPreview(websitesService.getLogoUrl(editWebsite.logo));
        } else {
          setIconPreview(editWebsite.icon || null);
        }
      } else {
        // Add mode - reset form
        setFormData({
          websiteName: "",
          websiteUrl: "",
          websiteIcon: null,
        });
        setIconPreview(null);
      }
      setErrors({});
    }
  }, [isOpen, editWebsite]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(WebsiteConstants.invalidFileType);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(WebsiteConstants.fileSizeError);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        websiteIcon: file,
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);

      // Clear any existing error
      if (errors.websiteIcon) {
        setErrors((prev) => ({
          ...prev,
          websiteIcon: "",
        }));
      }
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      websiteIcon: null,
    }));
    // Reset to original icon when removing uploaded file
    if (editWebsite) {
      if (editWebsite.logo) {
        setIconPreview(websitesService.getLogoUrl(editWebsite.logo));
      } else {
        setIconPreview(editWebsite.icon || null);
      }
    } else {
      setIconPreview(null);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.websiteName.trim()) {
      newErrors.websiteName = WebsiteConstants.websiteNameRequired;
    } else if (formData.websiteName.trim().length < 2) {
      newErrors.websiteName = WebsiteConstants.websiteNameMinLength;
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = WebsiteConstants.websiteUrlRequired;
    } else {
      // Enhanced URL validation
      const urlToValidate = formData.websiteUrl.startsWith("http")
        ? formData.websiteUrl
        : `https://${formData.websiteUrl}`;

      try {
        new URL(urlToValidate);
      } catch (e) {
        newErrors.websiteUrl = WebsiteConstants.invalidUrl;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare URL
      const websiteUrl = formData.websiteUrl.startsWith("http")
        ? formData.websiteUrl
        : `https://${formData.websiteUrl}`;

      const websiteData = {
        name: formData.websiteName.trim(),
        domain: websiteUrl,
        logo: formData.websiteIcon,
      };

      if (editWebsite) {
        // Edit mode - update existing website
        const response = await websitesService.updateWebsite(
          editWebsite._id || editWebsite.id,
          websiteData
        );

        const updatedWebsite = {
          ...editWebsite,
          ...(response.data || response),
          name: formData.websiteName.trim(),
          domain: websiteUrl,
        };

        onEditWebsite(updatedWebsite);
        toast.success(WebsiteConstants.websiteUpdatedSuccess);
      } else {
        // Add mode - create new website
        const response = await websitesService.createWebsite(websiteData);
        const newWebsite = response.data || response;

        onWebsiteAdded(newWebsite);
        toast.success(WebsiteConstants.websiteAddedSuccess);
      }

      handleClose();
    } catch (error) {
      console.error("Error saving website:", error);
      toast.error(
        editWebsite
          ? WebsiteConstants.updateWebsiteError
          : WebsiteConstants.addWebsiteError
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    // Clean up preview URL
    if (iconPreview && iconPreview.startsWith("blob:")) {
      URL.revokeObjectURL(iconPreview);
    }

    setFormData({
      websiteName: "",
      websiteUrl: "",
      websiteIcon: null,
    });
    setIconPreview(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-1xl bg-white boder border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
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
        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl p-5 bg-white overflow-y-auto max-h-[84vh] scrollbar-custom">
          {/* Header */}
          <div className="pb-5" style={{ borderBottom: "2px dashed #E2E8F0" }}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                {editWebsite ? (
                  <PencilLine className="w-7 h-7 text-slate-700" />
                ) : (
                  <Plus className="w-7 h-7 text-slate-700" />
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                {editWebsite
                  ? WebsiteConstants.editWebsite
                  : WebsiteConstants.addNewWebsite}
              </h2>
              <p className="text-sm font-medium text-slate-600">
                {editWebsite
                  ? WebsiteConstants.updateWebsiteDescription
                  : WebsiteConstants.addWebsiteDescription}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Website Name Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {WebsiteConstants.websiteNameLabel}{" "}
                <span className="text-red-500">
                  {WebsiteConstants.required}
                </span>
              </Label>
              <Input
                type="text"
                placeholder={WebsiteConstants.enterWebsiteName}
                value={formData.websiteName}
                onChange={(e) =>
                  handleInputChange("websiteName", e.target.value)
                }
                className={`h-10 rounded-full border-slate-200 text-slate-700 placeholder:text-slate-400 ${
                  errors.websiteName
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }`}
              />
              {errors.websiteName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.websiteName}
                </p>
              )}
            </div>

            {/* Website URL Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {WebsiteConstants.websiteUrlLabel}{" "}
                <span className="text-red-500">
                  {WebsiteConstants.required}
                </span>
              </Label>
              <div className="relative">
                <span className="text-sm font-medium text-slate-600 absolute top-[1px] left-[2px] bg-gray-scale-5 px-3 py-2.5 rounded-l-full">
                  {WebsiteConstants.httpsPrefix}{" "}
                </span>
                <Input
                  type="text"
                  placeholder={WebsiteConstants.urlPlaceholder}
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    handleInputChange("websiteUrl", e.target.value)
                  }
                  disabled={editWebsite}
                  className={`flex-1 rounded-full border-gray-scale-20 text-gray-scale-60 placeholder:text-gray-scale-40 pl-[74px] 
                    ${editWebsite ? "bg-gray-scale-5" : "bg-white"}
                    ${
                      errors.websiteUrl
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                />
              </div>
              {errors.websiteUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.websiteUrl}</p>
              )}
            </div>

            {/* Website Icon Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                {WebsiteConstants.websiteIconLabel}
              </Label>
              <div className="relative">
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-between p-3.5 hover:border-slate-400 transition-colors gap-2.5">
                  {iconPreview && (
                    <img
                      src={iconPreview}
                      alt="Preview"
                      className="w-10 h-10 object-contain rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 font-semibold">
                      {WebsiteConstants.chooseAFileOrDragAndDropItHere}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Format: {WebsiteConstants.pngJpgSvgWebpUpTo10mb}
                    </p>
                  </div>
                  <div className="bg-indigo-50 px-3 py-2 rounded-md">
                    <span className="text-xs font-semibold text-gray-scale-60">
                      {WebsiteConstants.browseFile}
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </form>
        </div>
        {/* Footer Buttons */}
        <div className="flex gap-2.5 items-center justify-center sm:justify-end p-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
          >
            <CircleX className="w-5 h-5" />
            {WebsiteConstants.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isLoading
              ? WebsiteConstants.saving
              : editWebsite
              ? WebsiteConstants.updateWebsite
              : WebsiteConstants.addWebsite}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewWebsiteDialog;
