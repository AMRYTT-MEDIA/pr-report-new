import axios from "axios";
import tokenManager from "./tokenManager";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

// Global flag to prevent multiple simultaneous token refreshes
let isRefreshingGlobally = false;
let failedQueue = [];

// Process the failed requests queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  async (config) => {
    try {
      // Initialize token manager first
      await tokenManager.initializeTokenManager();

      // Always get a fresh, valid token for each request
      // This ensures we never send expired tokens
      const token = await tokenManager.getValidToken();
      if (token) {
        config.headers["Authorization-Token"] = token;
      } else {
        console.warn("API Request: No valid token available for", config.url);
      }
    } catch (error) {
      console.error(
        "API Request: Error setting auth token for",
        config.url,
        error
      );
      // If we can't get a valid token, the request will likely fail with 401
      // The response interceptor will handle the retry logic
    }
    return config;
  },
  (error) => {
    console.error("API Request: Interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      "API Response: Success for",
      response.config.url,
      response.status
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      console.error("API Response: 401 Unauthorized for", originalRequest.url);

      // If we're already refreshing globally, queue this request
      if (isRefreshingGlobally) {
        console.log(
          "API Response: Queueing request while token refresh in progress"
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization-Token"] = token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Check if we've already tried to refresh for this specific request
      if (originalRequest._retry) {
        console.error(
          "API Response: Token refresh already attempted for this request, redirecting to login"
        );
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Set the global refreshing flag
      isRefreshingGlobally = true;
      originalRequest._retry = true;

      try {
        console.log("API Response: Starting global token refresh...");

        // Force refresh token using centralized manager
        const freshToken = await tokenManager.forceRefresh();

        if (freshToken) {
          console.log(
            "API Response: Global token refresh successful, processing queue"
          );

          // Update the authorization header
          originalRequest.headers["Authorization-Token"] = freshToken;

          // Process any queued requests
          processQueue(null, freshToken);

          // Reset the global refreshing flag
          isRefreshingGlobally = false;

          // Retry the original request
          return api(originalRequest);
        } else {
          console.error(
            "API Response: No fresh token available, redirecting to login"
          );
          processQueue(new Error("Token refresh failed"), null);
          isRefreshingGlobally = false;

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } catch (refreshError) {
        console.error(
          "API Response: Global token refresh failed:",
          refreshError
        );
        processQueue(refreshError, null);
        isRefreshingGlobally = false;

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    console.error(
      "API Response: Error for",
      originalRequest.url,
      error.response?.status || error.message
    );
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
    // Clear any existing interval
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }

    tokenRefreshInterval = setInterval(async () => {
      try {
        // Use token manager to check and refresh if needed
        await tokenManager.getValidToken();
      } catch (error) {
        console.error("Error in periodic token refresh:", error);
        // Stop the interval if there's an error
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
        }
      }
    }, 2 * 60 * 1000); // Check every 2 minutes
  }
};

// Start token refresh when the module loads
startTokenRefresh();

// Cleanup function to stop token refresh
export const stopTokenRefresh = () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
};

// Restart token refresh (useful after login/logout)
export const restartTokenRefresh = () => {
  stopTokenRefresh();
  startTokenRefresh();
};

export default api;
