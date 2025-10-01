import { publicApiGet, publicApiPost } from "./publicApi";

// Public PR Reports API service (no authentication required)
export const publicPrReportsService = {
  // Verify PR report URL access (public)
  verifyUrlAccess: (gridId, email = null) =>
    publicApiGet("/pr-distributions/verifyPRReportUrl", {
      grid_id: gridId,
      email,
    }),

  // Get PR report group by grid ID (public)
  getReportGroup: (gridId) => publicApiGet(`/pr-distributions/getPRReportGroupByGridId/${gridId}`),

  // Get PR report data (public)
  getReportData: (gridId, email = null) =>
    publicApiPost("/pr-distributions/getPRReportData", {
      grid_id: gridId,
      email,
    }),

  // Share PR report (public - for updating privacy settings)
  shareReport: (gridId, isPrivate, sharedEmails = []) =>
    // This might require authentication depending on your backend
    // If it does, you can import the regular prReportsService for this function
    publicApiPost(`/pr-distributions/sharePRReport/${gridId}`, {
      is_private: isPrivate,
      sharedEmails,
    }),

  // Export PR report as CSV (public)
  exportCSV: (gridId) => publicApiGet(`/pr-distributions/exportPRReportCsv/${gridId}`),
};
