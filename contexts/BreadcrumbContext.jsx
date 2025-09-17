"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";

const BreadcrumbContext = createContext();

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    // Return default values instead of throwing error during SSR/static generation
    return {
      breadcrumbItems: [],
      setBreadcrumb: () => {},
    };
  }
  return context;
};

export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);

  const setBreadcrumb = useCallback((items) => {
    setBreadcrumbItems(items);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbItems, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

// Custom hook for setting breadcrumb with useLayoutEffect
export const useBreadcrumbDirect = (items) => {
  const { setBreadcrumb } = useBreadcrumb();
  const itemsRef = useRef(null);

  useLayoutEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const itemsString = JSON.stringify(items);
    if (itemsRef.current !== itemsString) {
      itemsRef.current = itemsString;
      setBreadcrumb(items);
    }
  }, [setBreadcrumb, items]);
};
