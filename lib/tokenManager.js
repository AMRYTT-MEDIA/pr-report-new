import { getAuth } from "firebase/auth";

// Token manager utility to ensure Firebase tokens are always fresh
export const tokenManager = {
  // Get a fresh Firebase token
  getFreshToken: async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        return null;
      }

      // Force token refresh to ensure it's valid
      const token = await user.getIdToken(true);
      return token;
    } catch (error) {
      console.error("Error getting fresh token:", error);
      return null;
    }
  },

  // Check if token is expired (Firebase handles this automatically, but we can add custom logic)
  isTokenExpired: (token) => {
    if (!token) return true;

    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      // Add 5 minute buffer to refresh before actual expiration
      return payload.exp < currentTime + 300;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; // Assume expired if we can't decode
    }
  },

  // Ensure token is fresh before making API calls
  ensureFreshToken: async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        return null;
      }

      // Always get a fresh token for API calls
      const token = await user.getIdToken(true);

      if (!token) {
        throw new Error("Failed to get fresh token");
      }

      return token;
    } catch (error) {
      console.error("Error ensuring fresh token:", error);
      return null;
    }
  },
};
