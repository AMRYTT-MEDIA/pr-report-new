"use client";

import React from "react";
import UserTable from "@/components/users/UserTable";

const UsersPage = () => {
  const handleRefresh = () => {
    // This will be called when users are created, updated, or deleted
  };

  return <UserTable onRefresh={handleRefresh} />;
};

export default UsersPage;
