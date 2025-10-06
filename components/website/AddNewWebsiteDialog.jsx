"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { X, Plus, Save, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import validator from "validator";
import * as Yup from "yup";
import WebsiteConstants from "./constans";
import { websitesService } from "@/services/websites";
import { getLogoUrl } from "@/lib/utils";
import CommonModal from "@/components/common/CommonModal";
import ErrorMessage from "../ui/error-message";
import Loading from "@/components/ui/loading";

const AddNewWebsiteDialog = ({ onWebsiteAdded, isOpen, onClose, editWebsite, onEditWebsite }) => {
  const [iconPreview, setIconPreview] = useState(null);
  const [websiteIcon, setWebsiteIcon] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Get initial form values
  const getInitialValues = () => {
    if (editWebsite) {
      return {
        websiteName: editWebsite.name || "",
        websiteUrl: editWebsite.url,
      };
    }
    return {
      websiteName: "",
      websiteUrl: "",
    };
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: Yup.object().shape({
      websiteName: Yup.string()
        .trim()
        .min(1, WebsiteConstants.websiteNameMinLength)
        .required(WebsiteConstants.websiteNameRequired),
      websiteUrl: Yup.string()
        .trim()
        .test("is-valid-url", WebsiteConstants.invalidUrl, (value) => {
          if (!value) return false;

          const urlValue = value.trim();

          // Require protocol - don't auto-add, just validate
          if (!urlValue.startsWith("http://") && !urlValue.startsWith("https://")) {
            return false; // Must include protocol
          }

          // Check if it's a valid URL using validator.js
          if (
            !validator.isURL(urlValue, {
              protocols: ["http", "https"],
              require_protocol: true,
              require_host: true,
              require_valid_protocol: true,
              allow_underscores: false,
              host_whitelist: false,
              host_blacklist: false,
              allow_trailing_dot: false,
              allow_protocol_relative_urls: false,
              disallow_auth: true,
              allow_fragments: true,
              allow_query_components: false,
            })
          ) {
            return false;
          }

          // Check if URL contains invalid characters
          if (!validator.isAscii(urlValue)) {
            return false;
          }

          // Check domain format (remove protocol first and extract just the domain part)
          const cleanUrl = urlValue.replace(/^https?:\/\//, "");
          const [domainPart] = cleanUrl.split("/"); // Get only domain part, ignore path

          // Validate domain using FQDN (Fully Qualified Domain Name)
          if (
            !validator.isFQDN(domainPart, {
              require_tld: true,
              allow_underscores: false,
              allow_trailing_dot: false,
              allow_numeric_tld: false,
            })
          ) {
            return false;
          }

          // Additional check for proper domain extension
          const parts = domainPart.split(".");
          if (parts.length < 2) return false;

          const extension = parts[parts.length - 1];
          return validator.isAlpha(extension) && extension.length >= 2;
        })
        .required(WebsiteConstants.websiteUrlRequired),
    }),
    onSubmit: async (values) => {
      try {
        setIsUploadingLogo(true);
        // Use URL as entered by user
        const { websiteUrl } = values;

        const websiteData = {
          name: values.websiteName.trim(),
          url: websiteUrl,
          logo: websiteIcon,
        };

        if (editWebsite) {
          // Edit mode - update existing website
          // Add existing logo info for replacement
          if (editWebsite.logo) {
            websiteData.existingLogo = editWebsite.logo;
          }

          const response = await websitesService.updateWebsite(editWebsite._id || editWebsite.id, websiteData);

          const updatedWebsite = {
            ...editWebsite,
            ...(response.data || response),
            name: values.websiteName.trim(),
            url: websiteUrl,
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

        // eslint-disable-next-line no-use-before-define
        handleClose();
      } catch (error) {
        let errorMessage = editWebsite ? WebsiteConstants.updateWebsiteError : WebsiteConstants.addWebsiteError;

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast.error(errorMessage);
      } finally {
        setIsUploadingLogo(false);
      }
    },
    enableReinitialize: true,
  });

  // Reset form when dialog opens/closes or edit website changes
  useEffect(() => {
    if (isOpen) {
      if (editWebsite) {
        // Set icon preview for edit mode
        if (editWebsite.logo) {
          setIconPreview(getLogoUrl(editWebsite.logo));
        } else {
          setIconPreview(editWebsite.icon || null);
        }
      } else {
        // Add mode - reset icon
        setIconPreview(null);
      }
      setWebsiteIcon(null);
    }
  }, [isOpen, editWebsite]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const [file] = event.target.files;
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(WebsiteConstants.invalidFileType);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error("File too large:", file.size);
        toast.error(WebsiteConstants.fileSizeError);
        return;
      }

      setWebsiteIcon(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
    }
  };

  // Remove uploaded file
  const _removeFile = () => {
    setWebsiteIcon(null);
    // Reset to original icon when removing uploaded file
    if (editWebsite) {
      if (editWebsite.logo) {
        setIconPreview(getLogoUrl(editWebsite.logo));
      } else {
        setIconPreview(editWebsite.icon || null);
      }
    } else {
      setIconPreview(null);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    // Clean up preview URL
    if (iconPreview && iconPreview.startsWith("blob:")) {
      URL.revokeObjectURL(iconPreview);
    }

    setIconPreview(null);
    setWebsiteIcon(null);
    setIsUploadingLogo(false);
    formik.resetForm();
    onClose();
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <CommonModal
        open={isOpen}
        onClose={handleClose}
        title={editWebsite ? WebsiteConstants.editWebsite : WebsiteConstants.addNewWebsite}
        subtitle={editWebsite ? WebsiteConstants.updateWebsiteDescription : WebsiteConstants.addWebsiteDescription}
        icon={
          editWebsite ? <PencilLine className="w-7 h-7 text-slate-700" /> : <Plus className="w-7 h-7 text-slate-700" />
        }
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={formik?.isSubmitting || isUploadingLogo}
              className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
            >
              <X className="w-5 h-5" />
              {WebsiteConstants.cancel}
            </Button>
            <Button
              type="submit"
              disabled={
                formik.isSubmitting ||
                isUploadingLogo ||
                !formik.isValid ||
                (!formik.dirty && !websiteIcon) ||
                (editWebsite && !formik.dirty && !websiteIcon)
              }
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium disabled:opacity-50"
            >
              {formik.isSubmitting || isUploadingLogo ? (
                <>
                  <Loading size="sm" color="white" className="w-5 h-5" />
                  {WebsiteConstants.save}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {WebsiteConstants.save}
                </>
              )}
            </Button>
          </>
        }
      >
        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          {/* Website Name Field */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              {WebsiteConstants.websiteNameLabel} <span className="text-red-500">{WebsiteConstants.required}</span>
            </Label>
            <Input
              type="text"
              name="websiteName"
              placeholder={WebsiteConstants.enterWebsiteName}
              value={formik.values.websiteName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`h-10 rounded-lg border-slate-200 text-slate-700 placeholder:text-slate-400 ${
                formik.errors.websiteName && formik.touched.websiteName ? "border-red-500 focus:border-red-600" : ""
              }`}
            />
            {formik.errors.websiteName && formik.touched.websiteName && (
              <ErrorMessage message={formik.errors.websiteName} className="mt-1" />
            )}
          </div>

          {/* Website URL Field */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              {WebsiteConstants.websiteUrlLabel} <span className="text-red-500">{WebsiteConstants.required}</span>
            </Label>
            <div className="relative">
              <Input
                type="text"
                name="websiteUrl"
                placeholder={WebsiteConstants.urlPlaceholder}
                value={formik.values.websiteUrl}
                onChange={(e) => {
                  const lowercaseValue = e.target.value.toLowerCase();
                  formik.setFieldValue("websiteUrl", lowercaseValue);
                }}
                onBlur={formik.handleBlur}
                className={`flex-1 rounded-lg border-slate-200 text-slate-600 placeholder:text-slate-400
                          ${
                            formik.errors.websiteUrl && formik.touched.websiteUrl
                              ? "border-red-500 focus:border-red-600"
                              : ""
                          }`}
              />
            </div>
            {formik.errors.websiteUrl && formik.touched.websiteUrl && (
              <ErrorMessage message={formik.errors.websiteUrl} className="mt-1" />
            )}
          </div>

          {/* Website Icon Field */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">{WebsiteConstants.websiteIconLabel}</Label>
            <div className="relative">
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-between p-3.5 hover:border-slate-400 transition-colors gap-2.5">
                {iconPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="w-10 h-10 object-contain rounded"
                    width={40}
                    height={40}
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm text-slate-600 font-semibold truncate max-w-[122px] sm:max-w-full">
                    {WebsiteConstants.chooseAFileOrDragAndDropItHere}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[122px] sm:max-w-full">
                    Format: {WebsiteConstants.pngJpgSvgWebpUpTo10mb}
                  </p>
                </div>
                <div className="bg-indigo-50 px-3 py-2 rounded-md">
                  <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
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
        </div>
      </CommonModal>
    </form>
  );
};

export default AddNewWebsiteDialog;
