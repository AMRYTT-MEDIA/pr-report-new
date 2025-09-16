"use client";

// ** React Imports
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
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
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user);
  const [loading, setLoading] = useState(defaultProvider.loading);
  const [initialized, setInitialized] = useState(false);
  const pathName = usePathname();
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
            toast.error(
              error?.response?.data?.message ||
                globalConstants?.SomethingWentWrong
            );
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
  }, [initialized, pathName]);

  const logout = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const values = useMemo(
    () => ({
      user,
      loading,
      initialized,
      setUser,
      setLoading,
      logout,
    }),
    [user, loading, initialized]
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
