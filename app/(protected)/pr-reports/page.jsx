"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, ArrowRight } from "lucide-react";
import { prReportsService } from "@/services/prReports";
import { toast } from "sonner";

export default function PRReportsUpload() {
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
      const test = await prReportsService.uploadCSV(selectedFile, reportTitle);
      toast.success("CSV uploaded successfully!");
      if (test.data.grid_id) {
        router.push(`/view-pr/${test.data.grid_id}`);
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

  const handleGoToList = () => {
    router.push("/pr-reports-list");
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload PR Report
          </h1>
          <p className="text-gray-600">
            Upload your CSV file to generate a comprehensive PR distribution
            report
          </p>
        </div>

        {/* File Upload Section */}
        <div className="space-y-6">
          {/* Report Title */}
          <div>
            <label
              htmlFor="reportTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Report Title (Optional)
            </label>
            <input
              type="text"
              id="reportTitle"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter report title or leave blank to use filename"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md border-0 font-medium text-blue-600 hover:text-blue-500  focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedFile.name}
                </span>
                <span className="ml-auto text-sm text-blue-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </>
              )}
            </button>

            <button
              onClick={handleGoToList}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to List
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            CSV Format Requirements:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Exchange Symbol</li>
            <li>• Recipient</li>
            <li>• URL</li>
            <li>• Potential Reach</li>
            <li>• About</li>
            <li>• Value</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
