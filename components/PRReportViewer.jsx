import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TotalPublicationIcon, TotalReachIcon } from "@/components/icon";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Eye,
  Share2,
  FileSpreadsheet,
  FileArchive,
  X,
  FileSpreadsheetIcon,
  Plus,
  PencilLine,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
// Dynamic import will be used in handleDownload function
import { logoMapping, orderMapping } from "@/utils/logoMapping";
import React from "react";
import Image from "next/image";
import { prReportsService } from "@/services/prReports";
import { viewReportsService } from "@/services/viewReports";
import PRReportPDF from "./PRReportPDF";
import URLTableCell from "./URLTableCell";
import Loading from "./ui/loading";
import ShareDialog from "./ShareDialog";
import AddUpdateWebsite from "./view-reports/AddUpdateWebsite";
import CustomTooltip from "./ui/custom-tooltip";
import { DeleteDialog } from "./view-reports";

const PRReportViewer = ({
  report,
  loading = false,
  isPublic = true,
  fetchReportData = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState(new Set());
  const [imageLoading, setImageLoading] = useState(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAddWebsiteDialog, setShowAddWebsiteDialog] = useState(false);
  const [editWebsiteInitialUrls, setEditWebsiteInitialUrls] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [outletToDelete, setOutletToDelete] = useState(null);
  const [outletToEdit, setOutletToEdit] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleImageError = (outletName) => {
    // Silently handle image errors without console output
    setImageErrors((prev) => new Set(prev).add(outletName));
    setImageLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(outletName);
      return newSet;
    });
  };

  const handleImageLoad = (outletName) => {
    setImageLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(outletName);
      return newSet;
    });
  };

  const handleImageStartLoad = (outletName) => {
    setImageLoading((prev) => new Set(prev).add(outletName));
  };

  const isImageError = (outletName) => {
    return imageErrors.has(outletName);
  };

  const isImageLoading = (outletName) => {
    return imageLoading.has(outletName);
  };

  // Pagination handlers
  // const handlePageChange = (newPage) => {
  //   setCurrentPage(newPage);
  // };

  // const handleRowsPerPageChange = (newRowsPerPage) => {
  //   setRowsPerPage(newRowsPerPage);
  //   setCurrentPage(1); // Reset to first page when changing rows per page
  // };

  // Optimized logo lookup to prevent lag
  const getLogoUrl = (outletName) => {
    if (!outletName) return null;

    // Helper function to normalize strings for matching
    const normalizeString = (str) => {
      if (!str) return "";
      return str.toLowerCase().trim();
    };

    // First try exact match
    let logoPath = logoMapping[outletName];
    if (logoPath) {
      // Only return the path if it's a valid format and likely exists
      if (logoPath.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        return logoPath;
      }
    }

    // Try normalized match
    const normalizedName = normalizeString(outletName);
    for (const [key, value] of Object.entries(logoMapping)) {
      if (normalizeString(key) === normalizedName) {
        if (value && value.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          return value;
        }
      }
    }

    // Return null for unknown outlets to trigger fallback (no console output)
    return null;
  };

  // Validate if a logo URL is likely to exist
  const isValidLogoUrl = (url) => {
    if (!url) return false;

    // Check if it's a valid image format
    if (!url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return false;

    // Check if it's a relative path (starts with /)
    if (!url.startsWith("/")) return false;

    return true;
  };

  // Handle share report
  const handleShareReport = async (payload) => {
    try {
      const reportId = report.grid_id || report._id || report.id;
      await prReportsService.shareReport(
        reportId,
        payload.is_private,
        payload.sharedEmails || []
      );
      fetchReportData && fetchReportData();
      toast.success("Report shared successfully!");
    } catch (error) {
      toast.error("Failed to share report");
    }
  };

  const handleDownload = async (format) => {
    if (format === "pdf") {
      try {
        setIsGeneratingPDF(true);

        // Convert logo images to base64 for PDF generation
        const outletsWithBase64Logos = await Promise.allSettled(
          (formatData || report.outlets || []).map(async (outlet) => {
            const outletName =
              outlet.original_website_name || outlet.website_name;
            const logoUrl = getLogoUrl(outletName);

            if (logoUrl && isValidLogoUrl(logoUrl)) {
              try {
                const base64Logo = await convertImageToBase64(logoUrl);
                return {
                  ...outlet,
                  base64Logo: base64Logo,
                };
              } catch (error) {
                console.error(
                  `Failed to convert logo for ${outletName}:`,
                  error
                );
                // Return outlet without logo, will use fallback
                return outlet;
              }
            } else {
            }
            return outlet;
          })
        );

        // Extract successful results and handle failures
        const processedOutlets = outletsWithBase64Logos.map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            console.error(
              `Failed to process outlet at index ${index}:`,
              result.reason
            );
            // Return the original outlet data if processing failed
            return (formatData || report.outlets || [])[index];
          }
        });

        // Generate PDF using the new PRReportPDF component with base64 logos
        const { pdf } = await import("@react-pdf/renderer");
        const pdfBlob = await pdf(
          <PRReportPDF report={report} formatData={processedOutlets} />
        ).toBlob();

        downloadFile(
          pdfBlob,
          `PR_Report_${report.id || "report"}.pdf`,
          "application/pdf"
        );
        toast.success("PDF download completed");
      } catch (error) {
        console.error("PDF generation failed:", error);
        toast.error("PDF generation failed");
      } finally {
        setIsGeneratingPDF(false);
      }
    } else if (format === "csv") {
      // Generate CSV content
      const csvContent = generateCSVContent(report);
      downloadFile(csvContent, `PR_Report_${csvContent}.csv`, "text/csv");
      toast.success("CSV download completed");
    }
  };

  // Function to convert image to base64 for PDF
  const convertImageToBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas element
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Create an image element using the browser's native Image constructor
        const img = new window.Image();
        img.crossOrigin = "anonymous";

        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          reject(new Error(`Image conversion timeout for: ${imagePath}`));
        }, 10000); // 10 second timeout

        img.onload = () => {
          try {
            clearTimeout(timeoutId);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Convert to base64
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to load image: ${imagePath}`));
        };

        // Set the source
        img.src = imagePath;
      } catch (error) {
        reject(error);
      }
    });
  };

  const generateCSVContent = (report) => {
    const headers = ["Website", "Published URL", "Potential Reach"];
    // Use formatData for consistent ordering in CSV (same order as displayed in UI)
    const outletsToUse = formatData || report.outlets || [];
    const rows = outletsToUse.map((outlet) => [
      outlet.website_name,
      outlet.published_url,
      outlet.semrush_traffic || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  };

  const downloadFile = (content, filename, mimeType) => {
    let blob;

    // Handle both text content and blob objects
    if (content instanceof Blob) {
      blob = content;
    } else {
      blob = new Blob([content], { type: mimeType });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format and order outlets according to orderMapping
  // This ensures that outlets are displayed in the predefined order from orderMapping
  // Expected order: Business Insider, YahooFinance, The Globe and Mail, Benzinga, Marketwatch, etc.
  // Outlets not in orderMapping will appear at the end of the list
  const formatData = useMemo(() => {
    if (!report?.outlets) return [];

    // Helper function to normalize strings for matching
    const normalizeString = (str) => {
      if (!str) return "";
      return str.toLowerCase().trim();
    };

    // Create a map from normalized website_name to its order index, if present in orderMapping
    const orderIndex = Object.entries(orderMapping).reduce(
      (acc, [key, value], idx) => {
        const normalizedValue = normalizeString(value);
        acc[normalizedValue] = idx;
        return acc;
      },
      {}
    );

    // Create a map from normalized API website_name to orderMapping value
    const outletNameMapping = Object.entries(orderMapping).reduce(
      (acc, [key, value]) => {
        const normalizedValue = normalizeString(value);
        acc[normalizedValue] = value; // Store the original formatted value
        return acc;
      },
      {}
    );

    // Map and format the outlets
    const formatted = report.outlets.map((outlet) => {
      const normalizedApiName = normalizeString(outlet.website_name);
      const mappedName =
        outletNameMapping[normalizedApiName] ||
        outlet.website_name ||
        "Unknown";

      return {
        ...outlet,
        original_website_name: outlet.website_name, // Preserve original for logo mapping
        website_name: mappedName,
      };
    });

    // Sort by orderMapping order if present, otherwise keep at the end
    const sorted = formatted.sort((a, b) => {
      const aNormalized = normalizeString(a.website_name);
      const bNormalized = normalizeString(b.website_name);
      const aIdx = orderIndex[aNormalized];
      const bIdx = orderIndex[bNormalized];
      if (aIdx === undefined && bIdx === undefined) return 0;
      if (aIdx === undefined) return 1;
      if (bIdx === undefined) return -1;
      return aIdx - bIdx;
    });

    return sorted;
  }, [report]);

  // Filter the formatted and ordered outlets based on search term
  // Search works against both formatted names and original names for better user experience
  const filteredOutlets = useMemo(() => {
    if (!formatData || formatData.length === 0) return [];

    return formatData.filter((outlet) => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        outlet.website_name.toLowerCase().includes(searchLower) ||
        outlet.published_url.toLowerCase().includes(searchLower) ||
        // Also search against the original website_name if it exists
        (outlet.original_website_name &&
          outlet.original_website_name.toLowerCase().includes(searchLower))
      );
    });
  }, [formatData, debouncedSearchTerm, showShareDialog]);

  // Paginate the filtered outlets
  // const paginatedOutlets = useMemo(() => {
  //   const startIndex = (currentPage - 1) * rowsPerPage;
  //   const endIndex = startIndex + rowsPerPage;
  //   return filteredOutlets.slice(startIndex, endIndex);
  // }, [filteredOutlets, currentPage, rowsPerPage]);

  const formatNumber = (num) => {
    // Handle undefined, null, or invalid numbers
    if (num === undefined || num === null || num === "") {
      return "0";
    }

    // Better parsing for comma-separated numbers
    let numValue;
    if (typeof num === "string") {
      // Remove commas and parse
      numValue = parseFloat(num.replace(/,/g, ""));
    } else {
      numValue = Number(num);
    }

    // Check if conversion resulted in NaN
    if (isNaN(numValue)) {
      return "0";
    }

    // Better formatting with more granular ranges
    if (numValue >= 10000000) {
      // 10M+
      return `${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000000) {
      // 1M+
      return `${(numValue / 1000000).toFixed(2)}M`;
    } else if (numValue >= 10000) {
      // 10K+
      return `${(numValue / 1000).toFixed(0)}K`;
    } else if (numValue >= 1000) {
      // 1K+
      return `${(numValue / 1000).toFixed(1)}K`;
    } else {
      return numValue.toLocaleString();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Unknown date";
    }

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleAddOutlet = () => {
    setEditWebsiteInitialUrls("");
    setShowAddWebsiteDialog(true);
  };

  const handleWebsiteAdded = async (result) => {
    // Handle website(s) added/updated - result can be single website or bulk result
    try {
      // Check if this is an update operation (when editWebsiteInitialUrls is set)
      const isUpdateOperation =
        editWebsiteInitialUrls && editWebsiteInitialUrls.trim() !== "";

      if (isUpdateOperation && outletToEdit) {
        // This is an update operation - call the update API
        const recordId = outletToEdit._id || outletToEdit.id;
        const updateData = {
          id: recordId,
          urls: result.websites
            ? result.websites.map((w) => w.url)
            : result.urls || [],
        };

        await viewReportsService.updatePR(recordId, updateData);
        toast.success("Record updated successfully");
      } else {
        // This is a create operation - already handled by AddUpdateWebsite component
        if (result.websites && Array.isArray(result.websites)) {
          // Bulk creation result
        } else {
          // Single website result (for backward compatibility)
        }
      }

      // Refresh the report data to reflect changes
      if (fetchReportData) {
        fetchReportData();
      }

      // Clear edit state
      setEditWebsiteInitialUrls("");
      setOutletToEdit(null);
    } catch (error) {
      console.error("Error in handleWebsiteAdded:", error);
      toast.error("Failed to process request. Please try again.");
    }
  };

  // Edit outlet -> open same dialog prefilled with the outlet URL
  const handleEdit = (outlet) => {
    const url = outlet?.published_url || "";
    setEditWebsiteInitialUrls(url);
    setOutletToEdit(outlet); // Store the outlet being edited
    setShowAddWebsiteDialog(true);
  };

  // Open delete confirmation for an outlet
  const handleDelete = (outlet) => {
    setOutletToDelete(outlet);
    setShowDeleteDialog(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!outletToDelete) return;
    setDeleteLoading(true);
    try {
      // Call the delete API
      const id = outletToDelete._id || outletToDelete.id;

      await viewReportsService.deletePR(id);

      // Refresh the report data to reflect changes
      if (fetchReportData) fetchReportData();

      toast.success("Record deleted successfully");
      setShowDeleteDialog(false);
      setOutletToDelete(null);
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error(
        error.message || "Failed to delete record. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseWebsiteDialog = () => {
    setShowAddWebsiteDialog(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Report Available</h3>
        <p className="text-muted-foreground">
          Please select a report to view its details
        </p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
        <Card className="bg-primary-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="text-base pb-2 font-medium text-gray-scale-70">
                Total Publications
              </div>
              <div className="text-2xl sm:text-4xl font-semibold flex flex-col xl:flex-row items-start xl:items-end gap-2 text-gray-scale-80">
                {report.total_outlets || 0}
                <p className="text-sm font-medium text-gray-scale-50 mb-1">
                  / Media outlets
                </p>
              </div>
            </CardTitle>
            <div className="m-0 p-3.5 rounded-lg flex items-center justify-center">
              <TotalPublicationIcon
                color="#4F46E5"
                width={50}
                height={50}
                // className="sm:w-5 sm:h-5"
              />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-orange-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="text-base pb-2 font-medium text-gray-scale-70">
                Total Reach
              </div>
              <div className="text-2xl sm:text-3xl font-semibold flex flex-col xl:flex-row  items-start xl:items-end gap-2 text-gray-scale-80">
                {formatNumber(report.total_semrush_traffic)}
                <p className="text-sm font-medium text-gray-scale-50 mb-1">
                  / Potential audience
                </p>
              </div>
            </CardTitle>
            <div className="m-0 p-3.5 rounded-lg flex items-center justify-center">
              <TotalReachIcon
                color="#EEAE00"
                width={50}
                height={50}
                // className="sm:w-5 sm:h-5"
              />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-lime-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="text-base pb-2 font-medium text-gray-scale-70">
                Report Status
              </div>
              <div className="flex flex-col xl:flex-row items-start xl:items-end gap-2 text-gray-scale-80">
                <Badge
                  className="capitalize text-[#65A30D] bg-[#65A30D1A] py-2 px-3 text-sm"
                  variant={
                    report.status === "completed" ? "green" : "secondary"
                  }
                >
                  {report?.status || "Completed"}
                </Badge>
                <p className="text-sm font-medium text-gray-scale-50 mb-1">
                  {report?.date_created
                    ? `Created ${formatDate(report.date_created)}`
                    : "/ Distribution complete"}
                </p>
              </div>
            </CardTitle>
            <div className="relative">
              <div className="m-0 p-3.5 rounded-lg flex items-center justify-center">
                <FileSpreadsheetIcon className="text-lime-60 w-[50px] h-[50px]" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Media Outlets Table */}
      <Card className="mt-4">
        <CardHeader className="sticky top-0 z-10 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <p className={`${isPublic && "xl:inline-block"} hidden`}>
                PR Report :
              </p>
              <span className="block text-primary-50 max-w-[294px] truncate overflow-hidden">
                {report.title}
              </span>
            </CardTitle>
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search outlets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full rounded-3xl min-w-[100%] md:min-w-[300px] border-gray-scale-30 focus:border-primary-50"
                  />
                  {searchTerm && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                      <X
                        className="h-6 w-6 text-muted-foreground bg-gray-100 rounded-xl p-1"
                        onClick={() => setSearchTerm("")}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* <button
                  onClick={() => handleDownload("badge")}
                  className="px-4 py-2.5 text-sm border font-semibold border-Gray-20 rounded-3xl flex items-center gap-2 transition-colors  text-Gray-60"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden xl:inline-block">Create badge</span>
                </button> */}
                {!isPublic && (
                  <button
                    onClick={handleAddOutlet}
                    className="px-4 py-2.5 text-sm border font-semibold border-Gray-30 rounded-3xl flex items-center gap-2 transition-colors text-gray-scale-60 hover:bg-gray-scale-10 hover:text-gray-scale-80"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden xl:inline-block">Add</span>
                  </button>
                )}
                <button
                  onClick={() => handleDownload("csv")}
                  className="px-4 py-2.5 text-sm border font-semibold rounded-3xl flex items-center gap-2 transition-colors bg-primary-60 hover:bg-primary-70 text-white"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden xl:inline-block">CSV</span>
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={isGeneratingPDF}
                  className={`px-4 py-2.5 text-sm border font-semibold rounded-3xl flex items-center gap-2 transition-colors bg-primary-60 hover:bg-primary-70 text-white ${
                    isGeneratingPDF
                      ? "opacity-50 cursor-not-allowed bg-none"
                      : ""
                  }`}
                >
                  {isGeneratingPDF ? (
                    <Loading
                      size="sm"
                      color="white"
                      showText={true}
                      text="PDF"
                      textColor="white"
                    />
                  ) : (
                    <>
                      <FileArchive className="h-4 w-4" />
                      <span className="hidden xl:inline-block">PDF</span>
                    </>
                  )}
                </button>
                {!isPublic && (
                  <button
                    onClick={() => setShowShareDialog(true)}
                    className="px-4 py-2.5 text-sm border font-semibold rounded-3xl flex items-center gap-2 transition-colors bg-primary-60 hover:bg-primary-70 text-white"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden xl:inline-block">Share</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100vh-250px)] lg:max-h-[calc(100dvh-302px)] overflow-y-auto scrollbar-custom">
              <Table containerClassName="contents">
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="w-full">
                    <TableHead className="min-w-[200px]">Outlet</TableHead>
                    <TableHead className="min-w-[400px]">Website</TableHead>
                    <TableHead className="min-w-[160px]">
                      Potential Reach
                    </TableHead>
                    {!isPublic && (
                      <TableHead className="w-[140px]">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody>
                  {filteredOutlets?.map((outlet, index) => {
                    // Add unique ID for trust badge selection
                    const outletWithId = {
                      ...outlet,
                      id:
                        outlet.id ||
                        `outlet_${
                          (currentPage - 1) * rowsPerPage + index + 1
                        }_${outlet.website_name?.replace(/\s+/g, "_")}`,
                    };
                    const tooltipPosition =
                      index === filteredOutlets.length - 1 ? "top" : "bottom";

                    return (
                      <TableRow key={index}>
                        <TableCell className="flex items-center gap-3 min-w-[200px]">
                          {/* Logo Display Logic */}
                          {(() => {
                            const logoUrl = getLogoUrl(
                              outletWithId.original_website_name ||
                                outletWithId.website_name
                            );
                            const hasValidLogo =
                              logoUrl &&
                              isValidLogoUrl(logoUrl) &&
                              !isImageError(
                                outletWithId.original_website_name ||
                                  outletWithId.website_name
                              );
                            const isLoading = isImageLoading(
                              outletWithId.original_website_name ||
                                outletWithId.website_name
                            );

                            if (isLoading) {
                              // Show skeleton while loading
                              return (
                                <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
                                  <Skeleton className="w-full h-full" />
                                </div>
                              );
                            }

                            if (hasValidLogo) {
                              // Show logo image with error handling
                              return (
                                <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
                                  <Image
                                    src={logoUrl}
                                    alt={outletWithId.website_name}
                                    title={outletWithId.website_name}
                                    className="max-w-[120px] sm:max-w-[137px] max-h-[38px] object-contain w-full h-full"
                                    onLoadStart={() =>
                                      handleImageStartLoad(
                                        outletWithId.original_website_name ||
                                          outletWithId.website_name
                                      )
                                    }
                                    onLoad={() =>
                                      handleImageLoad(
                                        outletWithId.original_website_name ||
                                          outletWithId.website_name
                                      )
                                    }
                                    onError={() =>
                                      handleImageError(
                                        outletWithId.original_website_name ||
                                          outletWithId.website_name
                                      )
                                    }
                                    loading="lazy"
                                    height={38}
                                    width={137}
                                    // Add error handling for missing images
                                    onErrorCapture={() =>
                                      handleImageError(
                                        outletWithId.original_website_name ||
                                          outletWithId.website_name
                                      )
                                    }
                                  />
                                </div>
                              );
                            }

                            // Show circular first character fallback (always available)
                            const firstChar = outletWithId.website_name
                              .charAt(0)
                              .toUpperCase();
                            const colorClasses = [
                              "text-blue-700 border-blue-300 bg-blue-50",
                              "text-green-700 border-green-300 bg-green-50",
                              "text-purple-700 border-purple-300 bg-purple-10",
                              "text-orange-700 border-orange-300 bg-orange-10",
                              "text-red-700 border-red-300 bg-red-50",
                              "text-indigo-700 border-indigo-300 bg-indigo-50",
                            ];
                            const colorClass =
                              colorClasses[index % colorClasses.length];

                            return (
                              <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
                                <div
                                  className={`w-[32px] sm:w-[38px] h-[32px] sm:h-[38px] rounded-full flex items-center justify-center border-2 text-base sm:text-lg font-bold tracking-wide ${colorClass}`}
                                  style={{
                                    borderRadius: "50%",
                                    aspectRatio: "1 / 1",
                                    textAlign: "center",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid currentColor",
                                  }}
                                >
                                  {firstChar}
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>

                        <TableCell className="text-muted-foreground min-w-[400px]">
                          <div>
                            <div
                              className="truncate max-w-[380px]"
                              title={outlet.website_name}
                            >
                              {outlet.website_name}
                            </div>
                            <URLTableCell
                              url={outlet.published_url}
                              textMaxWidth="max-w-[300px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[650px] 2xl:max-w-[900px]"
                              textColor="text-primary-50"
                              iconSize="h-4 w-4"
                              iconColor="text-primary-50"
                            />
                          </div>
                        </TableCell>

                        <TableCell className="font-medium min-w-[160px]">
                          {formatNumber(outlet?.semrush_traffic)}
                        </TableCell>

                        {!isPublic && (
                          <TableCell className="font-medium w-[140px]">
                            <div className="pl-2 flex gap-8 items-center">
                              <CustomTooltip
                                content="Edit"
                                position={tooltipPosition}
                              >
                                <button
                                  onClick={() => handleEdit(outlet)}
                                  className="text-slate-600 flex text-sm font-medium"
                                >
                                  <PencilLine className="w-4 h-4" />
                                </button>
                              </CustomTooltip>
                              <CustomTooltip
                                content="Delete"
                                position={tooltipPosition}
                              >
                                <button
                                  onClick={() => handleDelete(outlet)}
                                  className="text-red-600 flex text-sm font-medium"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </CustomTooltip>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {/* <Pagination
                totalItems={filteredOutlets.length}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              /> */}
          </div>

          {filteredOutlets.length === 0 && searchTerm && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No outlets found matching "{searchTerm}"
              </p>
            </div>
          )}

          {/* {filteredOutlets.length > 0 && paginatedOutlets.length === 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No results for the current page. Please go to a previous page.
              </p>
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false);
          }}
          report={report}
          onShare={handleShareReport}
        />
      )}

      {/* Add / Edit Website URLs Dialog */}
      <AddUpdateWebsite
        isOpen={showAddWebsiteDialog}
        onClose={handleCloseWebsiteDialog}
        onWebsiteAdded={handleWebsiteAdded}
        initialUrls={editWebsiteInitialUrls}
        report={report}
      />

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <DeleteDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setOutletToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
          itemName={
            outletToDelete?.website_name ||
            outletToDelete?.published_url ||
            "this outlet"
          }
          warningText="If you Delete this outlet, it will be permanently removed."
        />
      )}
    </div>
  );
};

export default PRReportViewer;
