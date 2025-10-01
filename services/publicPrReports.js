import { publicApiGet, publicApiPost } from "./publicApi";

// Public PR Reports API service (no authentication required)
export const publicPrReportsService = {
  // Verify PR report URL access (public)
  verifyUrlAccess: async (gridId, email = null) => {
    return await publicApiGet("/pr-distributions/verifyPRReportUrl", {
      grid_id: gridId,
      email,
    });
  },

  // Get PR report group by grid ID (public)
  getReportGroup: async (gridId) => {
    return await publicApiGet(`/pr-distributions/getPRReportGroupByGridId/${gridId}`);
  },

  // Get PR report data (public)
  getReportData: async (gridId, email = null) => {
    return await publicApiPost("/pr-distributions/getPRReportData", {
      grid_id: gridId,
      email,
    });
  },

  // Share PR report (public - for updating privacy settings)
  shareReport: async (gridId, isPrivate, sharedEmails = []) => {
    // This might require authentication depending on your backend
    // If it does, you can import the regular prReportsService for this function
    return await publicApiPost(`/pr-distributions/sharePRReport/${gridId}`, {
      is_private: isPrivate,
      sharedEmails,
    });
  },

  // Export PR report as CSV (public)
  exportCSV: async (gridId) => {
    return await publicApiGet(`/pr-distributions/exportPRReportCsv/${gridId}`);
  },
};
