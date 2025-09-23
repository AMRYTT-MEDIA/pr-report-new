import { publicPrReportsService } from "@/services/publicPrReports";
import { ReportPageClient } from "@/components/report";
import { verifyEmailAndGetReport } from "@/components/report/actions";

// Cache configuration - revalidate every 5 minutes (300 seconds)
export const revalidate = 3600;

// Server-side data fetching function
async function getReportData(reportId) {
  try {
    // First verify URL access
    const verifyResponse = await publicPrReportsService.verifyUrlAccess(
      reportId
    );

    if (!verifyResponse.success || verifyResponse.data.verify !== true) {
      return {
        error: "Report not found or access denied",
        isPrivate: false,
        report: null,
      };
    }

    // Check if it's a private report
    if (verifyResponse.data.is_private === true) {
      return {
        error: null,
        isPrivate: true,
        report: null,
      };
    }

    // For public reports, get the actual report data
    const reportResponse = await publicPrReportsService.getReportData(reportId);

    if (!reportResponse.success) {
      return {
        error: "Failed to load report data",
        isPrivate: false,
        report: null,
      };
    }

    // Transform the API response to match the component's expected structure
    const transformedData = {
      id: reportId,
      title: reportResponse.data.report_title || "PR Report",
      total_outlets: reportResponse.data.total_records || 0,
      total_reach: reportResponse.data.overallPotentialReach || 0,
      status: "completed",
      date_created: new Date().toISOString(),
      visibility: "public",
      total_semrush_traffic: reportResponse?.data?.total_semrush_traffic || 0,
      outlets: (reportResponse.data.distribution_data || []).map((item) => ({
        website_name: item.recipient || item?.name || "Unknown Outlet",
        published_url: item.url || "",
        potential_reach: item.potential_reach || 0,
        semrush_traffic: item?.semrush_traffic || 0,
        logo: item?.exchange_symbol || item?.logo || null,
      })),
    };

    return {
      error: null,
      isPrivate: false,
      report: transformedData,
    };
  } catch (error) {
    console.error("Error fetching report data:", error);
    return {
      error: "Error loading report data",
      isPrivate: false,
      report: null,
    };
  }
}

// Dynamic metadata generation
export async function generateMetadata({ params }) {
  const reportId = params.id;

  try {
    // Try to get report data for dynamic title
    const response = await publicPrReportsService.verifyUrlAccess(reportId);

    if (response?.success && response?.data?.verify === true) {
      // Check if it's a public report (no email required)
      if (response?.data?.is_private !== true) {
        // For public reports, try to get the actual report data
        try {
          const reportData = await publicPrReportsService.getReportData(
            reportId
          );
          const reportTitle = reportData?.data?.report_title || "PR Report";

          return {
            title: `${reportTitle}`,
            description: `View the comprehensive press release distribution report for ${reportTitle} with detailed analytics, reach metrics, and publication outlets.`,
            robots: {
              index: false,
              follow: false,
            },
          };
        } catch (error) {
          // If we can't get report data, use default
        }
      } else {
        // For private reports, we can't get the name without email verification
        // So we use a generic title that will be updated client-side after verification
        return {
          // title: "Private PR Report",
          description:
            "Access your private press release distribution report. Email verification required.",
          robots: {
            index: false,
            follow: false,
          },
        };
      }
    }
  } catch (error) {
    // If verification fails, use default metadata
  }

  // Default fallback metadata
  return {
    title: "PR Report",
    description:
      "View your comprehensive press release distribution report with detailed analytics, reach metrics, and publication outlets.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ReportPage({ params }) {
  const reportId = params.id;

  // Fetch data server-side
  const { error, isPrivate, report } = await getReportData(reportId);

  return (
    <ReportPageClient
      reportId={reportId}
      initialReport={report}
      isPrivate={isPrivate}
      error={error}
      verifyEmailAndGetReport={verifyEmailAndGetReport}
    />
  );
}
