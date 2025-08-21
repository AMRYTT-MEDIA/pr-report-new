import { useMemo, useState } from "react";
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
import { jsPDF } from "jspdf";
import { logoMap, logoMapping } from "@/utils/logoMapping";
import React from "react";
import Image from "next/image";
import { prReportsService } from "@/services/prReports";
import ShareDialogView from "@/components/ShareDialogView";
import ShareDialog from "./ShareDialog";

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

  // Debounce search term to prevent excessive filtering
  React.useEffect(() => {
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
      if (logoPath.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
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
    if (!url.match(/\.(png|jpg|jpeg|gif|svg)$/i)) return false;

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

  const handleDownload = (format) => {
    if (format === "pdf") {
      // Generate PDF content using jsPDF
      const pdfBlob = generatePDFContent(report);
      downloadFile(
        pdfBlob,
        `PR_Report_${report.id || "report"}.pdf`,
        "application/pdf"
      );
      toast.success("PDF download started");
    } else if (format === "csv") {
      // Generate CSV content
      const csvContent = generateCSVContent(report);
      downloadFile(
        csvContent,
        `PR_Report_${report.id || "report"}.csv`,
        "text/csv"
      );
      toast.success("CSV download started");
    }
  };

  const generatePDFContent = (report) => {
    // Create a new PDF document
    const doc = new jsPDF();

    // Set font and size
    doc.setFont("helvetica");
    doc.setFontSize(20);

    // Add title
    doc.text("PR Report", 20, 30);

    // Add separator line
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Add report details
    doc.setFontSize(12);
    doc.text(`Total Publications: ${report.total_outlets || 0}`, 20, 50);
    doc.text(`Total Reach: ${formatNumber(report.total_reach)}`, 20, 60);
    doc.text(`Status: ${report.status}`, 20, 70);

    // Add media outlets table section
    doc.setFontSize(14);
    doc.text("Media Outlets:", 20, 90);

    if (report.outlets && report.outlets.length > 0) {
      // Table headers
      const headers = ["Outlet", "Website", "Published URL", "Potential Reach"];
      const columnWidths = [40, 40, 60, 35];
      const startX = 20;
      let startY = 110;

      // Draw table headers
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");

      let currentX = startX;
      headers.forEach((header, index) => {
        doc.text(header, currentX, startY);
        currentX += columnWidths[index];
      });

      // Draw header separator line
      startY += 5;
      doc.line(startX, startY, startX + 175, startY);
      startY += 10;

      // Draw table rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      report.outlets.forEach((outlet, index) => {
        // Check if we need a new page
        if (startY > 250) {
          doc.addPage();
          startY = 20;

          // Redraw headers on new page
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          currentX = startX;
          headers.forEach((header, headerIndex) => {
            doc.text(header, currentX, startY);
            currentX += columnWidths[headerIndex];
          });
          startY += 15;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
        }

        // Draw row data
        currentX = startX;

        // Outlet name (truncate if too long)
        let outletName = outlet.website_name;
        if (outletName.length > 20) {
          outletName = outletName.substring(0, 17) + "...";
        }
        doc.text(outletName, currentX, startY);
        currentX += columnWidths[0];

        // Website name (truncate if too long)
        let websiteName = outlet.website_name;
        if (websiteName.length > 20) {
          websiteName = websiteName.substring(0, 17) + "...";
        }
        doc.text(websiteName, currentX, startY);
        currentX += columnWidths[1];

        // Published URL (truncate if too long)
        let url = outlet.published_url;
        if (url.length > 30) {
          url = url.substring(0, 27) + "...";
        }
        doc.text(url, currentX, startY);
        currentX += columnWidths[2];

        // Potential Reach
        doc.text(formatNumber(outlet.potential_reach || 0), currentX, startY);

        // Draw row separator line
        startY += 5;
        doc.line(startX, startY, startX + 175, startY);
        startY += 10;
      });
    } else {
      doc.setFontSize(10);
      doc.text("No outlets available", 25, 110);
    }

    // Return the PDF as a blob
    return doc.output("blob");
  };

  const generateCSVContent = (report) => {
    const headers = ["Outlet", "Website", "Published URL", "Potential Reach"];
    const rows =
      report.outlets?.map((outlet) => [
        outlet.website_name,
        outlet.website_name,
        outlet.published_url,
        outlet.potential_reach || 0,
      ]) || [];

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

  // Simple filtered outlets without useMemo to prevent performance issues
  const filteredOutlets =
    report?.outlets?.filter(
      (outlet) =>
        outlet.website_name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        outlet.published_url
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
    ) || [];

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
              {formatNumber(report.total_reach)}
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
                <HoverCardContent className="w-48 p-0" align="center">
                  <div className="p-3">
                    <div className="space-y-1">
                      <button
                        onClick={() => handleDownload("pdf")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        PDF
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
                    <TableHead className="min-w-[200px]">Website</TableHead>
                    <TableHead className="min-w-[250px]">
                      Published URL
                    </TableHead>
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
                          const logoUrl = getLogoUrl(outlet.website_name);
                          const hasValidLogo =
                            logoUrl &&
                            isValidLogoUrl(logoUrl) &&
                            !isImageError(outlet.website_name);
                          const isLoading = isImageLoading(outlet.website_name);

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
                                  className="max-w-[120px] sm:max-w-[137px] max-h-[38px] object-contain"
                                  onLoadStart={() =>
                                    handleImageStartLoad(outlet.website_name)
                                  }
                                  onLoad={() =>
                                    handleImageLoad(outlet.website_name)
                                  }
                                  onError={() =>
                                    handleImageError(outlet.website_name)
                                  }
                                  loading="lazy"
                                  height={38}
                                  width={137}
                                  // Add error handling for missing images
                                  onErrorCapture={() =>
                                    handleImageError(outlet.website_name)
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
                      <TableCell className="text-muted-foreground min-w-[200px]">
                        <div
                          className="max-w-[180px] truncate"
                          title={outlet.website_name}
                        >
                          {outlet.website_name}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[250px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-primary hover:underline text-left"
                          onClick={() =>
                            window.open(outlet.published_url, "_blank")
                          }
                        >
                          <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">View Article</span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right font-medium min-w-[120px]">
                        {formatNumber(outlet.potential_reach)}
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
