"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Share2, Trash2, File } from "lucide-react";
import { prReportsService } from "@/services/prReports";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/view-reports";
import { useAuth } from "@/lib/auth";
import { canDeleteReports } from "@/lib/rbac";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import ShareDialog from "@/components/ShareDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImportIcon, PrivateShare } from "@/components/icon";
import Pagination from "@/components/Pagination";
import { CommonTable } from "@/components/common";
import ImportCsvDialog from "@/components/pr-reports/ImportCsvDialog";
import Loading from "@/components/ui/loading";
import CustomTooltip from "@/components/ui/custom-tooltip";

export default function PRReportsListClient() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
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
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = parseInt(searchParams.get("limit"), 10) || 25;
  const sort = searchParams.get("sort") || "createdAt:asc";

  // Local state
  const [searchQuery] = useState(q);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [sortField] = useState(sort.split(":")[0]);
  const [sortOrder] = useState(sort.split(":")[1]);

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
        pageSize,
        // sort: `${sortField}:${sortOrder}`,
      };

      if (user) {
        const response = await prReportsService.getReports(params);
        if (response) {
          setReports(response.data || response || []);
          setTotalCount(response.totalCount || response.length || 0);
        }
      } else {
        //empty catch
      }

      // Update URL
      const newSearchParams = new URLSearchParams();
      if (searchQuery) newSearchParams.set("q", searchQuery);
      if (currentPage > 1) newSearchParams.set("page", currentPage);
      if (pageSize !== 25) newSearchParams.set("limit", pageSize);
      if (sort !== "createdAt:desc") newSearchParams.set("sort", `${sortField}:${sortOrder}`);

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

  // Handle search (for future use)
  // const handleSearch = () => {
  //   setCurrentPage(1);
  //   fetchReports();
  // };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Handle share report
  const handleShareReport = async (payload) => {
    try {
      const reportId = selectedReport.grid_id || selectedReport._id;
      await prReportsService.shareReport(reportId, payload.is_private, payload.sharedEmails || []);

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
    return `${title.substring(0, maxLength)}...`;
  };

  // Check if title needs truncation
  const needsTruncation = (title, maxLength = 50) => title && title.length > maxLength;

  // Direct render - no useEffect needed
  useBreadcrumbDirect([{ name: "All Reports", href: "/pr-reports-list", current: true }]);

  // Fetch reports on mount and when dependencies change
  useEffect(() => {
    if (!authLoading && user && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]); // Only run when auth state changes

  // Separate effect for pagination/sorting changes
  useEffect(() => {
    if (!authLoading && user && hasInitialFetch.current) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, sortField, sortOrder]); // Only run when these specific values change

  // Cleanup function to reset refs when component unmounts
  useEffect(
    () => () => {
      isFetching.current = false;
      hasInitialFetch.current = false;
    },
    []
  );

  // Update search when searchQuery changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== q && hasInitialFetch.current) {
        setCurrentPage(1); // Reset to first page when searching
        fetchReports();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, q]); // Added q to dependencies

  // Show loading while auth is initializing
  if (authLoading || loading) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-86px)] justify-center">
        <Loading size="lg" showText={true} text="Loading..." textColor="black" textPosition="bottom" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Define CommonTable columns
  const columns = [
    {
      key: "title",
      label: "Full Name",
      width: "60%",
      render: (value, report) => (
        <div className="flex items-center gap-4">
          <div className="relative">
            <p className="text-[10px] font-medium text-white bg-primary rounded px-1 pt-0 absolute top-4 right-4">
              CSV
            </p>
            <File className="w-10 h-10 text-slate-200" />
          </div>
          <div className="flex-1 min-w-0">
            {needsTruncation(report.report_title) ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium text-slate-600 truncate cursor-help">
                      {formatTitle(report.report_title)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    className="max-w-sm bg-slate-900 text-white border-slate-700"
                    side="top"
                    align="start"
                  >
                    <div className="break-words">{report?.report_title}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className="text-sm font-medium text-slate-600">{report?.report_title || "Untitled Report"}</p>
            )}
            <div className="flex items-center mt-1 text-sm text-slate-500">
              <TooltipProvider>
                <Tooltip>
                  <TooltipContent
                    className="max-w-sm bg-slate-900 text-white border-slate-700"
                    side="top"
                    align="start"
                  >
                    <div className="text-center">
                      <p className="font-medium mb-1">{report.is_private ? "?? Private Report" : "?? Public Report"}</p>
                      <p className="text-sm text-slate-300">
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
      ),
    },
    {
      key: "createdBy",
      label: "Created by",
      width: "20%",
      render: (value, report) => (
        <div>
          <p className="text-sm text-slate-600 font-semibold mb-1">{report?.uploaded_by?.name || "-"}</p>
          <p className="text-slate-500 text-nowrap font-medium text-sm">{formatDate(report?.createdAt || "-")}</p>
        </div>
      ),
    },
  ];

  const headerActions = (
    <Button
      onClick={() => setImportDialogOpen(true)}
      className="text-white px-6 py-3 flex items-center gap-2 bg-indigo-500 rounded-3xl hover:bg-indigo-600"
    >
      <ImportIcon color="#fff" width={20} height={20} />
      <span className="hidden sm:inline">Import</span>
    </Button>
  );

  const paginationComponent = (
    <Pagination
      totalItems={totalCount}
      currentPage={currentPage}
      rowsPerPage={pageSize}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handlePageSizeChange}
    />
  );

  return (
    <>
      <CommonTable
        columns={columns}
        data={reports}
        isLoading={false}
        isLoadingBody={loading}
        title="All PR Reports"
        badgeCount={totalCount}
        headerActions={headerActions}
        headerInnerClassName="flex items-center justify-between"
        showActions={true}
        actionColumnWidth="15%"
        renderActions={(report, index) => {
          const tooltipPosition = reports?.length === index + 1 ? "top" : "bottom";
          return (
            <div className="whitespace-nowrap gap-5 sm:gap-7 text-sm font-medium flex flex-row items-center ">
              <CustomTooltip content="View" position={tooltipPosition}>
                <button
                  onClick={() => router.push(`/view-pr/${report.grid_id || report._id}`)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </CustomTooltip>
              <CustomTooltip content="Share" position={tooltipPosition}>
                <button onClick={() => openShareDialog(report)} className="text-slate-600 hover:text-slate-800">
                  {report?.is_private && (report?.sharedEmails?.length ?? 0) > 0 ? (
                    <PrivateShare width={18} height={18} />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </CustomTooltip>
              {canDeleteReports(user) && (
                <CustomTooltip content="Delete" position={tooltipPosition}>
                  <button
                    onClick={() => openDeleteDialog(report)}
                    disabled={deletingReports.has(report.grid_id || report._id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    {deletingReports.has(report.grid_id || report._id) ? (
                      <Loading size="sm" color="danger" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </CustomTooltip>
              )}
            </div>
          );
        }}
        pagination={paginationComponent}
        noDataText="No Data Found..."
      />

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

      {/* Import CSV Dialog */}
      <ImportCsvDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onUploadSuccess={() => {
          // Refresh the reports list after successful upload
          fetchReports();
        }}
      />
    </>
  );
}
