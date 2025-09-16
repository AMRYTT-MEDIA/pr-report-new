import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

// Existing function
export const getuserdatabyfirebaseid = async (userId) => {
  const response = await apiGet(`/auth/getuserdatabyfirebaseid/${userId}`);
  return response?.data;
};

// User Management APIs
export const userService = {
  // Get all users with pagination support
  getAllUsers: async (page = 1, pageSize = 25) => {
    try {
      const response = await apiGet(
        `/auth/getallusers?page=${page}&pageSize=${pageSize}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await apiGet(`/auth/getuser/${userId}`);
      return response;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await apiPost("/auth/createuser", userData);
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await apiPut(`/auth/updateuser/${userId}`, userData);
      return response;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await apiDelete(`/auth/deleteuser/${userId}`);
      return response;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Toggle user active status
  toggleUserStatus: async (userId, isActive) => {
    try {
      const response = await apiPut(`/auth/updateuser/${userId}`, {
        isActive,
      });
      return response;
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  },

  // Get all roles
  getRoles: async () => {
    try {
      const response = await apiGet("/roles/getroles");
      return response;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },
};
