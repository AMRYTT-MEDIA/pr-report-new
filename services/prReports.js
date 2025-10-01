import { apiDelete, apiGet, apiPost, apiPostFormData, apiPut } from "@/lib/api";

// PR Reports API service
export const prReportsService = {
  // Upload CSV file
  uploadCSV: async (file, reportTitle = "") => {
    const formData = new FormData();
    formData.append("csv_file", file);
    if (reportTitle) {
      formData.append("report_title", reportTitle);
    }
    return await apiPostFormData("/pr-distributions/uploadPR", formData);
  },

  // Get PR reports list with pagination, search, and sorting
  getReports: async (params = {}) => {
    const { page = 1, pageSize = 25 } = params;
    return await apiGet("/pr-distributions/getPRReportGroups", {
      page,
      pageSize,
      // sort,
    });
  },

  // Get total count of PR reports
  getPRReportTotalCount: () => apiGet("/pr-distributions/getPRReportTotalCount"),

  // Get PR report by ID
  getReportById: async (reportId) => await apiGet(`/pr-distributions/getPRReportByBatchId/${reportId}`),

  // Get PR report group by grid ID
  getReportGroup: async (gridId) => await apiGet(`/pr-distributions/getPRReportGroupByGridId/${gridId}`),

  // Verify PR report URL access
  verifyUrlAccess: async (gridId, email = null) =>
    await apiGet("/pr-distributions/verifyPRReportUrl", {
      grid_id: gridId,
      email,
    }),

  // Get PR report data
  getReportData: async (gridId, email = null) =>
    await apiPost("/pr-distributions/getPRReportData", {
      grid_id: gridId,
      email,
    }),

  // Request access to private report
  requestAccess: async (reportId, email) =>
    await apiPost(`/pr-distributions/${reportId}/request-access`, {
      email,
    }),

  // Verify OTP for access
  verifyOTP: async (reportId, email, otp) =>
    await apiPost(`/pr-distributions/${reportId}/verify-otp`, {
      email,
      otp,
    }),

  // Export PR report as CSV
  exportCSV: async (gridId) => await apiGet(`/pr-distributions/exportPRReportCsv/${gridId}`),

  // Delete PR report
  deleteReport: async (gridId) => await apiDelete(`/pr-distributions/deletePRReport/${gridId}`),

  // Share PR report
  shareReport: async (gridId, isPrivate, sharedEmails = []) =>
    await apiPut(`/pr-distributions/sharePRReport/${gridId}`, {
      is_private: isPrivate,
      sharedEmails,
    }),
};
