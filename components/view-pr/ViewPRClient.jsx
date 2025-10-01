"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { prReportsService } from "@/services/prReports";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import PRReportViewer from "@/components/PRReportViewer";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import Loading from "@/components/ui/loading";

export default function ViewPRClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reportId = params.id || searchParams.get("id");
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Set breadcrumb - direct render, no useEffect needed
  useBreadcrumbDirect([
    { name: "All Reports", href: "/pr-reports-list" },
    { name: "View Report", href: `/view-pr/${reportId}`, current: true },
  ]);

  // Single optimized function to fetch report data
  const fetchReportData = async (forceRefresh = false) => {
    if (!reportId) {
      setError("Invalid report ID");
      setLoading(false);
      return;
    }

    // Prevent multiple calls on page refresh
    if (!forceRefresh && hasFetched.current) {
      return;
    }

    setLoading(true);
    setError(null);
    hasFetched.current = true;

    try {
      if (user) {
        // Fetch the report data once (global token management handles auth)
        const response = await prReportsService.getReportGroup(reportId);

        if (response) {
          const transformedData = {
            id: response.grid_id || reportId,
            title: response.report_title || "PR Report",
            total_outlets: response.total_records || 0,
            total_reach: response.overallPotentialReach || 0,
            status: "completed",
            date_created: response.createdAt || new Date().toISOString(),
            visibility: "public",
            total_semrush_traffic: response?.total_semrush_traffic || 0,
            outlets: (response?.distribution_data || []).map((item) => ({
              website_name: item.recipient || item?.name || "Unknown Outlet",
              published_url: item.url || "",
              potential_reach: item.potential_reach || 0,
              semrush_traffic: item?.semrush_traffic || 0,
              _id: item._id || null,
              logo: item?.exchange_symbol || item?.logo || null,
            })),

            sharedEmails: response.sharedEmails || [],
          };

          setReport(transformedData);

          // Update document title with actual report name
          if (transformedData.title && typeof window !== "undefined") {
            document.title = `${transformedData.title} | PR Reports`;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      setError("Failed to load report. Please try again.");
      toast.error("Failed to load report");
      hasFetched.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch report on mount - only once
  useEffect(() => {
    if (reportId && user && !hasFetched.current) {
      fetchReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  useEffect(() => {
    if (user && reportId && !hasFetched.current) {
      fetchReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-86px)] justify-center">
        <Loading size="lg" showText={true} text="Loading..." textColor="black" textPosition="bottom" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Report</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {report && (
        <div className="max-w-[1270px] mx-auto">
          <PRReportViewer report={report} isPublic={false} fetchReportData={() => fetchReportData(true)} />
        </div>
      )}
    </div>
  );
}
