"use client";

import React from "react";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";

const UsersPage = () => {
  // Direct render - no useEffect needed
  useBreadcrumbDirect([{ name: "Users", href: "/users", current: true }]);

  return <div>UsersPage</div>;
};

export default UsersPage;
