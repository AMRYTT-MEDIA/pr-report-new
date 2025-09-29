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
import { Button } from "../ui/button";
import CommonModal from "@/components/common/CommonModal";

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
    <CommonModal
      open={open}
      onClose={handleClose}
      title="Import .CSV"
      subtitle="Are you sure you want to Import .CSV File?"
      icon={<CloudUpload className="h-7 w-7" />}
      size="lg"
      customHeaderLayout={true}
      isBorderShow={false}
      headerActions={
        <button
          onClick={handleSampleCsvDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 font-semibold border border-border-gray rounded-md hover:bg-gray-100"
        >
          <Download className="w-4 h-4 font-semibold" />
          Sample CSV
        </button>
      }
      footer={
        <>
          <Button
            variant="default"
            onClick={handleClose}
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-full flex items-center gap-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="gap-1.5 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-3xl font-semibold w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submit
              </>
            ) : (
              <>
                <CircleCheckBig className="h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </>
      }
    >
      {/* File Upload Area */}
      <div
        className={`flex flex-col items-center justify-center py-10 px-4 md:px-6 border-2 border-dashed rounded-lg transition-colors duration-300 ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-Gray-30 hover:border-primary-50"
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center mb-6 text-slate-600">
          <CloudUpload className="w-10 h-10" />
        </div>
        <p className="text-slate-600 font-semibold mb-2.5">
          Choose a file or drag & drop it here
        </p>
        <p className="text-sm text-slate-400 font-bold mb-3.5">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 pt-5">
        <label className="block text-md text-slate-700 font-bold whitespace-nowrap">
          PR Report Name :
        </label>
        <input
          type="text"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          placeholder="Enter PR Report Name..."
          className="w-full px-3 py-1.5 border border-slate-300 text-slate-600 font-semibold rounded-md focus:outline-none focus:border-slate-500"
        />
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-5">
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
    </CommonModal>
  );
};

export default ImportCsvDialog;
