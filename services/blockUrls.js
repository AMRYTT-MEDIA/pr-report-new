import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

export const blockUrlsService = {
  // Get all blocks with pagination and search
  getBlocks(page = 1, pageSize = 25, search = null) {
    return apiGet("/blocks", {
      page,
      pageSize,
      search,
    });
  },

  // Bulk create blocks
  bulkCreateBlocks(urls) {
    return apiPost("/blocks/bulk", { urls });
  },

  // Update single block
  updateBlock(id, data) {
    return apiPut(`/blocks/${id}`, data);
  },

  // Bulk update blocks
  bulkUpdateBlocks(updateData) {
    return apiPut(`/blocks/bulk/update`, updateData);
  },

  // Delete (unblock) single block
  deleteBlock(id) {
    return apiDelete(`/blocks/${id}`);
  },

  // Bulk activate blocks
  bulkActivateBlocks(blockIds) {
    return apiPut("/blocks/bulk/activate", { blockIds });
  },

  // Bulk deactivate blocks
  bulkDeactivateBlocks(blockIds) {
    return apiPut("/blocks/bulk/deactivate", { blockIds });
  },

  // Bulk delete blocks
  bulkDeleteBlocks(blockIds) {
    return apiDelete("/blocks/bulk/delete", { blockIds });
  },
};
