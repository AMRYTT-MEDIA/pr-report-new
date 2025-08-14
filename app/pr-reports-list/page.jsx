"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Upload,
  Eye,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Share2,
  Trash2,
  FileText,
} from "lucide-react";
import { prReportsService } from "../../services/prReports";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ShareDialog from "../../components/ShareDialog";
import SimpleRouteGuard from "@/components/SimpleRouteGuard";

export default function PRReportsList() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const sort = searchParams.get("sort") || "createdAt:asc";

  // Local state
  const [searchQuery, setSearchQuery] = useState(q);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [sortField, setSortField] = useState(sort.split(":")[0]);
  const [sortOrder, setSortOrder] = useState(sort.split(":")[1]);

  // Fetch reports
  const fetchReports = async () => {
    // Wait for auth to be ready
    if (authLoading || !user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        q: searchQuery,
        page: currentPage,
        limit: pageSize,
        sort: `${sortField}:${sortOrder}`,
      };

      const response = await prReportsService.getReports(params);
      setReports(response.data || response || []);
      setTotalCount(response.totalCount || response.length || 0);

      // Update URL
      const newSearchParams = new URLSearchParams();
      if (searchQuery) newSearchParams.set("q", searchQuery);
      if (currentPage > 1) newSearchParams.set("page", currentPage.toString());
      if (pageSize !== 10) newSearchParams.set("limit", pageSize.toString());
      if (sort !== "createdAt:desc")
        newSearchParams.set("sort", `${sortField}:${sortOrder}`);

      const newUrl = `/pr-reports-list${
        newSearchParams.toString() ? "?" + newSearchParams.toString() : ""
      }`;
      router.replace(newUrl, { scroll: false });
    } catch (error) {
      setError("Failed to load reports. Please try again.");
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
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
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

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

  // Handle delete report
  const handleDeleteReport = async (report) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        const reportId = report.grid_id || report._id;
        await prReportsService.deleteReport(reportId);

        toast.success("Report deleted successfully!");
        await fetchReports();
      } catch (error) {
        toast.error("Failed to delete report");
      }
    }
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch reports on mount and when dependencies change
  useEffect(() => {
    if (!authLoading && user) {
      fetchReports();
    }
  }, [currentPage, pageSize, sortField, sortOrder, authLoading, user]);

  // Update search when searchQuery changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== q) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Show loading while auth is initializing
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <SimpleRouteGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900">
                  All PR Reports
                </h1>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {totalCount}
                </Badge>
              </div>
              <Button
                onClick={() => router.push("/pr-reports")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 border-orange-500"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </div>
              </div>
              {/* <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(parseInt(e.target.value))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <Button
                  onClick={() => fetchReports()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Refresh
                </Button>
              </div> */}
          {/* </div>
          </div>  */}

          {/* Error State */}
          {/* {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )} */}

          {/* Reports Table */}
          {reports.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 w-full">
                    <tr className="w-full ">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="flex flex-row justify-end pr-20 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr
                        key={report.grid_id || report._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {report.report_title || "Untitled Report"}
                              </p>
                              <p className="text-sm text-gray-500">
                                60 KB of 50 MB
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-medium flex flex-row justify-end items-center">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                router.push(
                                  `/view-pr/${report.grid_id || report._id}`
                                )
                              }
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => openShareDialog(report)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reports yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by uploading your first CSV file to generate a PR
                report.
              </p>
              <button
                onClick={() => router.push("/pr-reports")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {pageSize} of {totalCount} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

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
        </div>
      </div>
    </SimpleRouteGuard>
  );
}
