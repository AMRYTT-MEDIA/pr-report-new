import { getAuth, onAuthStateChanged } from "firebase/auth";

// Token state variables
let currentToken = null;
let tokenPromise = null;
let lastRefreshTime = 0;
let authInitialized = false;
let currentUser = null;
let authStatePromise = null;

// Initialize Firebase auth state monitoring (global setup)
const initializeAuthState = async () => {
  if (authInitialized) {
    return currentUser;
  }

  if (authStatePromise) {
    return await authStatePromise;
  }

  authStatePromise = new Promise((resolve) => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser = user;
      authInitialized = true;

      if (!user) {
        // User logged out, clear tokens
        clearToken();
      }

      unsubscribe(); // Only need this for initialization
      resolve(user);
    });
  });

  return await authStatePromise;
};

// Get a valid token, refreshing if necessary
export const getValidToken = async (forceRefresh = false) => {
  try {
    // Ensure auth state is initialized
    await initializeAuthState();

    if (!currentUser) {
      return null;
    }

    // Always validate with Firebase first, unless force refresh is requested
    if (!forceRefresh && currentToken) {
      try {
        // Check if the token is still valid with Firebase
        const tokenResult = await currentUser.getIdTokenResult();
        const currentTime = Date.now();
        const expirationTime = new Date(tokenResult.expirationTime).getTime();

        // If token expires in more than 5 minutes, it's still valid
        if (expirationTime - currentTime > 5 * 60 * 1000) {
          return currentToken;
        } else {
          // Clear the current token since it's expiring soon
          currentToken = null;
        }
      } catch (validationError) {
        // Token is invalid, clear it and continue to refresh
        currentToken = null;
      }
    }

    // If there's already a token refresh in progress, wait for it
    if (tokenPromise) {
      return await tokenPromise;
    }

    // Start a new token refresh
    tokenPromise = refreshToken(currentUser);
    const token = await tokenPromise;
    tokenPromise = null;
    return token;
  } catch (error) {
    tokenPromise = null;
    throw error;
  }
};

// Refresh the token
const refreshToken = async (user) => {
  try {
    // Always force refresh from Firebase
    const token = await user.getIdToken(true);
    currentToken = token;
    lastRefreshTime = Date.now();
    return token;
  } catch (error) {
    throw error;
  }
};

// Clear the current token (useful for logout)
export const clearToken = () => {
  currentToken = null;
  tokenPromise = null;
  lastRefreshTime = 0;
  authInitialized = false;
  currentUser = null;
  authStatePromise = null;
};

// Force refresh token (useful for manual refresh)
export const forceRefresh = async () => {
  try {
    await initializeAuthState();

    if (currentUser) {
      return await refreshToken(currentUser);
    }

    return null;
  } catch (error) {
    return null;
  }
};

// Validate token with Firebase (useful for checking if token is truly valid)
export const validateTokenWithFirebase = async () => {
  try {
    await initializeAuthState();

    if (!currentUser || !currentToken) {
      return false;
    }

    const tokenResult = await currentUser.getIdTokenResult();
    const currentTime = Date.now();
    const expirationTime = new Date(tokenResult.expirationTime).getTime();

    // Token is valid if it expires in more than 5 minutes
    const isValid = expirationTime - currentTime > 5 * 60 * 1000;
    return isValid;
  } catch (error) {
    return false;
  }
};

// Pre-flight check: ensure we have a valid token before making critical API calls
export const ensureValidTokenBeforeApiCall = async () => {
  try {
    // Get a valid token (will refresh if needed)
    const token = await getValidToken();
    if (!token) {
      throw new Error("TokenManager: No valid token available");
    }
    return token;
  } catch (error) {
    throw error;
  }
};

// Global initialization - call this when the app starts
export const initializeTokenManager = async () => {
  try {
    await initializeAuthState();
    return true;
  } catch (error) {
    return false;
  }
};

// Default export for backward compatibility
const tokenManager = {
  getValidToken,
  clearToken,
  forceRefresh,
  validateTokenWithFirebase,
  ensureValidTokenBeforeApiCall,
  initializeTokenManager,
};

export default tokenManager;
