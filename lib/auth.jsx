"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { restartTokenRefresh, stopTokenRefresh } from "./api";
import tokenManager from "./tokenManager";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Function to refresh token
  const refreshToken = async () => {
    try {
      const freshToken = await tokenManager.getValidToken(true);
      setToken(freshToken);
      return freshToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        try {
          // Pre-flight check: ensure we have a valid token before making any API calls
          const token = await tokenManager.ensureValidTokenBeforeApiCall();
          setToken(token);

          // Restart token refresh for the new user
          restartTokenRefresh();

          // Now call the backend API with the guaranteed fresh token
          const res = await getuserdatabyfirebaseid(currentUser.uid);
          if (res) {
            setUser(res.data);
            // Let the guard system handle routing instead of automatic redirect
          } else {
            setUser(null);
            // User doesn't exist in backend, sign them out
            await signOut(auth);
            toast.error("User not found in system");
          }
        } catch (error) {
          console.error("Error getting user data:", error);

          // If it's a token/authorization error, try to refresh and retry once
          if (
            error.response?.status === 401 ||
            error.message?.includes("token")
          ) {
            try {
              console.log("Token expired, refreshing and retrying...");
              const freshToken = await tokenManager.forceRefresh();
              setToken(freshToken);

              // Retry the API call with fresh token
              const retryRes = await getuserdatabyfirebaseid(currentUser.uid);
              if (retryRes) {
                setUser(retryRes.data);
              } else {
                setUser(null);
                await signOut(auth);
                toast.error("User not found in system");
              }
            } catch (retryError) {
              console.error("Retry failed:", retryError);
              toast.error("Login failed - please try again");
              setUser(null);
              setToken(null);
            }
          } else if (error.response?.status === 404) {
            toast.error("User not found");
            setUser(null);
            setToken(null);
          } else {
            toast.error(error.message || "Login failed");
            setUser(null);
            setToken(null);
          }
        }
      } else {
        setUser(null);
        setToken(null);
        // Stop token refresh when user logs out
        stopTokenRefresh();
        // Clear token from manager
        tokenManager.clearToken();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Remove the old token refresh logic - now handled by api.js
  // useEffect(() => {
  //   if (!user) return;

  //   const refreshTokenInterval = setInterval(async () => {
  //     try {
  //       await refreshToken();
  //     } catch (error) {
  //       console.error("Error refreshing token:", error);
  //     }
  //   }, 50 * 60 * 1000); // 50 minutes

  //   return () => clearInterval(refreshTokenInterval);
  // }, [user]);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      // Let the guard system handle routing
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

  const value = {
    user,
    token,
    login,
    logout,
    createUser,
    updateUserRole,
    loading,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
