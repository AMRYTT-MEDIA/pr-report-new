"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { Plus, PencilLine, KeyRound } from "lucide-react";
import { userService } from "@/services/user";
import { toast } from "sonner";
import { CommonTable } from "@/components/common";
import Pagination from "@/components/Pagination";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import DeactivateUserDialog from "./DeactivateUserDialog";
import UserDialog from "./UserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";

const UserTable = ({ loading = false }) => {
  // Set breadcrumb
  useBreadcrumbDirect([{ name: "Users", href: "/users", current: true }]);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Default to 25 as requested
  const [totalItems, setTotalItems] = useState(0);

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage);
    fetchRoles();
  }, []);

  const fetchUsers = async (page = currentPage, limit = itemsPerPage) => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers(page, limit);

      // Handle the API response structure
      // Assuming the API returns: { data: users[], totalCount: number, currentPage: number, totalPages: number }
      const usersData = response?.data || response?.users || response || [];
      const totalCount =
        response?.totalCount || response?.total || usersData.length;

      setUsers(usersData);
      setTotalItems(totalCount);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await userService.getRoles();
      const rolesData = response?.data || response || [];

      const formattedRoles = rolesData.map((role) => ({
        id: role._id,
        name: role.name || role.role_name || role.title,
      }));

      setRoles(formattedRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error fetching roles");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleToggleActive = (user) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async (user) => {
    try {
      setIsSubmitting(true);
      const newStatus = !user.isActive;
      await userService.toggleUserStatus(user._id, newStatus);

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: newStatus } : u
        )
      );

      toast.success(
        `User ${!newStatus ? "deactivated" : "activated"} successfully`
      );

      setShowDeactivateModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "bg-indigo-100 text-indigo-500";
      case "manager":
        return "bg-amber-100 text-amber-600";
      case "staff":
        return "bg-slate-100 text-slate-600";
      case "user":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Helper function to get role name from roles data
  const getRoleName = (userRole) => {
    if (!userRole) return "No Role";

    // If userRole is an object with name property, return the name
    if (userRole && typeof userRole === "object" && userRole.name) {
      return userRole.name;
    }

    // If userRole is a string, check if it's a role ID or role name
    if (typeof userRole === "string") {
      // First, try to find it in the roles data (treat as ID)
      if (roles.length > 0) {
        const role = roles.find((r) => r.id === userRole);
        if (role) {
          return role.name;
        }

        // If not found by ID, check if it's already a role name
        const roleByName = roles.find((r) => r.name === userRole);
        if (roleByName) {
          return userRole; // It's already a role name
        }
      }

      // If not found in roles data, return the string as is (might be a role name)
      return userRole;
    }

    return "No Role";
  };

  // Handle user actions
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setShowUserDialog(true);
  };

  const handleUserDialogSuccess = () => {
    fetchUsers();
  };

  const handleCloseDeactivateModal = () => {
    setShowDeactivateModal(false);
    setSelectedUser(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = async (user) => {
    try {
      setIsSubmitting(true);
      await userService.deleteUser(user._id);
      toast.success("User deleted successfully");

      setShowDeleteModal(false);
      setSelectedUser(null);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      //empty catch
      toast.error("Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchUsers(1, newItemsPerPage);
  };

  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setShowChangePassword(true);
  };

  // Define table columns with minimum widths for responsive behavior
  const columns = [
    {
      key: "name",
      label: "User Name",
      width: "200px",
      minWidth: "150px",
      render: (value, user) => (
        <div className="font-medium text-slate-600 text-sm whitespace-nowrap overflow-hidden">
          {user.fullName || user.user_name}
        </div>
      ),
    },
    {
      key: "role",
      label: "User Role",
      width: "120px",
      minWidth: "100px",
      render: (value, user) => {
        const roleName = getRoleName(user.role || user.user_type);
        return (
          <div
            className={`${getRoleBadgeVariant(
              roleName
            )} rounded-full px-2.5 py-1.5 text-sm font-medium inline-flex items-center whitespace-nowrap`}
          >
            {roleName}
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      width: "250px",
      minWidth: "200px",
      render: (value, user) => (
        <div className="font-medium text-slate-600 text-sm whitespace-nowrap overflow-hidden">
          {user.email}
        </div>
      ),
    },
    {
      key: "createdBy",
      label: "Created by",
      width: "180px",
      minWidth: "150px",
      render: (value, user) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-slate-600 text-sm whitespace-nowrap overflow-hidden">
            {user.createdBy?.name || user.createdBy || "System"}
          </div>
          <div className="font-medium text-slate-500 text-sm">
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "updatedBy",
      label: "Updated by",
      width: "180px",
      minWidth: "150px",
      render: (value, user) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-slate-600 text-sm whitespace-nowrap overflow-hidden">
            {user.updatedBy?.name || user.updatedBy || "System"}
          </div>
          <div className="font-medium text-slate-500 text-sm">
            {user.updatedAt
              ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Active",
      width: "100px",
      minWidth: "80px",
      render: (value, user) => (
        <CustomSwitch
          checked={user.isActive}
          onChange={() => handleToggleActive(user)}
          size="default"
        />
      ),
    },
  ];

  // Header actions
  const headerActions = (
    <Button
      onClick={handleAddNew}
      className="bg-indigo-500 hover:bg-primary-600 text-white rounded-full px-4 py-2.5 flex items-center gap-2 font-bold text-sm"
    >
      <Plus className="w-4 h-4 rotate-90" />
      Add New
    </Button>
  );

  // Calculate pagination info
  const paginationComponent = (
    <Pagination
      currentPage={currentPage}
      totalItems={totalItems}
      rowsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleItemsPerPageChange}
    />
  );

  return (
    <>
      <CommonTable
        columns={columns}
        data={users}
        isLoading={false} // Never show full table loading
        isLoadingBody={isLoading || loading} // Show loading only in table body
        noDataText="No users found"
        title="All Users List"
        badgeCount={users.length}
        headerActions={headerActions}
        emptyStateAction={handleAddNew}
        emptyStateActionText="Add First User"
        className="rounded-[10px]"
        pagination={paginationComponent}
        actionColumnWidth="5%"
        customActions={[
          {
            label: "",
            onClick: handleEdit,
            className:
              "text-slate-600 border-0 bg-transparent hover:bg-transparent p-0 hover:!bg-transparent",
            icon: PencilLine,
            showTooltip: true,
            tooltipText: "Edit",
          },
          {
            label: "",
            onClick: handleChangePassword,
            className:
              "text-slate-600 border-0 bg-transparent hover:bg-transparent p-0 hover:!bg-transparent ",
            icon: KeyRound,
            showTooltip: true,
            tooltipText: "Change Password",
          },
        ]}
      />

      {/* Deactivate User Modal */}
      <DeactivateUserDialog
        open={showDeactivateModal}
        onClose={handleCloseDeactivateModal}
        onConfirm={handleConfirmDeactivate}
        user={selectedUser}
        loading={isSubmitting}
      />

      {/* Delete User Modal */}
      <DeleteUserDialog
        open={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        loading={isSubmitting}
      />

      {/* User Dialog (Add/Edit) */}
      <UserDialog
        open={showUserDialog}
        onClose={() => setShowUserDialog(false)}
        onSuccess={handleUserDialogSuccess}
        user={selectedUser}
        roles={roles}
        rolesLoading={rolesLoading}
      />

      {/* Change Password Modal */}
      <ChangePasswordDialog
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </>
  );
};

export default UserTable;
