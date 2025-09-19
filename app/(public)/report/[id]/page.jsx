import { publicPrReportsService } from "@/services/publicPrReports";
import { ReportPageClient } from "@/components/report";

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

export default function ReportPage() {
  return <ReportPageClient />;
}
