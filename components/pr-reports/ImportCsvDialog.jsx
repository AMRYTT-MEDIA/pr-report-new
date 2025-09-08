"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  Share2,
  CloudDownload,
  Download,
  CloudUpload,
  CircleX,
  CircleXIcon,
  CircleCheckBig,
} from "lucide-react";
import { prReportsService } from "@/services/prReports";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

const ImportCsvDialog = ({ open, onOpenChange, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (
          file.type === "text/csv" ||
          file.type === "application/vnd.ms-excel" ||
          file.name.endsWith(".csv")
        ) {
          setSelectedFile(file);
          // Auto-generate title from filename if not provided
          if (!reportTitle) {
            setReportTitle(file.name.replace(".csv", ""));
          }
        } else {
          toast.error("Please select a valid CSV file");
          setSelectedFile(null);
        }
      }
    },
    [reportTitle]
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "text/csv" || file.type === "application/vnd.ms-excel")
    ) {
      setSelectedFile(file);
      // Auto-generate title from filename if not provided
      if (!reportTitle) {
        setReportTitle(file.name.replace(".csv", ""));
      }
    } else {
      toast.error("Please select a valid CSV file");
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const response = await prReportsService.uploadCSV(
        selectedFile,
        reportTitle
      );
      toast.success("CSV uploaded successfully!");

      // Reset form
      setSelectedFile(null);
      setReportTitle("");

      // Close dialog
      onOpenChange(false);

      // Call success callback if provided

      // Navigate to view page if grid_id is available
      if (response.data?.grid_id) {
        window.open(`/view-pr/${response.data.grid_id}`, "_blank");
      }
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message || "Upload failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedFile(null);
    setReportTitle("");
    setIsDragOver(false);
    onOpenChange(false);
  };

  const handleSampleCsvDownload = () => {
    const link = document.createElement("a");
    link.href = "/Sample CSV.csv";
    link.download = "Sample CSV.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-1xl bg-white boder border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
      >
        <div className="flex flex-col gap-5 border border-gray-200 rounded-xl p-5 bg-white overflow-y-auto max-h-[80vh] scrollbar-custom">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-purple-70 rounded-xl p-2.5">
              <CloudUpload className="h-7 w-7" />
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-3">
            <div>
              <h2 className="text-lg font-semibold text-font-h2">
                Import .CSV
              </h2>
              <p className="text-sm text-font-h2-5 mt-1">
                Are you sure you want to Import .CSV File?
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleSampleCsvDownload}
                className="flex items-center gap-1.5 px-3 py-1 text-sm text-gray-scale-secondary font-semibold border border-border-gray rounded-md hover:bg-gray-100"
              >
                <Download className="w-4 h-4 font-semibold" />
                Sample CSV
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`flex flex-col items-center justify-center py-10 px-4 md:px-6 border-2 border-dashed rounded-lg transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-scale-20 hover:border-gray-scale-50"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-center mb-6 text-gray-scale-60">
              <CloudUpload className="w-10 h-10" />
            </div>
            <p className="text-gray-scale-60 font-semibold mb-2.5">
              Choose a file or drag & drop it here
            </p>
            <p className="text-sm text-font-h2-5 font-semibold mb-3.5">
              CSV formats, up to 50MB
            </p>
            <label
              htmlFor="file-upload"
              className="px-6 py-2.5 border border-border-gray rounded-lg cursor-pointer hover:bg-gray-200 text-[#54575C] font-semibold transition-colors"
            >
              Browse File
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* PR Report Name Input */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
            <label className="block text-sm text-gray-scale-70 font-semibold whitespace-nowrap">
              PR Report Name :
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter PR Report Name..."
              className="w-full px-3 py-1.5 border border-gray-scale-20 text-gray-scale-60 font-bold rounded-md focus:outline-none focus:border-gray-scale-50"
            />
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900 break-all whitespace-nowrap overflow-hidden text-ellipsis max-w-[204px] sm:max-w-[392px] block">
                  {selectedFile.name}
                </span>
                <span className="ml-auto text-sm text-blue-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 items-center justify-center sm:justify-end p-5">
          <Button
            variant="default"
            onClick={handleClose}
            className="gap-1.5 px-4 py-2.5 bg-primary-10 hover:bg-primary-20 text-primary-50 hover:text-primary-60 rounded-3xl font-semibold w-full sm:w-auto"
          >
            <CircleXIcon className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="gap-1.5 px-4 py-2.5 bg-primary-50 hover:bg-primary-60 text-white rounded-3xl font-semibold w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <CircleCheckBig className="h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCsvDialog;
