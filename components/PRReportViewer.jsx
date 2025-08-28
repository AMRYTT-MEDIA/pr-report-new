import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TotalPublicationIcon,
  TotalReachIcon,
  StatusIcon,
} from "@/components/icon";
import { Button } from "@/components/ui/button";
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
  ExternalLink,
  Download,
  Eye,
  BarChart3,
  Share2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.jsx";
import { pdf } from "@react-pdf/renderer";
import { logoMap, logoMapping, orderMapping } from "@/utils/logoMapping";
import React from "react";
import Image from "next/image";
import { prReportsService } from "@/services/prReports";
import ShareDialogView from "@/components/ShareDialogView";
import URLTableCell from "@/components/URLTableCell";
import PRReportPDF from "./PRReportPDF";

// PDF Loading Component
const PDFLoadingComponent = () => (
  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg  border-blue-200">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    Pdf
  </div>
);

const PRReportViewer = ({
  report,
  loading = false,
  onShare,
  isShowButton = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState(new Set());
  const [imageLoading, setImageLoading] = useState(new Set());
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // Optimized logo lookup to prevent lag
  const getLogoUrl = (outletName) => {
    // Check if we have a logo for this outlet
    const logoPath = logoMapping[outletName];
    if (logoPath) {
      // Only return the path if it's a valid format and likely exists
      if (logoPath.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        return logoPath;
      }
      // Silently skip invalid logo formats
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
        const pdfBlob = await pdf(
          <PRReportPDF report={report} formatData={processedOutlets} />
        ).toBlob();

        downloadFile(
          pdfBlob,
          `PR_Report_${report.id || "report"}.pdf`,
          "application/pdf"
        );
        toast.success("PDF download started");
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
      toast.success("CSV download started");
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
    const headers = ["Outlet", "Website", "Published URL", "Potential Reach"];
    // Use formatData for consistent ordering in CSV (same order as displayed in UI)
    const outletsToUse = formatData || report.outlets || [];
    const rows = outletsToUse.map((outlet) => [
      outlet.website_name,
      outlet.website_name,
      outlet.published_url,
      outlet.potential_reach || 0,
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

    // Create a map from website_name to its order index, if present in orderMapping
    const orderIndex = Object.entries(orderMapping).reduce(
      (acc, [key, value], idx) => {
        acc[value] = idx;
        return acc;
      },
      {}
    );

    // Map and format the outlets
    const formatted = report.outlets.map((outlet) => ({
      ...outlet,
      original_website_name: outlet.website_name, // Preserve original for logo mapping
      website_name:
        orderMapping[outlet.website_name] || outlet.website_name || "Unknown",
    }));

    // Sort by orderMapping order if present, otherwise keep at the end
    const sorted = formatted.sort((a, b) => {
      const aIdx = orderIndex[a.website_name];
      const bIdx = orderIndex[b.website_name];
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
  }, [formatData, debouncedSearchTerm]);

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
    <div className="space-y-6">
      {/* Report Header */}
      {/* <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <CardDescription>
                Press Release Distribution Report •{" "}
                {formatDate(report.date_created)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card> */}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-[16px] font-medium text-blue-500">
              Total Publications
            </CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <TotalPublicationIcon
                color="#6366F1"
                width={16}
                height={16}
                className="sm:w-5 sm:h-5"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {report.total_outlets || 0}
            </div>
            <p className="text-xs text-muted-foreground">Media outlets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-[16px] font-medium text-blue-500">
              Total Reach
            </CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <StatusIcon
                color="#6366F1"
                width={16}
                height={16}
                className="sm:w-5 sm:h-5"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {formatNumber(report.total_semrush_traffic)}
            </div>
            <p className="text-xs text-muted-foreground">Potential audience</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-[16px] font-medium text-blue-500">
              Report Status
            </CardTitle>
            <div className="relative">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-100 active:bg-blue-200 transition-colors">
                    <TotalReachIcon
                      color="#6366F1"
                      width={16}
                      height={16}
                      className="sm:w-5 sm:h-5"
                    />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-32 p-0" align="center">
                  <div className="p-3">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleDownload("pdf")}
                        disabled={isGeneratingPDF}
                        className={`w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 transition-colors ${
                          isGeneratingPDF ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isGeneratingPDF ? (
                          <PDFLoadingComponent />
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            PDF
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload("csv")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        CSV
                      </button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge
              variant={report.status === "completed" ? "green" : "secondary"}
            >
              {report.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {report?.date_created
                ? `Created ${formatDate(report.date_created)}`
                : "Distribution complete"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Media Outlets Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>
              PR Report : Media Outlets ({filteredOutlets.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              {isShowButton && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("csv")}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareDialog(true)}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Report
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search outlets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 lg:w-80 focus:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Outlet</TableHead>
                    <TableHead className="min-w-[400px]">Website</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Potential Reach
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutlets.map((outlet, index) => (
                    <TableRow key={index} className="bg-white">
                      <TableCell className="flex items-center gap-3 h-[72px] min-w-[150px]">
                        {/* Logo Display Logic */}
                        {(() => {
                          const logoUrl = getLogoUrl(
                            outlet.original_website_name || outlet.website_name
                          );
                          const hasValidLogo =
                            logoUrl &&
                            isValidLogoUrl(logoUrl) &&
                            !isImageError(
                              outlet.original_website_name ||
                                outlet.website_name
                            );
                          const isLoading = isImageLoading(
                            outlet.original_website_name || outlet.website_name
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
                                  alt={outlet.website_name}
                                  title={outlet.website_name}
                                  className="max-w-[120px] sm:max-w-[137px] max-h-[38px] object-contain"
                                  onLoadStart={() =>
                                    handleImageStartLoad(
                                      outlet.original_website_name ||
                                        outlet.website_name
                                    )
                                  }
                                  onLoad={() =>
                                    handleImageLoad(
                                      outlet.original_website_name ||
                                        outlet.website_name
                                    )
                                  }
                                  onError={() =>
                                    handleImageError(
                                      outlet.original_website_name ||
                                        outlet.website_name
                                    )
                                  }
                                  loading="lazy"
                                  height={38}
                                  width={137}
                                  // Add error handling for missing images
                                  onErrorCapture={() =>
                                    handleImageError(
                                      outlet.original_website_name ||
                                        outlet.website_name
                                    )
                                  }
                                />
                              </div>
                            );
                          }

                          // Show circular first character fallback (always available)
                          const firstChar = outlet.website_name
                            .charAt(0)
                            .toUpperCase();
                          const colorClasses = [
                            "text-blue-700 border-blue-300 bg-blue-50",
                            "text-green-700 border-green-300 bg-green-50",
                            "text-purple-700 border-purple-300 bg-purple-50",
                            "text-orange-700 border-orange-300 bg-orange-50",
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
                            textMaxWidth="max-w-[650px]"
                            textColor="text-blue-600"
                            iconSize="h-4 w-4"
                            iconColor="text-blue-600"
                          />
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-medium min-w-[120px]">
                        {formatNumber(outlet?.semrush_traffic)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredOutlets.length === 0 && searchTerm && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No outlets found matching "{searchTerm}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialogView
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false);
          }}
          report={report}
          onShare={handleShareReport}
        />
      )}
    </div>
  );
};

export default PRReportViewer;
