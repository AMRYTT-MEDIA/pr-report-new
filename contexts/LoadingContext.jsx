"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { LOADING_MESSAGES } from "@/constants/index.js";

// Loading Context
const LoadingContext = createContext();

// Custom hook to use loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

// Loading Provider Component
export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  // Set loading state for a specific key
  const setLoading = useCallback(
    (key, isLoading, message = LOADING_MESSAGES.DEFAULT) => {
      setLoadingStates((prev) => ({
        ...prev,
        [key]: isLoading ? { loading: true, message } : undefined,
      }));
    },
    []
  );

  // Check if a specific key is loading
  const isLoading = useCallback(
    (key) => {
      return loadingStates[key]?.loading || false;
    },
    [loadingStates]
  );

  // Get loading message for a specific key
  const getLoadingMessage = useCallback(
    (key) => {
      return loadingStates[key]?.message || LOADING_MESSAGES.DEFAULT;
    },
    [loadingStates]
  );

  // Check if any loading is active
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some((state) => state?.loading);
  }, [loadingStates]);

  // Clear all loading states
  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  // Clear specific loading state
  const clearLoading = useCallback((key) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const value = {
    setLoading,
    isLoading,
    getLoadingMessage,
    isAnyLoading,
    clearAllLoading,
    clearLoading,
    loadingStates,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

// Common loading keys to avoid typos
export const LOADING_KEYS = {
  AUTH: "auth",
  USERS: "users",
  PR_REPORTS: "pr-reports",
  WEBSITES: "websites",
  BLOCK_URLS: "block-urls",
  UPLOAD: "upload",
  DELETE: "delete",
  SAVE: "save",
  FETCH: "fetch",
};
