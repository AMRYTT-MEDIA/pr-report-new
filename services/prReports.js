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
    const { q = "", page = 1, limit = 10, sort = "createdAt:desc" } = params;
    return await apiGet("/pr-distributions/getPRReportGroups", {
      q,
      page,
      limit,
      sort,
    });
  },

  // Get PR report by ID
  getReportById: async (reportId) => {
    return await apiGet(`/pr-distributions/getPRReportByBatchId/${reportId}`);
  },

  // Get PR report group by grid ID
  getReportGroup: async (gridId) => {
    return await apiGet(`/pr-distributions/getPRReportGroupByGridId/${gridId}`);
  },

  // Verify PR report URL access
  verifyUrlAccess: async (gridId, email = null) => {
    return await apiGet("/pr-distributions/verifyPRReportUrl", {
      grid_id: gridId,
      email,
    });
  },

  // Get PR report data
  getReportData: async (gridId, email = null) => {
    return await apiPost("/pr-distributions/getPRReportData", {
      grid_id: gridId,
      email,
    });
  },

  // Request access to private report
  requestAccess: async (reportId, email) => {
    return await apiPost(`/pr-distributions/${reportId}/request-access`, {
      email,
    });
  },

  // Verify OTP for access
  verifyOTP: async (reportId, email, otp) => {
    return await apiPost(`/pr-distributions/${reportId}/verify-otp`, {
      email,
      otp,
    });
  },

  // Export PR report as CSV
  exportCSV: async (gridId) => {
    return await apiGet(`/pr-distributions/exportPRReportCsv/${gridId}`);
  },

  // Delete PR report
  deleteReport: async (gridId) => {
    return await apiDelete(`/pr-distributions/deletePRReport/${gridId}`);
  },

  // Share PR report
  shareReport: async (gridId, isPrivate, sharedEmails = []) => {
    return await apiPut(`/pr-distributions/sharePRReport/${gridId}`, {
      is_private: isPrivate,
      sharedEmails,
    });
  },
};
