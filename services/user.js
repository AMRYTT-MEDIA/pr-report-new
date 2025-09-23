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

  // Change user password
  changePassword: async ({ email, password }) => {
    try {
      const response = await apiPost("/auth/changepassword", {
        email,
        password,
      });
      return response;
    } catch (error) {
      console.error("Error changing password:", error);
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

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const requestBody = {};

      // Add text fields
      if (profileData.fullName) {
        requestBody.fullName = profileData.fullName;
      }

      // Add password fields if provided
      if (profileData.currentPassword) {
        requestBody.oldPassword = profileData.currentPassword;
      }
      if (profileData.newPassword) {
        requestBody.newPassword = profileData.newPassword;
      }
      if (profileData.confirmPassword) {
        requestBody.confirmPassword = profileData.confirmPassword;
      }

      // Add avatar even when empty string is intended to clear it
      if (Object.prototype.hasOwnProperty.call(profileData, "avatar")) {
        const value = profileData.avatar;
        // If a File is passed, send its name; otherwise pass through strings (including "")
        if (typeof File !== "undefined" && value instanceof File) {
          requestBody.avatar = value.name;
        } else if (typeof value === "string") {
          requestBody.avatar = value; // may be "" to clear on backend
        }
      }

      const response = await apiPut("/auth/profile/update", requestBody);
      return response;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};
