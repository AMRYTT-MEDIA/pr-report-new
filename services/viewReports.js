import { apiDelete, apiGet, apiPost, apiPostFormData, apiPut, apiPutFormData } from "@/lib/api";

export const viewReportsService = {
  // Create URLs with grid_id
  createPR: async (data) => {
    return await apiPost("/pr-distributions/createPR", data);
  },

  // Update record with id
  updatePR: async (id, data) => {
    return await apiPut(`/pr-distributions/record/${id}`, data);
  },

  // Delete URLs with grid_id
  deletePR: async (id) => {
    return await apiDelete(`/pr-distributions/record/${id}`);
  },
};
