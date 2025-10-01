import { apiDelete, apiGet, apiPost, apiPostFormData, apiPut } from "@/lib/api";

// PR Reports API service
export const prReportsService = {
  // Upload CSV file
  uploadCSV: (file, reportTitle = "") => {
    const formData = new FormData();
    formData.append("csv_file", file);
    if (reportTitle) {
      formData.append("report_title", reportTitle);
    }
    return apiPostFormData("/pr-distributions/uploadPR", formData);
  },

  // Get PR reports list with pagination, search, and sorting
  getReports: (params = {}) => {
    const { page = 1, pageSize = 25 } = params;
    return apiGet("/pr-distributions/getPRReportGroups", {
      page,
      pageSize,
      // sort,
    });
  },

  // Get total count of PR reports
  getPRReportTotalCount: () => apiGet("/pr-distributions/getPRReportTotalCount"),

  // Get PR report by ID
  getReportById: (reportId) => apiGet(`/pr-distributions/getPRReportByBatchId/${reportId}`),

  // Get PR report group by grid ID
  getReportGroup: (gridId) => apiGet(`/pr-distributions/getPRReportGroupByGridId/${gridId}`),

  // Verify PR report URL access
  verifyUrlAccess: (gridId, email = null) =>
    apiGet("/pr-distributions/verifyPRReportUrl", {
      grid_id: gridId,
      email,
    }),

  // Get PR report data
  getReportData: (gridId, email = null) =>
    apiPost("/pr-distributions/getPRReportData", {
      grid_id: gridId,
      email,
    }),

  // Request access to private report
  requestAccess: (reportId, email) =>
    apiPost(`/pr-distributions/${reportId}/request-access`, {
      email,
    }),

  // Verify OTP for access
  verifyOTP: (reportId, email, otp) =>
    apiPost(`/pr-distributions/${reportId}/verify-otp`, {
      email,
      otp,
    }),

  // Export PR report as CSV
  exportCSV: (gridId) => apiGet(`/pr-distributions/exportPRReportCsv/${gridId}`),

  // Delete PR report
  deleteReport: (gridId) => apiDelete(`/pr-distributions/deletePRReport/${gridId}`),

  // Share PR report
  shareReport: (gridId, isPrivate, sharedEmails = []) =>
    apiPut(`/pr-distributions/sharePRReport/${gridId}`, {
      is_private: isPrivate,
      sharedEmails,
    }),
};
