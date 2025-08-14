"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Download,
  ExternalLink,
  Eye,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { prReportsService } from "../../../services/prReports";
import { toast } from "sonner";
import SimpleRouteGuard from "@/components/SimpleRouteGuard";
import { useAuth } from "@/lib/auth";
import PRReportViewer from "@/components/PRReportViewer";

export default function ViewPR() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reportId = params.id || searchParams.get("id");
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single optimized function to fetch report data
  const fetchReportData = async () => {
    if (!reportId) {
      setError("Invalid report ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (user) {
        // Fetch the report data once
        const response = await prReportsService.getReportGroup(reportId);

        if (response) {
          // Transform the API response to match the expected format for PRReportViewer
          const transformedData = {
            id: response.grid_id || reportId,
            title: response.report_title || "PR Report",
            total_outlets: response.total_records || 0,
            total_reach: response.overallPotentialReach || 0,
            status: "completed",
            date_created: response.createdAt || new Date().toISOString(),
            visibility: "public",
            outlets: (response.distribution_data || []).map((item) => ({
              website_name: item.recipient || "Unknown Outlet",
              published_url: item.url || "",
              potential_reach: item.potential_reach || 0,
            })),
          };

          setReport(transformedData);
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setError("Failed to load report. Please try again.");
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const response = await prReportsService.exportCSV(reportId);

      // Create and download the CSV file
      const blob = new Blob([response.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.filename || `pr-report-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
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

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString();
  };

  // Fetch report on mount - only once
  useEffect(() => {
    fetchReportData();
  }, [reportId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full border-b-2 border-purple-600 h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto ">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Report
            </h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SimpleRouteGuard requireAuth={true}>
      {/* <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {report && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {report.report_title || "Untitled Report"}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>ID: {report.grid_id}</span>
                    <span>Created: {formatDate(report.createdAt)}</span>
                    <span>Status: {report.status}</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <Eye className="w-3 h-3 mr-1" />
                      Public
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {formatNumber(report.total_records)}
                  </div>
                  <div className="text-sm text-blue-700">Total Links</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {formatNumber(report.overallPotentialReach)}
                  </div>
                  <div className="text-sm text-green-700">Potential Reach</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {report.uploaded_by?.name || "Anonymous"}
                  </div>
                  <div className="text-sm text-purple-700">Uploaded By</div>
                </div>
              </div>
            </div>
          )}

          {reportData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Distribution Data
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exchange Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Potential Reach
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        About
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.distribution_data?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.exchange_symbol || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.recipient || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Link
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(item.potential_reach)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {item.about || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.value || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!reportData && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600">
                This report doesn't contain any distribution data.
              </p>
            </div>
          )}

          {report && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Report Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Report ID:</span>
                  <span className="ml-2 text-gray-600">{report.grid_id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(report.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-600">{report.status}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Uploaded By:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {report.uploaded_by?.name || "Anonymous"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Total Records:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {formatNumber(report.total_records)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Potential Reach:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {formatNumber(report.overallPotentialReach)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div> */}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              View PR Report
            </h1>
            <p className="text-muted-foreground">
              This is a shared press release distribution report
            </p>
          </div>

          {/* Email Dialog for Private Reports */}

          {report && <PRReportViewer report={report} isShowButton={true} />}
        </div>
      </div>
    </SimpleRouteGuard>
  );
}
