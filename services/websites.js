import { apiDelete, apiGet, apiPost, apiPostFormData, apiPut, apiPutFormData } from "@/lib/api";
import { uploadLogo, deleteLogo } from "@/lib/utils";

// Websites API service
export const websitesService = {
  // Get all websites
  getWebsites: async () => {
    return await apiGet("/websites");
  },

  // Get websites with pagination
  getWebsitesPaginated: async (page = 1, pageSize = 25, search = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    if (search) {
      params.append('search', search);
    }
    
    return await apiGet(`/websites?${params.toString()}`);
  },

  // Get all websites
  getAllWebsites: async () => {
    return await apiGet("/websites/all");
  },

  // Get website by ID
  getWebsiteById: async (id) => {
    return await apiGet(`/websites/${id}`);
  },

  // Create new website
  createWebsite: async (websiteData) => {
    const { name, url, logo } = websiteData;
    
    try {
      if (logo) {
          const logoFilename = await uploadLogo(logo, name, url);          
        // Send FormData to external API (as it expects)
        const formData = new FormData();
        formData.append("name", name);
        formData.append("url", url);
        formData.append("logo", logoFilename);
        
        const result = await apiPostFormData("/websites", formData);
        
        return result;
      } else {
        // If no logo, send JSON data
        return await apiPost("/websites", { name, url });
      }
    } catch (error) {
      console.error('Error in createWebsite:', error);
      throw error;
    }
  },

  // Update website
  updateWebsite: async (id, websiteData) => {
    const { name, url, logo, existingLogo } = websiteData;
    
    try {
      if (logo) {
        const logoFilename = await uploadLogo(logo, name, url, existingLogo);
        // Send FormData to external API (as it expects)
        const formData = new FormData();
        formData.append("name", name);
        formData.append("url", url);
        formData.append("logo", logoFilename);
        
        return await apiPutFormData(`/websites/${id}`, formData);
      } else {
        // If no logo, send JSON data
        return await apiPut(`/websites/${id}`, { name, url });
      }
    } catch (error) {
      console.error('Error in updateWebsite:', error);
      throw error;
    }
  },

  // Delete website
  deleteWebsite: async (id, logoFilename = null) => {
    try {
      // First delete the website from the database
      const response = await apiDelete(`/websites/${id}`);
      // If successful and we have a logo, delete the logo file
      if (logoFilename) {
        try {
          await deleteLogo(logoFilename);
        } catch (logoError) {
          console.warn('Failed to delete logo file:', logoError);
          // Don't throw error for logo deletion failure - website is already deleted
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in deleteWebsite:', error);
      throw error;
    }
  },

  // Reorder websites
  reorderWebsites: async (reorderData) => {
    return await apiPut("/websites/reorder", reorderData);
  },

}; 