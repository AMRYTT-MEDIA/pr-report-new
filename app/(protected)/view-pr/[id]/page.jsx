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
import { prReportsService } from "@/services/prReports";
import { toast } from "sonner";

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
        // Fetch the report data once (global token management handles auth)
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
            total_semrush_traffic: response?.total_semrush_traffic || 0,
            outlets: (response.distribution_data || []).map((item) => ({
              website_name: item.recipient || "Unknown Outlet",
              published_url: item.url || "",
              potential_reach: item.potential_reach || 0,
              semrush_traffic: item?.semrush_traffic || 0,
            })),
            sharedEmails: response.sharedEmails || [],
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
      // Export CSV (global token management handles auth)
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
    <div>
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
    </div>
  );
}
