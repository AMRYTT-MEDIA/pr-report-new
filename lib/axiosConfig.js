"use client";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Avoid double-setup in HMR / multiple imports
if (!globalThis.__AXIOS_FB_SETUP__) {
  globalThis.__AXIOS_FB_SETUP__ = true;

  const auth = getAuth();
  let refreshPromise = null;
  let isRefreshing = false;
  let failedQueue = [];

  // Process queued requests after token refresh
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

  // Get fresh token - always from Firebase, never cached
  const getValidToken = async (forceRefresh = false) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user");
    }

    try {
      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  };

  // Clear any cached data when user changes
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // User logged out - clear any pending operations
      processQueue(new Error("User logged out"), null);
      isRefreshing = false;
      refreshPromise = null;
    }
  });

  // Request interceptor - always get fresh token
  axios.interceptors.request.use(
    async (config) => {
      config.headers = config.headers || {};

      // Skip token attachment for retry requests that already have token
      if (config._retry && config.headers["Authorization-Token"]) {
        return config;
      }

      try {
        const token = await getValidToken();
        if (token) {
          config.headers["Authorization-Token"] = token;
        }
      } catch (error) {
        console.error("Failed to get token for request:", error);
        // You might want to redirect to login here
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor with proper queuing
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;

      if (!response || response.status !== 401 || config._retry) {
        return Promise.reject(error);
      }

      // Mark as retry to prevent infinite loops
      config._retry = true;

      const user = auth.currentUser;
      if (!user) {
        return Promise.reject(new Error("No authenticated user"));
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            config.headers["Authorization-Token"] = token;
            return axios(config);
          })
          .catch((err) => Promise.reject(err));
      }

      // Start refresh process
      isRefreshing = true;

      if (!refreshPromise) {
        refreshPromise = getValidToken(true) // Force refresh
          .then((newToken) => {
            processQueue(null, newToken);
            return newToken;
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            console.error("Token refresh failed:", refreshError);
            throw refreshError;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;
        config.headers["Authorization-Token"] = newToken;
        return axios(config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );
}

export default axios;
