import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

export const blockUrlsService = {
  // Get all blocks with pagination and search
  async getBlocks(page = 1, pageSize = 25, search = null) {
    try {
      return await apiGet("/blocks", {
        page,
        pageSize,
        search,
      });
    } catch (error) {
      console.error("Error fetching blocked URLs:", error);
      throw error;
    }
  },

  // Bulk create blocks
  async bulkCreateBlocks(urls) {
    try {
      return await apiPost("/blocks/bulk", { urls });
    } catch (error) {
      console.error("Error bulk creating blocks:", error);
      throw error;
    }
  },

  // Update single block
  async updateBlock(id, data) {
    try {
      return await apiPut(`/blocks/${id}`, data);
    } catch (error) {
      console.error("Error updating block:", error);
      throw error;
    }
  },

  // Bulk update blocks
  async bulkUpdateBlocks(updateData) {
    try {
      return await apiPut(`/blocks/bulk/update`, updateData);
    } catch (error) {
      console.error("Error bulk updating blocks:", error);
      throw error;
    }
  },

  // Delete (unblock) single block
  async deleteBlock(id) {
    try {
      return await apiDelete(`/blocks/${id}`);
    } catch (error) {
      console.error("Error deleting (unblocking) block:", error);
      throw error;
    }
  },

  // Bulk activate blocks
  async bulkActivateBlocks(blockIds) {
    try {
      return await apiPut("/blocks/bulk/activate", { blockIds });
    } catch (error) {
      console.error("Error bulk activating blocks:", error);
      throw error;
    }
  },

  // Bulk deactivate blocks
  async bulkDeactivateBlocks(blockIds) {
    try {
      return await apiPut("/blocks/bulk/deactivate", { blockIds });
    } catch (error) {
      console.error("Error bulk deactivating blocks:", error);
      throw error;
    }
  },

  // Bulk delete blocks
  async bulkDeleteBlocks(blockIds) {
    try {
      return await apiDelete("/blocks/bulk/delete", { blockIds });
    } catch (error) {
      console.error("Error bulk deleting blocks:", error);
      throw error;
    }
  },
};
