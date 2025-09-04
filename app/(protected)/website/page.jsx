"use client";

import React from "react";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";

const WebsitePage = () => {
  // Direct render - no useEffect needed
  useBreadcrumbDirect([{ name: "Website", href: "/website", current: true }]);

  return <div>WebsitePage</div>;
};

export default WebsitePage;
