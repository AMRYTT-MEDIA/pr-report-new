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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        try {
          // Get and set the Firebase ID token with force refresh
          const token = await currentUser.getIdToken(true);
          setToken(token);
          const res = await getuserdatabyfirebaseid(currentUser.uid);
          if (res) {
            setUser(res.data);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error getting user data:", error);
          toast.error(error.message || "Login failed");
          setUser(null);
          setToken(null);
          router.push("/login");
        }
      } else {
        setUser(null);
        setToken(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresh token periodically (every 50 minutes)
  useEffect(() => {
    if (!user) return;

    const refreshTokenInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshTokenInterval);
  }, [user]);

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

  const value = {
    user,
    token,
    login,
    logout,
    createUser,
    updateUserRole,
    loading,
    refreshToken, // Add the refreshToken function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
