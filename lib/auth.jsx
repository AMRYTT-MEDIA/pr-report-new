"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { getuserdatabyfirebaseid } from "@/services/user";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { isPublicRoute, isProtectedRoute } from "@/lib/routeConfig";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isErrorShown, setIsErrorShown] = useState(false);
  const isInitialized = useRef(false);
  const isRedirecting = useRef(false);

  // Function to refresh token
  const refreshToken = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const freshToken = await currentUser.getIdToken(true);
        setToken(freshToken);
        return freshToken;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  // Function to validate user with backend API
  const validateUserWithBackend = useCallback(async (currentUser) => {
    try {
      console.log("Validating user with backend:", currentUser.uid);
      const token = await currentUser.getIdToken(true);
      setToken(token);

      const res = await getuserdatabyfirebaseid(currentUser.uid);
      console.log("Backend validation response:", res);

      if (res && res.data) {
        console.log("Setting user data:", res.data);
        setUser(res.data);
        setIsErrorShown(false);
        return { success: true, userData: res.data };
      } else {
        // User not found in backend
        console.log("User not found in backend");
        setUser(null);
        setToken(null);
        await signOut(auth);
        return { success: false, error: "User not found in backend" };
      }
    } catch (error) {
      console.error("Backend validation error:", error);

      if (error.response && error.response.status === 404) {
        // User not found - show toast and sign out
        if (!isErrorShown) {
          toast.error("User not found. Please contact your administrator.");
          setIsErrorShown(true);
        }
        setUser(null);
        setToken(null);
        await signOut(auth);
        return { success: false, error: "User not found" };
      } else if (error.response && error.response.status === 401) {
        // Unauthorized - show toast and sign out
        toast.error("Authentication failed. Please login again.");
        setUser(null);
        setToken(null);
        await signOut(auth);
        return { success: false, error: "Authentication failed" };
      } else {
        // Other errors
        toast.error("Failed to validate user. Please try again.");
        setUser(null);
        setToken(null);
        await signOut(auth);
        return { success: false, error: "Validation failed" };
      }
    }
  }, []);

  // Function to handle authentication state changes
  const handleAuthStateChange = useCallback(
    async (currentUser) => {
      if (isRedirecting.current) return; // Prevent multiple redirects

      setLoading(true);

      if (currentUser) {
        // User is authenticated with Firebase
        if (isPublicRoute(pathname)) {
          // User is on public page but authenticated
          // Set basic user info and redirect to dashboard
          setUser({ uid: currentUser.uid, email: currentUser.email });
          const token = await currentUser.getIdToken();
          setToken(token);

          if (!isRedirecting.current) {
            isRedirecting.current = true;
            router.replace("/pr-reports");
            setTimeout(() => {
              isRedirecting.current = false;
            }, 1000);
          }
        } else {
          // User is on protected route, validate with backend
          const validation = await validateUserWithBackend(currentUser);
          if (!validation.success) {
            // Validation failed, user will be redirected to login by validateUserWithBackend
            setLoading(false);
            return;
          }
          // Validation successful, user state is already set in validateUserWithBackend
        }
      } else {
        // User is not authenticated
        setUser(null);
        setToken(null);

        // Only redirect to login if on protected route
        if (isProtectedRoute(pathname) && !isRedirecting.current) {
          setLoading(false); // Set loading to false immediately
          isRedirecting.current = true;
          router.push("/login");
          setTimeout(() => {
            isRedirecting.current = false;
          }, 1000);
          return; // Exit early to prevent setLoading(false) at the end
        } else {
        }
      }

      setLoading(false);
    },
    [pathname, router, validateUserWithBackend]
  );

  // Main authentication effect
  useEffect(() => {
    if (isInitialized.current) return;

    // Immediate check for protected routes without authentication
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (isProtectedRoute(pathname) && !currentUser) {
      setLoading(false);
      router.push("/login");
      return;
    }

    // If not on protected route or user exists, proceed with normal auth flow
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    isInitialized.current = true;

    // Add a timeout to prevent loading state from getting stuck
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached, setting loading to false");
        setLoading(false);

        // If still loading after timeout and on protected route without user, redirect to login
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (
          isProtectedRoute(pathname) &&
          !currentUser &&
          !isRedirecting.current
        ) {
          isRedirecting.current = true;
          router.push("/login");
          setTimeout(() => {
            isRedirecting.current = false;
          }, 1000);
        }
      }
    }, 2000); // Reduced to 2 seconds for even faster redirect

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [handleAuthStateChange, loading, pathname, router]);

  // Handle pathname changes
  useEffect(() => {
    if (!isInitialized.current) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser && isPublicRoute(pathname)) {
      // User is authenticated but on public page, redirect to dashboard
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.replace("/pr-reports");
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
    } else if (!currentUser && isProtectedRoute(pathname)) {
      // User is not authenticated but on protected route, redirect to login
      setLoading(false); // Set loading to false immediately
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.push("/login");
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
    } else if (currentUser && isProtectedRoute(pathname)) {
      // User is authenticated and on protected route, ensure user state is set
      if (!user) {
        // User state is not set, validate with backend
        validateUserWithBackend(currentUser);
      }
    } else {
    }
  }, [pathname, router, user, validateUserWithBackend]);

  // Additional effect to handle direct URL access to protected routes
  useEffect(() => {
    if (!isInitialized.current) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // If we're on a protected route and there's no user, redirect immediately
    if (isProtectedRoute(pathname) && !currentUser) {
      // Set loading to false to prevent stuck loading state
      setLoading(false);

      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.push("/login");
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
    }
  }, [pathname, router]);

  // Additional effect to force loading state resolution for protected routes
  useEffect(() => {
    if (!isInitialized.current) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Force loading state resolution for protected routes without users
    if (isProtectedRoute(pathname) && !currentUser && loading) {
      setLoading(false);

      // Immediate redirect
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.push("/login");
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
    }
  }, [pathname, loading, router]);

  // Final safety check to ensure loading state is resolved
  useEffect(() => {
    if (!isInitialized.current) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Safety check: if on protected route without user and still loading, force redirect
    if (isProtectedRoute(pathname) && !currentUser && loading) {
      setLoading(false);

      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.push("/login");
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
    }
  }, [pathname, loading, router]);

  // Cleanup effect to reset loading state on unmount
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  // Aggressive immediate check for protected routes - runs on every render
  useEffect(() => {
    if (!isInitialized.current) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Immediate aggressive check for protected routes without users
    if (isProtectedRoute(pathname) && !currentUser) {
      setLoading(false);

      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.push("/login");
        setTimeout(() => {
          isRedirecting.current = false;
        }, 1000);
      }
    }
  });

  // Reset error flag when pathname changes
  useEffect(() => {
    if (isProtectedRoute(pathname)) {
      setIsErrorShown(false);
    }
  }, [pathname]);

  // Refresh token periodically (every 50 minutes)
  useEffect(() => {
    if (!user || isPublicRoute(pathname)) return;

    const refreshTokenInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshTokenInterval);
  }, [user, pathname]);

  const login = async (email, password) => {
    try {
      // Reset error flag when starting new login attempt
      setIsErrorShown(false);

      const result = await signInWithEmailAndPassword(auth, email, password);

      // After successful login, ALWAYS validate with backend API
      if (result.user) {
        const validation = await validateUserWithBackend(result.user);
        if (validation.success) {
          // Set user state before redirect to prevent loading state
          setUser(validation.userData);
          setLoading(false);
          router.push("/pr-reports");
          return { success: true, user: result.user };
        } else {
          console.log("Backend validation failed:", validation.error);
          return { success: false, error: validation.error };
        }
      }
      return { success: true, user: result.user };
    } catch (error) {
      let errorMessage = "Login failed";

      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Account has been disabled. Please contact support.";
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      setIsErrorShown(false);
      router.push("/login");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createUser = async (email, password, role = "user") => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user document in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await setDoc(
        doc(db, "users", userId),
        { role: newRole },
        { merge: true }
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Function to force re-check authentication state
  const forceAuthCheck = useCallback(async () => {
    if (isPublicRoute(pathname)) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      await validateUserWithBackend(currentUser);
    }
  }, [pathname, validateUserWithBackend]);

  // Function to reset error flag
  const resetErrorFlag = useCallback(() => {
    setIsErrorShown(false);
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    createUser,
    updateUserRole,
    loading,
    refreshToken,
    forceAuthCheck,
    resetErrorFlag,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
