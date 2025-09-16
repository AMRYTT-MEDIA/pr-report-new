import { apiDelete, apiGet, apiPost, apiPostFormData, apiPut, apiPutFormData } from "@/lib/api";

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
    
    if (logo) {
      // If logo file is provided, use FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("url", url);
      formData.append("logo", logo);
      
      return await apiPostFormData("/websites", formData);
    } else {
      // If no logo, send JSON data
      return await apiPost("/websites", { name, url });
    }
  },

  // Update website
  updateWebsite: async (id, websiteData) => {
    const { name, url, logo } = websiteData;
    
    if (logo) {
      // If logo file is provided, use FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("url", url);
      formData.append("logo", logo);
      
      return await apiPutFormData(`/websites/${id}`, formData);
    } else {
      // If no logo, send JSON data
      return await apiPut(`/websites/${id}`, { name, url });
    }
  },

  // Delete website
  deleteWebsite: async (id) => {
    return await apiDelete(`/websites/${id}`);
  },

  // Reorder websites
  reorderWebsites: async (reorderData) => {
    return await apiPut("/websites/reorder", reorderData);
  },

  // Get logo URL
  getLogoUrl: (filename) => {
    // If filename already has logo/ prefix, don't add it again
    if (filename.startsWith('logo/')) {
      return `${process.env.NEXT_PUBLIC_API_URL}/${filename}`;
    }
    // If filename doesn't have logo/ prefix, add it
    return `${process.env.NEXT_PUBLIC_API_URL}/logo/${filename}`;
  }
}; 