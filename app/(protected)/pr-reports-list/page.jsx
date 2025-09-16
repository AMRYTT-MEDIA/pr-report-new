"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Share2, Trash2, File } from "lucide-react";
import { prReportsService } from "@/services/prReports";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/view-reports";
import { useAuth } from "@/lib/auth";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import ShareDialog from "@/components/ShareDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImportIcon, NoDataFound, PrivateShare } from "@/components/icon";
import Pagination from "@/components/Pagination";
import ImportCsvDialog from "@/components/pr-reports/ImportCsvDialog";
import Loading from "@/components/ui/loading";
import CustomTooltip from "@/components/ui/custom-tooltip";

export default function PRReportsList() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingReports, setDeletingReports] = useState(new Set());
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Add refs to prevent duplicate API calls
  const isFetching = useRef(false);
  const hasInitialFetch = useRef(false);

  // URL state
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 25;
  const sort = searchParams.get("sort") || "createdAt:asc";

  // Local state
  const [searchQuery, setSearchQuery] = useState(q);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [sortField, setSortField] = useState(sort.split(":")[0]);
  const [sortOrder, setSortOrder] = useState(sort.split(":")[1]);

  // Fetch reports
  const fetchReports = async () => {
    // Prevent duplicate API calls
    if (isFetching.current) {
      return;
    }

    // Wait for auth to be ready
    if (authLoading || !user) {
      return;
    }

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
        // sort: `${sortField}:${sortOrder}`,
      };

      if (user) {
        const response = await prReportsService.getReports(params);
        if (response) {
          setReports(response.data || response || []);
          setTotalCount(response.totalCount || response.length || 0);
        }
      } else {
        console.log("error");
      }

      // Update URL
      const newSearchParams = new URLSearchParams();
      if (searchQuery) newSearchParams.set("q", searchQuery);
      if (currentPage > 1) newSearchParams.set("page", currentPage);
      if (pageSize !== 25) newSearchParams.set("limit", pageSize);
      if (sort !== "createdAt:desc")
        newSearchParams.set("sort", `${sortField}:${sortOrder}`);

      const newUrl = `/pr-reports-list`;
      router.replace(newUrl, { scroll: false });
    } catch (error) {
      setError("Failed to load reports. Please try again.");
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchReports();
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Handle sorting
  // const handleSort = (field) => {
  //   if (sortField === field) {
  //     setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortField(field);
  //     setSortOrder("asc");
  //   }
  // };

  // Handle share report
  const handleShareReport = async (payload) => {
    try {
      const reportId = selectedReport.grid_id || selectedReport._id;
      await prReportsService.shareReport(
        reportId,
        payload.is_private,
        payload.sharedEmails || []
      );

      // Refresh the reports list
      await fetchReports();

      toast.success("Report shared successfully!");
    } catch (error) {
      toast.error("Failed to share report");
    }
  };

  // Open share dialog
  const openShareDialog = (report) => {
    setSelectedReport(report);
    setShareDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  // Handle delete report
  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    const reportId = reportToDelete.grid_id || reportToDelete._id;
    setDeleteLoading(true);
    setDeletingReports((prev) => new Set(prev).add(reportId));

    try {
      await prReportsService.deleteReport(reportId);

      toast.success("Report deleted successfully!");
      await fetchReports();

      // Close dialog and reset
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    } catch (error) {
      toast.error("Failed to delete report");
    } finally {
      setDeleteLoading(false);
      setDeletingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "N/A";
    }
  };

  // Format title with truncation
  const formatTitle = (title, maxLength = 50) => {
    if (!title) return "Untitled Report";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Check if title needs truncation
  const needsTruncation = (title, maxLength = 50) => {
    return title && title.length > maxLength;
  };

  // Get status color
  // const getStatusColor = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case "completed":
  //       return "bg-green-100 text-green-800";
  //     case "processing":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "failed":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // Direct render - no useEffect needed
  useBreadcrumbDirect([
    { name: "All Reports", href: "/pr-reports-list", current: true },
  ]);

  // Fetch reports on mount and when dependencies change
  useEffect(() => {
    if (!authLoading && user && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchReports();
    }
  }, [authLoading, user]); // Only run when auth state changes

  // Separate effect for pagination/sorting changes
  useEffect(() => {
    if (!authLoading && user && hasInitialFetch.current) {
      fetchReports();
    }
  }, [currentPage, pageSize, sortField, sortOrder]); // Only run when these specific values change

  // Cleanup function to reset refs when component unmounts
  useEffect(() => {
    return () => {
      isFetching.current = false;
      hasInitialFetch.current = false;
    };
  }, []);

  // Update search when searchQuery changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== q && hasInitialFetch.current) {
        setCurrentPage(1); // Reset to first page when searching
        fetchReports();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, q]); // Added q to dependencies

  // Show loading while auth is initializing
  if (authLoading || loading) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-86px)] justify-center">
        <Loading
          size="lg"
          color="purple"
          showText={true}
          text="Loading..."
          textColor="black"
          textPosition="bottom"
        />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto">
        <div className="bg-white shadow-sm border rounded-lg border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                All PR Reports
              </h1>
              <div className="text-sm text-primary-60 px-3 py-0.5 border border-primary-60 rounded-full">
                {totalCount}
              </div>
            </div>
            <Button
              onClick={() => setImportDialogOpen(true)}
              className="text-white px-6 py-3 flex items-center gap-2 bg-primary-50 rounded-3xl"
            >
              <ImportIcon color="#fff" width={20} height={20} />
              <span className="hidden sm:inline">Import</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            {/* Table Section */}
            <div className="max-h-[calc(100dvh-300px)] lg:max-h-[calc(100dvh-230px)] overflow-y-auto scrollbar-custom">
              <table className="w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-50 w-full">
                  <tr className="w-full ">
                    <th className="px-6 py-4 text-left text-sm font-semibold w-[60%] min-w-[220px]">
                      Full Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold w-[20%]">
                      Created by
                    </th>
                    <th className="px-6 py-3  whitespace-nowrap text-sm font-semibold text-left w-[15%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                {reports?.length > 0 && (
                  <tbody className="bg-white divide-y divide-gray-200 max-h-[368px] 2xl:max-h-[368px] 3xl:max-h-[580px] overflow-y-auto">
                    {reports.map((report, index) => {
                      const tooltipPosition =
                        reports?.length === index + 1 ? "top" : "bottom";
                      return (
                        <tr
                          key={report.grid_id || report._id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <p className="text-[10px] font-medium text-white bg-primary rounded px-1 pt-0 absolute top-4 right-4">
                                  CSV
                                </p>
                                <File className="w-10 h-10 text-gray-scale-20" />
                              </div>
                              {/* <div className="text-base font-medium text-gray-scale-60 truncate max-w-[200px] lg:max-w-[230px] xl:max-w-[500px] 2xl:max-w-[700px] 3xl:max-w-[900px]">
                            {report?.report_title}
                          </div> */}
                              <div className="flex-1 min-w-0">
                                {needsTruncation(report.report_title) ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="text-sm font-medium text-gray-scale-60 truncate cursor-help">
                                          {formatTitle(report.report_title)}
                                        </p>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        className="max-w-sm bg-gray-900 text-white border-gray-700"
                                        side="top"
                                        align="start"
                                      >
                                        <div className="break-words">
                                          {report?.report_title}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <p className="text-sm font-medium text-gray-scale-60">
                                    {report?.report_title || "Untitled Report"}
                                  </p>
                                )}
                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                  <TooltipProvider>
                                    <Tooltip>
                                      {/* <TooltipTrigger asChild>
                                    <div
                                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-help ${
                                        report.is_private
                                          ? "bg-red-100 text-red-800 border border-red-200"
                                          : "bg-green-100 text-green-800 border border-green-200"
                                      }`}
                                    >
                                      {report.is_private ? (
                                        <Lock className="w-3 h-3 mr-1.5" />
                                      ) : (
                                        <Globe className="w-3 h-3 mr-1.5" />
                                      )}
                                      {report.is_private ? "Private" : "Public"}
                                    </div>
                                  </TooltipTrigger> */}
                                      <TooltipContent
                                        className="max-w-sm bg-gray-900 text-white border-gray-700"
                                        side="top"
                                        align="start"
                                      >
                                        <div className="text-center">
                                          <p className="font-medium mb-1">
                                            {report.is_private
                                              ? "🔒 Private Report"
                                              : "🌐 Public Report"}
                                          </p>
                                          <p className="text-sm text-gray-300">
                                            {report.is_private
                                              ? "Only you and people you specifically share with can view this report."
                                              : "Anyone with the link can view this report."}
                                          </p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <p className="text-sm text-gray-scale-60 font-semibold mb-1">
                              {report?.uploaded_by?.name || "-"}
                            </p>
                            <p className="text-gray-scale-50 text-nowrap font-medium text-sm">
                              {formatDate(report?.createdAt || "-")}
                            </p>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap gap-5 sm:gap-7 text-sm font-medium flex flex-row items-center h-[70px]">
                            <CustomTooltip
                              content="View"
                              position={tooltipPosition}
                            >
                              <button
                                onClick={() =>
                                  router.push(
                                    `/view-pr/${report.grid_id || report._id}`
                                  )
                                }
                                className="text-gray-scale-60 hover:text-gray-scale-80"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </CustomTooltip>
                            <CustomTooltip
                              content="Share"
                              position={tooltipPosition}
                            >
                              <button
                                onClick={() => openShareDialog(report)}
                                className="text-gray-scale-60 hover:text-gray-scale-80"
                              >
                                {report?.is_private &&
                                (report?.sharedEmails?.length ?? 0) > 0 ? (
                                  <PrivateShare width={18} height={18} />
                                ) : (
                                  <Share2 className="w-4 h-4" />
                                )}
                              </button>
                            </CustomTooltip>
                            <CustomTooltip
                              content="Delete"
                              position={tooltipPosition}
                            >
                              <button
                                onClick={() => openDeleteDialog(report)}
                                disabled={deletingReports.has(
                                  report.grid_id || report._id
                                )}
                                className="text-danger-60 hover:text-danger-50"
                              >
                                {deletingReports.has(
                                  report.grid_id || report._id
                                ) ? (
                                  <Loading size="sm" color="danger" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </CustomTooltip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
            {reports?.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[368px] 2xl:min-h-[368px] 3xl:min-h-[580px] w-full border-t border-gray-200">
                <div className="flex flex-col items-center justify-center gap-2">
                  <NoDataFound />
                  <p className="text-gray-scale-80 text-sm font-semibold">
                    No Data Found...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            totalItems={totalCount}
            currentPage={currentPage}
            rowsPerPage={pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handlePageSizeChange}
          />
        </div>

        {/* Share Dialog */}
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setSelectedReport(null);
          }}
          report={selectedReport}
          onShare={handleShareReport}
        />

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && reportToDelete && (
          <DeleteDialog
            open={deleteDialogOpen}
            onClose={closeDeleteDialog}
            onConfirm={handleDeleteReport}
            loading={deleteLoading}
            itemName={reportToDelete.report_title || "this report"}
            warningText="If you Delete this Report, it will be permanently removed."
          />
        )}
      </div>

      {/* Import CSV Dialog */}
      <ImportCsvDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onUploadSuccess={(response) => {
          // Refresh the reports list after successful upload
          fetchReports();
        }}
      />
    </div>
  );
}
