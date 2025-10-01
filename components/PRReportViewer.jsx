import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TotalPublicationIcon, TotalReachIcon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import WebsiteIcon from "@/components/ui/WebsiteIcon";
import { Eye, Share2, FileSpreadsheet, FileArchive, FileSpreadsheetIcon, Plus, PencilLine, Trash2 } from "lucide-react";
import { SearchInput } from "@/components/common";
import { toast } from "sonner";
// Dynamic import will be used in handleDownload function
import { prReportsService } from "@/services/prReports";
import { viewReportsService } from "@/services/viewReports";
import PRReportPDF from "./PRReportPDF";
import URLTableCell from "./URLTableCell";
import Loading from "./ui/loading";
import ShareDialog from "./ShareDialog";
import AddUpdateWebsite from "./view-reports/AddUpdateWebsite";
import CustomTooltip from "./ui/custom-tooltip";
import { DeleteDialog } from "./view-reports";
import { getLogoUrl } from "@/lib/utils";

const PRReportViewer = ({ report, loading = false, isPublic = true, fetchReportData = () => {} }) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(25);

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

  const _handleImageError = (outletName) => {
    // Silently handle image errors without console output
    setImageErrors((prev) => new Set(prev).add(outletName));
    setImageLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(outletName);
      return newSet;
    });
  };

  const _handleImageLoad = (outletName) => {
    setImageLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(outletName);
      return newSet;
    });
  };

  const _handleImageStartLoad = (outletName) => {
    setImageLoading((prev) => new Set(prev).add(outletName));
  };

  const _isImageError = (outletName) => imageErrors.has(outletName);

  const _isImageLoading = (outletName) => imageLoading.has(outletName);

  // Validate if a logo URL is likely to exist
  const _isValidLogoUrl = (url) => {
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
      const response = await prReportsService.shareReport(reportId, payload.is_private, payload.sharedEmails || []);
      fetchReportData && fetchReportData();
      toast.success(response?.message || "Report shared successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to share report");
    }
  };

  const handleDownload = async (format) => {
    if (format === "pdf") {
      try {
        setIsGeneratingPDF(true);

        // Convert logo images to base64 for PDF generation
        const outletsWithBase64Logos = await Promise.allSettled(
          // eslint-disable-next-line no-use-before-define
          (formatData || report.outlets || []).map(async (outlet) => {
            if (outlet.logo) {
              try {
                let logoUrl;
                const localLogoPath = `${process.env.NEXT_PUBLIC_FRONTEND_URL}${outlet.logo}`;
                try {
                  // Try to fetch from local folder first
                  const response = await fetch(localLogoPath);
                  if (response.ok) {
                    logoUrl = localLogoPath;
                  } else {
                    throw new Error("Local logo not found");
                  }
                } catch (localError) {
                  logoUrl = getLogoUrl(outlet.logo);
                }

                // eslint-disable-next-line no-use-before-define
                const base64Logo = await convertImageToBase64(logoUrl);
                return {
                  ...outlet,
                  base64Logo,
                };
              } catch (error) {
                console.error(`Failed to convert logo for ${outlet.website_name}:`, error);
                // Return outlet without logo, will use fallback
                return outlet;
              }
            }

            // No logo available, return outlet as is (will show fallback)
            return outlet;
          })
        );

        // Extract successful results and handle failures
        const processedOutlets = outletsWithBase64Logos.map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            // Return the original outlet data if processing failed
            // eslint-disable-next-line no-use-before-define
            return (formatData || report.outlets || [])[index];
          }
        });

        // Generate PDF using the new PRReportPDF component with base64 logos
        const pdfRenderer = await import("@react-pdf/renderer");
        const { pdf } = pdfRenderer;

        const pdfBlob = await pdf(
          <PRReportPDF report={report} formatData={processedOutlets} PDFComponents={pdfRenderer} />
        ).toBlob();
        const filename = (report.title || "PR_Report").replace(/\s+/g, "_");
        // eslint-disable-next-line no-use-before-define
        downloadFile(pdfBlob, `${filename}.pdf`, "application/pdf");
        toast.success("PDF download completed");
      } catch (error) {
        console.error("PDF generation failed:", error);
        toast.error("PDF generation failed");
      } finally {
        setIsGeneratingPDF(false);
      }
    } else if (format === "csv") {
      // Generate CSV content
      // eslint-disable-next-line no-use-before-define
      const csvContent = generateCSVContent(report);
      const filename = (report.title || "PR_Report").replace(/\s+/g, "_");
      // eslint-disable-next-line no-use-before-define
      downloadFile(csvContent, `${filename}.csv`, "text/csv");
      toast.success("CSV download completed");
    }
  };

  // Function to convert image to base64 for PDF
  const convertImageToBase64 = (imagePath) =>
    new Promise((resolve, reject) => {
      try {
        // Create a canvas element
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Create an image element using the browser's native Image constructor
        const img = new window.Image();

        // Try to handle CORS
        img.crossOrigin = "anonymous";

        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          reject(new Error(`Image conversion timeout for: ${imagePath}`));
        }, 15000); // 15 second timeout for external images

        img.onload = () => {
          try {
            clearTimeout(timeoutId);

            // Set canvas dimensions to image dimensions
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0);

            // Convert to base64 - try PNG first, fallback to JPEG
            let dataURL;
            try {
              dataURL = canvas.toDataURL("image/png");
            } catch (pngError) {
              console.warn("PNG conversion failed, trying JPEG:", pngError);
              dataURL = canvas.toDataURL("image/jpeg", 0.9);
            }

            resolve(dataURL);
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        };

        img.onerror = (error) => {
          clearTimeout(timeoutId);
          console.error("Image load error:", error);
          reject(new Error(`Failed to load image: ${imagePath}`));
        };

        // Set the source
        img.src = imagePath;
      } catch (error) {
        reject(error);
      }
    });

  const generateCSVContent = (_csvReport) => {
    const headers = ["Website", "Published URL", "Potential Reach"];
    // Use formatData for consistent ordering in CSV (same order as displayed in UI)
    // eslint-disable-next-line no-use-before-define
    const outletsToUse = formatData || report.outlets || [];
    const rows = outletsToUse.map((outlet) => [outlet.website_name, outlet.published_url, outlet.semrush_traffic || 0]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

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

  // Format outlets data without orderMapping logic
  const formatData = useMemo(() => {
    if (!report?.outlets) return [];

    // Simply return the outlets as they are from the API
    return report.outlets.map((outlet) => ({
      ...outlet,
      original_website_name: outlet.website_name, // Preserve original for logo mapping
    }));
  }, [report]);

  // Filter the outlets based on search term
  const filteredOutlets = useMemo(() => {
    if (!formatData || formatData.length === 0) return [];

    return formatData.filter((outlet) => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        outlet.website_name.toLowerCase().includes(searchLower) ||
        outlet.published_url.toLowerCase().includes(searchLower) ||
        // Also search against the original website_name if it exists
        (outlet.original_website_name && outlet.original_website_name.toLowerCase().includes(searchLower))
      );
    });
  }, [formatData, debouncedSearchTerm]);

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
    setIsLoading(true);
    try {
      // Check if this is an update operation (when editWebsiteInitialUrls is set)
      const isUpdateOperation = editWebsiteInitialUrls && editWebsiteInitialUrls.trim() !== "";

      if (isUpdateOperation && outletToEdit) {
        // eslint-disable-next-line no-console
        console.log(result);
        // This is an update operation - call the update API
        const recordId = outletToEdit._id || outletToEdit.id;
        const updateData = {
          urls: result.websites ? result.websites.map((w) => w.url) : result.urls || [],
        };

        const response = await viewReportsService.updatePR(recordId, updateData);

        // Only show success message and close modal if API call succeeds
        toast.success(response?.data?.message || "Record updated successfully");

        // Refresh the report data to reflect changes
        if (fetchReportData) {
          fetchReportData();
        }

        // Clear edit state and close modal only on success
        setEditWebsiteInitialUrls("");
        setOutletToEdit(null);
        setShowAddWebsiteDialog(false);
      } else {
        // This is a create operation - already handled by AddUpdateWebsite component
        if (result.websites && Array.isArray(result.websites)) {
          // Bulk creation result
        } else {
          // Single website result (for backward compatibility)
        }

        // For create operations, close modal and refresh data
        if (fetchReportData) {
          fetchReportData();
        }

        // Clear edit state and close modal
        setEditWebsiteInitialUrls("");
        setOutletToEdit(null);
        setShowAddWebsiteDialog(false);
      }
    } catch (error) {
      // Show error message but keep modal open for update operations
      toast.error(error.response?.data?.message || "Failed to update record");
      // Don't close modal on error - let user fix the issue and try again
      // Only clear the error state, but keep edit state intact
    } finally {
      setIsLoading(false);
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
      toast.error(error.response.data.message || "Failed to delete record. Please try again.");
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
        <p className="text-muted-foreground">Please select a report to view its details</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
        <Card className="bg-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="text-base pb-2 font-medium text-scale-700">Total Publications</div>
              <div className="text-2xl sm:text-4xl font-semibold flex flex-col xl:flex-row items-start xl:items-end gap-2 text-slate-800">
                {report.total_outlets || 0}
                <p className="text-sm font-medium text-slate-500 mb-1">/ Media outlets</p>
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

        <Card className="bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="text-base pb-2 font-medium text-slate-700">Total Reach</div>
              <div className="text-2xl sm:text-3xl font-semibold flex flex-col xl:flex-row  items-start xl:items-end gap-2 text-slate-800">
                {formatNumber(report.total_semrush_traffic)}
                <p className="text-sm font-medium text-slate-500 mb-1">/ Potential audience</p>
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

        <Card className="bg-lime-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="text-base pb-2 font-medium text-slate-700">Report Status</div>
              <div className="flex flex-col xl:flex-row items-start xl:items-end gap-2 text-slate-800">
                <Badge
                  className="capitalize text-[#65A30D] bg-[#65A30D1A] py-2 px-3 text-sm"
                  variant={report.status === "completed" ? "green" : "secondary"}
                >
                  {report?.status || "Completed"}
                </Badge>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {report?.date_created ? `Created ${formatDate(report.date_created)}` : "/ Distribution complete"}
                </p>
              </div>
            </CardTitle>
            <div className="relative">
              <div className="m-0 p-3.5 rounded-lg flex items-center justify-center">
                <FileSpreadsheetIcon className="text-lime-600 w-[50px] h-[50px]" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Media Outlets Table */}
      <Card className="mt-4 ">
        <CardHeader className="sticky top-0 z-10 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <p className={`${isPublic && "xl:inline-block"} hidden`}>PR Report :</p>
              <span className="block text-indigo-500 max-w-[294px] truncate overflow-hidden">{report.title}</span>
            </CardTitle>
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <SearchInput
                    placeholder="Search outlets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm("")}
                    className="min-w-[100%] md:min-w-[300px]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* <button
                  onClick={() => handleDownload("badge")}
                  className="px-4 py-2.5 text-sm border font-semibold border-slate-200 rounded-3xl flex items-center gap-2 transition-colors  text-slate-600"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden xl:inline-block">Create badge</span>
                </button> */}
                {!isPublic && (
                  <button
                    onClick={handleAddOutlet}
                    className="px-4 py-2.5 text-sm border font-semibold border-slate-300 rounded-3xl flex items-center gap-2 transition-colors text-slate-600  hover:text-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden xl:inline-block">Add</span>
                  </button>
                )}
                <button
                  onClick={() => handleDownload("csv")}
                  className="px-4 py-2.5 text-sm border font-semibold rounded-3xl flex items-center gap-2 transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden xl:inline-block">CSV</span>
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={isGeneratingPDF}
                  className={`px-4 py-2.5 text-sm border font-semibold rounded-3xl flex items-center gap-2 transition-colors bg-indigo-600 hover:bg-indigo-700 text-white ${
                    isGeneratingPDF ? "opacity-50 cursor-not-allowed bg-none" : ""
                  }`}
                >
                  {isGeneratingPDF ? (
                    <Loading size="sm" color="white" showText={true} text="PDF" textColor="white" />
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
                    className="px-4 py-2.5 text-sm border font-semibold rounded-3xl flex items-center gap-2 transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
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
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="w-full">
                    <TableHead className="w-[200px]">Outlet</TableHead>
                    <TableHead className="min-w-[400px]">Website</TableHead>
                    <TableHead className="w-[160px]">Potential Reach</TableHead>
                    {!isPublic && <TableHead className="w-[100px]">Actions</TableHead>}
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
                    const tooltipPosition = index === filteredOutlets.length - 1 ? "top" : "top";

                    return (
                      <TableRow key={index}>
                        <TableCell className="flex items-center gap-3 max-w-[200px]">
                          <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
                            <WebsiteIcon
                              logoFilename={outlet.logo}
                              websiteName={outletWithId.website_name}
                              size="default"
                              alt={outlet.website_name || "Media outlet logo"}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground min-w-[400px]">
                          <div>
                            <div className="truncate max-w-[380px]" title={outlet.website_name}>
                              {outlet.website_name}
                            </div>
                            <URLTableCell
                              url={outlet.published_url}
                              textMaxWidth="max-w-[300px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[650px] 2xl:max-w-[900px]"
                              textColor="text-indigo-500"
                              iconSize="h-4 w-4"
                              iconColor="text-indigo-500"
                            />
                          </div>
                        </TableCell>

                        <TableCell className="font-medium min-w-[160px]">
                          {formatNumber(outlet?.semrush_traffic)}
                        </TableCell>

                        {!isPublic && (
                          <TableCell className="font-medium w-[100px]">
                            <div className="pl-2 flex gap-8 items-center">
                              <CustomTooltip content="Edit" position={tooltipPosition}>
                                <button
                                  onClick={() => handleEdit(outlet)}
                                  className="text-slate-600 flex text-sm font-medium"
                                >
                                  <PencilLine className="w-4 h-4" />
                                </button>
                              </CustomTooltip>
                              <CustomTooltip content="Delete" position={tooltipPosition}>
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
            <div className="text-center py-6 mx-6">
              <p className="text-muted-foreground">No outlets found matching "{searchTerm}"</p>
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
        loading={isLoading}
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
          itemName={outletToDelete?.website_name || outletToDelete?.published_url || "this outlet"}
          warningText="If you Delete this outlet, it will be permanently removed."
        />
      )}
    </div>
  );
};

export default PRReportViewer;
