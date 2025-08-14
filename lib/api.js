import axios from "axios";
import { getAuth } from "firebase/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Force token refresh to ensure it's valid
        const token = await user.getIdToken(true);
        if (token) {
          config.headers["Authorization-Token"] = token;
        }
      }
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - try to refresh token
      console.error("Unauthorized request - token may be expired");

      try {
        const auth = getAuth();
        if (auth.currentUser) {
          // Force token refresh
          await auth.currentUser.getIdToken(true);

          // Retry the original request with new token
          const originalRequest = error.config;
          const freshToken = await auth.currentUser.getIdToken();
          originalRequest.headers["Authorization-Token"] = freshToken;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        // Could trigger Firebase sign out if needed
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// GET helper
export const apiGet = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST helper
export const apiPost = async (endpoint, data = {}) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// POST FormData helper
export const apiPostFormData = async (endpoint, formData) => {
  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT helper
export const apiPut = async (endpoint, data = {}) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE helper
export const apiDelete = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Periodic token refresh to ensure tokens stay fresh
let tokenRefreshInterval;

const startTokenRefresh = () => {
  if (typeof window !== "undefined") {
    tokenRefreshInterval = setInterval(async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true);
        }
      } catch (error) {
        console.error("Error in periodic token refresh:", error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
  }
};

// Start token refresh when the module loads
startTokenRefresh();

export default api;
