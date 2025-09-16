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

  // Create single block
  async createBlock(blockData) {
    try {
      return await apiPost("/blocks", blockData);
    } catch (error) {
      console.error("Error adding blocked URL:", error);
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

  // Get block by id
  async getBlockById(id) {
    try {
      return await apiGet(`/blocks/${id}`);
    } catch (error) {
      console.error("Error fetching block by id:", error);
      throw error;
    }
  },

  // Check website block status
  async checkBlockStatus(url) {
    try {
      return await apiGet("/blocks/check/status", { url });
    } catch (error) {
      console.error("Error checking block status:", error);
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

  // Backwards compatibility aliases (old names)
  getBlockUrls(page = 1, pageSize = 25, search = null) {
    return this.getBlocks(page, pageSize, search);
  },
  addBlockUrl(data) {
    return this.createBlock(data);
  },
  deleteBlockUrl(id) {
    return this.deleteBlock(id);
  },
};
