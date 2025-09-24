"use client";

import React, { useState, useEffect } from "react";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListRestart, Plus, Search, Trash2, X, PencilLine } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import WebsiteAvatar from "@/components/ui/website-avatar";
import CustomTooltip from "@/components/ui/custom-tooltip";
import Pagination from "@/components/Pagination";
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
import { NoDataFound } from "@/components/icon";
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

  return (
    <div className="bg-gray-50">
      <div className="mx-auto">
        <div className="bg-white shadow-sm border rounded-lg border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="px-4 sm:px-6 py-4 block sm:flex justify-between items-start w-full sm:items-center border-b border-gray-200">
            <div className="items-center gap-2 hidden sm:flex">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                {WebsiteConstants.allWebsites}
              </h1>
              <div className="text-sm text-primary-60 px-3 py-0.5 border border-primary-60 rounded-full">
                {totalCount}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <div className="flex order-2 sm:order-1 items-center gap-2 w-full relative max-w-full sm:max-w-[400px]">
                <Search className="w-4 h-4 absolute left-4 text-slate-600" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 rounded-[41px] border-slate-200 text-slate-600 placeholder:text-slate-600 font-semibold focus:border-primary-50 placeholder:text-gray-scale-60 placeholder:opacity-50"
                />
                {searchQuery && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                    <X
                      className="h-6 w-6 text-muted-foreground bg-gray-100 rounded-xl p-1"
                      onClick={handleClearSearch}
                    />
                  </div>
                )}
              </div>
              <div className="flex order-1 sm:order-2 justify-between w-full sm:w-auto">
                <div className="items-center gap-2 flex sm:hidden">
                  <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                    {WebsiteConstants.allWebsites}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {canManageWebsite(user) && (
                    <>
                      <Button
                        onClick={() => setReOrderWebsiteDialog(true)}
                        className="text-slate-600 border border-slate-200 rounded-[39px] px-4 py-2.5 font-semibold bg-transparent hover:bg-slate-50"
                      >
                        <ListRestart className="w-4 h-4 text-slate-600" />
                        <span className="hidden md:inline">
                          {WebsiteConstants.reOrder}
                        </span>
                      </Button>
                      <Button
                        onClick={handleAddNewWebsite}
                        className="text-white px-4 py-2.5 flex items-center gap-2 bg-primary-50 hover:bg-primary-60 rounded-[39px]"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span className="hidden md:inline">
                          {WebsiteConstants.addNew}
                        </span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <div
              className="max-h-[calc(100dvh-340px)] sm:max-h-[calc(100dvh-300px)] lg:max-h-[calc(100dvh-234px)] overflow-y-auto scrollbar-custom"
              style={loading ? { paddingRight: "10px" } : {}}
            >
              <table className="w-full divide-y divide-slate-200 table-auto">
                <thead className="bg-slate-50 w-full sticky top-0 z-10">
                  <tr className="w-full">
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 w-[4%]">
                      {WebsiteConstants.no}
                    </th>
                    <th className="px-6 py-3.5  text-sm font-semibold text-slate-800 w-[15%] text-left whitespace-nowrap">
                      {WebsiteConstants.websiteIcon}
                    </th>
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 w-[25%] whitespace-nowrap">
                      {WebsiteConstants.websiteName}
                    </th>
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 w-[40%] whitespace-nowrap">
                      {WebsiteConstants.websiteUrl}
                    </th>
                    {canManageWebsite(user) && (
                      <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 w-[10%] whitespace-nowrap">
                        {WebsiteConstants.actions}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <>
                      {/* Loading */}
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center h-[calc(100dvh-350px)] lg:h-[calc(100dvh-284px)]"
                        >
                          <Loading size="lg" />
                        </td>
                      </tr>
                    </>
                  ) : filteredWebsites?.length === 0 ? (
                    <>
                      {/* No Data Found */}
                      <tr>
                        <td
                          colSpan={5}
                          className=" text-center h-[calc(100dvh-350px)] lg:h-[calc(100dvh-284px)]"
                        >
                          <div className="flex flex-col items-center justify-center space-y-3 h-full">
                            <NoDataFound width={105} height={130} />
                            <div>
                              <h3 className="text-lg font-medium text-slate-900">
                                {searchQuery
                                  ? WebsiteConstants.noWebsiteFound
                                  : WebsiteConstants.noWebsiteYetTitle}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">
                                {searchQuery
                                  ? WebsiteConstants.noDataFoundDescription
                                  : WebsiteConstants.addFirstWebsiteDescription}
                              </p>
                            </div>
                            {!searchQuery && canManageWebsite(user) && (
                              <Button
                                onClick={handleAddFirstWebsite}
                                className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-6"
                              >
                                <Plus className="w-4 h-4" />
                                {WebsiteConstants.addFirstWebsite}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    </>
                  ) : (
                    filteredWebsites?.map((website, index) => (
                      <tr
                        key={website._id || website.id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-3">
                          <p className="text-sm font-medium text-slate-600">
                            {index + 1}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <WebsiteIcon
                            logoFilename={website.logo}
                            websiteName={website.name}
                            size="default"
                            alt={website.name}
                          />
                        </td>
                        <td className="px-6 py-3">
                          {/* {needsTruncation(website.name, "name") ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-sm font-medium text-gray-scale-60 truncate cursor-help ">
                                    {formatTitle(website.name, "name")}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent
                                  className="max-w-sm bg-gray-900 text-white border-gray-700"
                                  side="top"
                                  align="start"
                                >
                                  <div className="break-words">
                                    {website.name}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <p className="text-sm font-medium text-gray-scale-60">
                              {website.name || "-"}
                            </p>
                          )} */}
                          <p className="text-sm font-medium text-gray-scale-60">
                            {website.name || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex-1 min-w-0">
                            {/* {needsTruncation(website.domain, "url") ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm font-medium text-gray-scale-60 truncate cursor-help">
                                      {formatTitle(website.domain, "url")}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    className="max-w-sm bg-gray-900 text-white border-gray-700"
                                    side="top"
                                    align="start"
                                  >
                                    <div className="break-words">
                                      {website.domain}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <p className="text-sm font-medium text-gray-scale-60">
                                {website.domain || "-"}
                              </p>
                            )} */}
                            <p className="text-sm font-medium text-gray-scale-60">
                              {website.domain || "-"}
                            </p>
                          </div>
                        </td>
                        {canManageWebsite(user) && (
                          <td className="px-6 py-3">
                            <div className="flex gap-8 items-center">
                              <CustomTooltip
                                content="Edit"
                                position={
                                  filteredWebsites?.length > 1 &&
                                  filteredWebsites?.length - 1 === index
                                    ? "top"
                                    : "bottom"
                                }
                              >
                                <button
                                  onClick={() => handleEdit(website)}
                                  className="text-slate-600 flex text-sm font-medium"
                                >
                                  <PencilLine className="w-4 h-4" />
                                </button>
                              </CustomTooltip>
                              <CustomTooltip
                                content="Delete"
                                position={
                                  filteredWebsites?.length > 1 &&
                                  filteredWebsites?.length - 1 === index
                                    ? "top"
                                    : "bottom"
                                }
                              >
                                <button
                                  onClick={() => handleDelete(website)}
                                  className="text-red-600 flex text-sm font-medium"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </CustomTooltip>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredWebsites?.length > 0 && (
            <Pagination
              totalItems={totalCount}
              currentPage={currentPage}
              rowsPerPage={pageSize}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>

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
    </div>
  );
};

export default WebsiteTableClient;
