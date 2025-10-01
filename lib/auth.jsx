"use client";

// ** React Imports
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname } from "next/navigation";
import { getFirebaseAuth } from "./firebase";
import { getuserdatabyfirebaseid } from "@/services/user";
import { toast } from "sonner";
import { globalConstants } from "./constants/globalConstants";

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  initialized: false,
  setUser: () => null,
  setLoading: () => Boolean,
};

const AuthContext = createContext(defaultProvider);

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Return default values during SSR/static generation if context is not available
  if (!context) {
    return {
      user: null,
      loading: false,
      initialized: true,
      setUser: () => null,
      setLoading: () => Boolean,
      logout: () => Promise.resolve({ success: false, error: "No auth context" }),
    };
  }
  return context;
};

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user);
  const [loading, setLoading] = useState(defaultProvider.loading);
  const [initialized, setInitialized] = useState(false);
  const pathName = usePathname();

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    return { success: true };
  }, [setUser]);

  useEffect(() => {
    // Only run auth state listener on client side
    if (typeof window === "undefined") {
      setLoading(false);
      setInitialized(true);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Set loading only if not already initialized
      if (!initialized) {
        setLoading(true);
      }

      if (currentUser) {
        try {
          const res = await getuserdatabyfirebaseid(currentUser.uid);
          if (res) {
            setUser(res);
          }
        } catch (error) {
          if (error.response?.status === 401) {
            await logout();
            // router.push("/login");
          }
          if (pathName !== "/login/") {
            toast.error(error?.response?.data?.message || globalConstants?.SomethingWentWrong);
          }
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [initialized, pathName, logout]);

  const values = useMemo(
    () => ({
      user,
      loading,
      initialized,
      setUser,
      setLoading,
      logout,
    }),
    [user, loading, initialized, logout]
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
