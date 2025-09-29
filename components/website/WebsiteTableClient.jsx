"use client";

import React, { useState, useEffect } from "react";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListRestart, Plus, Search, Trash2, X, PencilLine } from "lucide-react";
import Pagination from "@/components/Pagination";
import { CommonTable } from "@/components/common";
import Loading from "@/components/ui/loading";
import {
  AddNewWebsiteDialog,
  WebsiteDeleteDialog,
  WebsiteReOrderDialog,
} from "@/components/website";
import { toast } from "sonner";
import { websitesService } from "@/services/websites";
import { useAuth } from "@/lib/auth";
import { canManageWebsite } from "@/lib/rbac";
// (NoDataFound removed; CommonTable handles empty state)
import WebsiteConstants from "@/components/website/constans";
import WebsiteIcon from "../ui/WebsiteIcon";

const WebsiteTableClient = ({
  initialWebsites = [],
  initialTotalCount = 0,
}) => {
  const { user } = useAuth();
  const [websites, setWebsites] = useState(initialWebsites);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [addEditWebsiteDialog, setAddEditWebsiteDialog] = useState(false);
  const [editWebsite, setEditWebsite] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reOrderWebsiteDialog, setReOrderWebsiteDialog] = useState(false);

  // Direct render - no useEffect needed
  useBreadcrumbDirect([{ name: "Website", href: "/website", current: true }]);

  // Custom hook for loading websites
  const useWebsitesData = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const loadWebsites = async (
      page = currentPage,
      size = pageSize,
      search = null
    ) => {
      setLoading(true);
      try {
        const response = await websitesService.getWebsitesPaginated(
          page,
          size,
          search
        );
        setWebsites(response.data || response.websites || []);
        setTotalCount(response.totalCount || response.total || 0);
      } catch (error) {
        console.error("Error loading websites:", error);
        toast.error(
          error.message || "Failed to load websites. Please try again."
        );
        setWebsites([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    const refreshData = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    // Main effect to load websites when dependencies change
    useEffect(() => {
      const timeoutId = setTimeout(
        () => {
          if (searchQuery.trim()) {
            loadWebsites(currentPage, pageSize, searchQuery.trim());
          } else {
            loadWebsites(currentPage, pageSize);
          }
        },
        searchQuery ? 500 : 0
      ); // Immediate load for page changes, debounced for search

      return () => clearTimeout(timeoutId);
    }, [currentPage, pageSize, searchQuery, refreshTrigger]);

    return { refreshData };
  };

  const { refreshData } = useWebsitesData();

  // Use websites directly since filtering is now done on backend
  const filteredWebsites = websites;

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Handle add new website
  const handleAddWebsite = (newWebsite) => {
    refreshData();
    setEditWebsite(null);
  };

  // Handle edit website
  const handleEdit = (website) => {
    setEditWebsite(website);
    setAddEditWebsiteDialog(true);
  };

  // Handle update website after edit
  const handleUpdateWebsite = (updatedWebsite) => {
    refreshData();
    setEditWebsite(null);
  };

  // Handle data change from reorder dialog
  const handleDataChanged = () => {
    refreshData();
  };

  // Handle delete website
  const handleDelete = (website) => {
    setWebsiteToDelete(website);
    setDeleteDialog(true);
  };

  // Confirm delete website
  const confirmDelete = async () => {
    if (!websiteToDelete) return;

    setIsDeleting(true);
    try {
      await websitesService.deleteWebsite(
        websiteToDelete._id || websiteToDelete.id,
        websiteToDelete.logo // Pass logo filename for deletion
      );

      refreshData();
      toast.success("Website deleted successfully!");
    } catch (error) {
      console.error("Error deleting website:", error);
      toast.error(
        error.message || "Failed to delete website. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setDeleteDialog(false);
      setWebsiteToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialog(false);
    setWebsiteToDelete(null);
  };

  // Clear search function
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handle add new website button click
  const handleAddNewWebsite = () => {
    setEditWebsite(null);
    setAddEditWebsiteDialog(true);
  };

  // Handle add first website button click
  const handleAddFirstWebsite = () => {
    setEditWebsite(null);
    setAddEditWebsiteDialog(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setAddEditWebsiteDialog(false);
    setEditWebsite(null);
  };

  const formatTitle = (title, type) => {
    let maxLength = 50;
    if (type === "name") {
      maxLength = 20;
    } else if (type === "url") {
      maxLength = 50;
    }
    if (!title) return "-";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Check if title needs truncation
  const needsTruncation = (title, type) => {
    let maxLength = 50;
    if (type === "name") {
      maxLength = 20;
    } else if (type === "url") {
      maxLength = 50;
    }
    return title && title.length > maxLength;
  };

  // CommonTable columns (preserve widths and order)
  const columns = [
    {
      key: "no",
      label: WebsiteConstants.no,
      width: "4%",
      render: (value, row, index) => (
        <p className="text-sm font-medium text-slate-600">{index + 1}</p>
      ),
    },
    {
      key: "websiteIcon",
      label: WebsiteConstants.websiteIcon,
      width: "15%",
      render: (value, row) => (
        <WebsiteIcon
          logoFilename={row.logo}
          websiteName={row.name}
          size="default"
          alt={row.name}
        />
      ),
    },
    {
      key: "name",
      label: WebsiteConstants.websiteName,
      width: "25%",
      render: (value, row) => (
        <p className="text-sm font-medium text-slate-600">{row.name || "-"}</p>
      ),
    },
    {
      key: "domain",
      label: WebsiteConstants.websiteUrl,
      width: "40%",
      render: (value, row) => (
        <p className="text-sm font-medium text-slate-600">
          {row.domain || "-"}
        </p>
      ),
    },
  ];

  // Header actions for CommonTable (search + actions)
  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="relative  sm:max-w-[400px] lg:w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-9 pr-8 py-2.5 rounded-[41px] border-slate-200 text-slate-600 placeholder:text-slate-600 font-semibold focus:border-indigo-500 placeholder:opacity-50"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-6 w-6 text-muted-foreground bg-slate-200 rounded-xl p-1" />
          </button>
        )}
      </div>
      {canManageWebsite(user) && (
        <>
          <Button
            onClick={() => setReOrderWebsiteDialog(true)}
            className="text-slate-600 border border-slate-200 rounded-[39px] px-4 py-2.5 font-semibold bg-transparent hover:bg-slate-50"
          >
            <ListRestart className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">{WebsiteConstants.reOrder}</span>
          </Button>
          <Button
            onClick={handleAddNewWebsite}
            className="text-white px-4 py-2.5 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 rounded-[39px]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="hidden md:inline">{WebsiteConstants.addNew}</span>
          </Button>
        </>
      )}
    </div>
  );

  // Pagination component for CommonTable
  const paginationComponent = (
    <Pagination
      totalItems={totalCount}
      currentPage={currentPage}
      rowsPerPage={pageSize}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handlePageSizeChange}
    />
  );

  return (
    <>
      {/* Table Section -> Replaced with CommonTable */}
      <CommonTable
        columns={columns}
        data={filteredWebsites}
        isLoading={false}
        isLoadingBody={loading}
        title={WebsiteConstants.allWebsites}
        badgeCount={totalCount}
        headerActions={headerActions}
        showActions={canManageWebsite(user)}
        customActions={
          canManageWebsite(user)
            ? [
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
                  onClick: handleDelete,
                  className:
                    "text-red-600 hover:text-red-600 border-0 bg-transparent hover:bg-transparent p-0 hover:!bg-transparent ml-2",
                  icon: Trash2,
                  showTooltip: true,
                  tooltipText: "Delete",
                },
              ]
            : []
        }
        noDataText={
          searchQuery
            ? WebsiteConstants.noWebsiteFound
            : WebsiteConstants.noWebsiteYetTitle
        }
        emptyStateAction={
          !searchQuery && canManageWebsite(user)
            ? handleAddFirstWebsite
            : undefined
        }
        emptyStateActionText={WebsiteConstants.addFirstWebsite}
        className="rounded-[10px]"
        headerInnerClassName="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        pagination={paginationComponent}
      />

      {/* Add/ Edit Website Dialog */}
      <AddNewWebsiteDialog
        isOpen={addEditWebsiteDialog}
        onClose={handleDialogClose}
        onWebsiteAdded={handleAddWebsite}
        editWebsite={editWebsite}
        onEditWebsite={handleUpdateWebsite}
      />

      {/* Delete Confirmation Dialog */}
      <WebsiteDeleteDialog
        isOpen={deleteDialog}
        website={websiteToDelete}
        confirmDelete={confirmDelete}
        cancelDelete={cancelDelete}
      />

      {/* Re Order Website Dialog */}
      <WebsiteReOrderDialog
        isOpen={reOrderWebsiteDialog}
        onClose={() => setReOrderWebsiteDialog(false)}
        onDataChanged={handleDataChanged}
      />
    </>
  );
};

export default WebsiteTableClient;
