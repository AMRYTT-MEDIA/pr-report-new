"use server";

import { publicPrReportsService } from "@/services/publicPrReports";

// Server action to verify email and load report on the server
export async function verifyEmailAndGetReport(reportId, email) {
  try {
    const verifyResponse = await publicPrReportsService.verifyUrlAccess(
      reportId,
      email
    );

    if (!verifyResponse.success || verifyResponse.data.verify !== true) {
      return { success: false, error: "Email not authorized" };
    }

    const reportResponse = await publicPrReportsService.getReportData(
      reportId,
      email
    );

    if (!reportResponse.success) {
      return { success: false, error: "Failed to load report data" };
    }

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

    return { success: true, report: transformedData };
  } catch (error) {
    return { success: false, error: error.response.data.message };
  }
}
