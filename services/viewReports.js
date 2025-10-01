import { apiDelete, apiPost, apiPut } from "@/lib/api";

export const viewReportsService = {
  // Create URLs with grid_id
  createPR: (data) => apiPost("/pr-distributions/createPR", data),

  // Update record with id
  updatePR: (id, data) => apiPut(`/pr-distributions/record/${id}`, data),

  // Delete URLs with grid_id
  deletePR: (id) => apiDelete(`/pr-distributions/record/${id}`),
};
