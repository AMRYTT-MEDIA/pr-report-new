"use client";

import { useState, useEffect, useRef } from "react";
import { Search, CheckCircle, XCircle, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { SimpleCheckbox } from "@/components/ui/simple-checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import Pagination from "@/components/Pagination";
import Loading from "@/components/ui/loading";
import { NoDataFound } from "@/components/icon";
import CustomTooltip from "@/components/ui/custom-tooltip";

import { blockUrlsService } from "@/services/blockUrls";
import {
  BlockUrlDialog,
  StatusToggleDialog,
  BlockUrlDeleteDialog,
} from "@/components/block-urls";
import WebsiteIcon from "@/components/ui/WebsiteIcon";

export default function BlockUrlsClient() {
  const { user, loading: authLoading } = useAuth();
  const [blockUrls, setBlockUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUrls, setSelectedUrls] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Dialog states
  const [blockUrlDialogOpen, setBlockUrlDialogOpen] = useState(false);
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false);
  const [statusToggleData, setStatusToggleData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete dialog states
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Bulk status toggle dialog states
  const [bulkStatusToggleDialogOpen, setBulkStatusToggleDialogOpen] =
    useState(false);
  const [bulkStatusToggleData, setBulkStatusToggleData] = useState(null);

  // Add refs to prevent duplicate API calls
  const isFetching = useRef(false);
  const hasInitialFetch = useRef(false);

  // Fetch block URLs
  const fetchBlockUrls = async () => {
    if (isFetching.current) {
      return;
    }

    if (authLoading || !user) {
      return;
    }

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await blockUrlsService.getBlocks(
        currentPage,
        pageSize,
        searchQuery
      );

      if (response) {
        setBlockUrls(response.data || response || []);
        setTotalCount(response.totalCount || response.length || 0);
      }
    } catch (error) {
      setError(error.message || "Failed to load blocked URLs");
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to load blocked URLs"
      );
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
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

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUrls(new Set(blockUrls.map((url) => url._id)));
    } else {
      setSelectedUrls(new Set());
    }
  };

  // Handle individual select
  const handleSelect = (urlId, checked) => {
    const newSelected = new Set(selectedUrls);
    if (checked) {
      newSelected.add(urlId);
    } else {
      newSelected.delete(urlId);
    }
    setSelectedUrls(newSelected);
  };

  // Handle bulk activate
  const handleBulkActivate = async () => {
    if (selectedUrls.size === 0) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Please select URLs to approve"
      );
      return;
    }

    setBulkStatusToggleData({
      action: "activate",
      selectedCount: selectedUrls.size,
      newStatus: true,
    });
    setBulkStatusToggleDialogOpen(true);
  };

  // Handle bulk deactivate
  const handleBulkDeactivate = async () => {
    if (selectedUrls.size === 0) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Please select URLs to reject"
      );
      return;
    }

    setBulkStatusToggleData({
      action: "deactivate",
      selectedCount: selectedUrls.size,
      newStatus: false,
    });
    setBulkStatusToggleDialogOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedUrls.size === 0) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Please select URLs to delete"
      );
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  // Handle toggle status - opens confirmation dialog
  const handleToggleStatus = (urlId, newStatus) => {
    const url = blockUrls.find((u) => u._id === urlId);
    if (url) {
      setStatusToggleData({ ...url, newStatus });
      setStatusToggleDialogOpen(true);
    }
  };

  // Handle status toggle success from dialog
  const handleStatusToggleSuccess = (urlId, newStatus) => {
    const updatedUrls = blockUrls.map((url) =>
      url._id === urlId ? { ...url, isActive: newStatus } : url
    );
    setBlockUrls(updatedUrls);
  };

  // Handle delete click - opens confirmation dialog
  const handleDeleteClick = (url) => {
    setUrlToDelete(url);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (urlId) => {
    setIsDeleting(true);
    try {
      const response = await blockUrlsService.deleteBlock(urlId);
      const updatedUrls = blockUrls.filter((url) => url._id !== urlId);
      setBlockUrls(updatedUrls);
      setTotalCount(updatedUrls.length);
      toast.success(response.message || "URL deleted successfully");
      setDeleteDialogOpen(false);
      setUrlToDelete(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete URL"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setUrlToDelete(null);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    setIsBulkDeleting(true);
    try {
      const response = await blockUrlsService.bulkDeleteBlocks(
        Array.from(selectedUrls)
      );
      toast.success(response.message || `Deleted ${selectedUrls.size} URL(s)`);
      setSelectedUrls(new Set());
      setBulkDeleteDialogOpen(false);
      fetchBlockUrls();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete URLs"
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Handle bulk delete dialog close
  const handleBulkDeleteDialogClose = () => {
    setBulkDeleteDialogOpen(false);
  };

  // Handle bulk status toggle confirmation
  const handleBulkStatusToggleConfirm = async (newStatus) => {
    const action = bulkStatusToggleData?.action;

    try {
      let response;
      if (action === "activate") {
        response = await blockUrlsService.bulkActivateBlocks(
          Array.from(selectedUrls)
        );
        toast.success(
          response.message || `Enabled ${selectedUrls.size} URL(s)`
        );
      } else if (action === "deactivate") {
        response = await blockUrlsService.bulkDeactivateBlocks(
          Array.from(selectedUrls)
        );
        toast.success(
          response.message || `Disabled ${selectedUrls.size} URL(s)`
        );
      }

      setSelectedUrls(new Set());
      setBulkStatusToggleDialogOpen(false);
      setBulkStatusToggleData(null);
      fetchBlockUrls();
    } catch (error) {
      const actionText = action === "activate" ? "enable" : "disable";
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          `Failed to ${actionText} URLs`
      );
      throw error; // Re-throw to handle loading state in dialog
    }
  };

  // Handle bulk status toggle dialog close
  const handleBulkStatusToggleDialogClose = () => {
    setBulkStatusToggleDialogOpen(false);
    setBulkStatusToggleData(null);
  };

  // Set breadcrumb
  useBreadcrumbDirect([
    { name: "Block URLs", href: "/block-urls", current: true },
  ]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (!authLoading && user && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchBlockUrls();
    }
  }, [authLoading, user]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (!authLoading && user && hasInitialFetch.current) {
          fetchBlockUrls();
        }
      },
      searchQuery ? 500 : 0
    ); // Immediate load for page changes, debounced for search

    return () => clearTimeout(timeoutId);
  }, [currentPage, pageSize, searchQuery]);

  // Cleanup function
  useEffect(() => {
    return () => {
      isFetching.current = false;
      hasInitialFetch.current = false;
    };
  }, []);

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const isAllSelected =
    blockUrls.length > 0 && selectedUrls.size === blockUrls.length;
  const isPartiallySelected =
    selectedUrls.size > 0 && selectedUrls.size < blockUrls.length;

  return (
    <div className="bg-gray-50">
      <div className="mx-auto">
        <div className="bg-white shadow-sm border rounded-lg border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 gap-3.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                Block URLs
              </h1>
              <div className="text-sm text-primary-60 px-3 py-0.5 border border-primary-60 rounded-full">
                {totalCount}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="flex items-center gap-2 w-full relative max-w-full sm:max-w-[400px] order-2 sm:order-1">
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

              <div className="flex items-center gap-2 order-1 sm:order-2">
                {/* Enable Button */}
                <button
                  onClick={handleBulkActivate}
                  disabled={selectedUrls.size === 0}
                  className="relative rounded-full border border-slate-300 disabled:opacity-50"
                >
                  <div className="flex gap-2 items-center justify-center px-4 py-2.5 font-inter font-semibold text-sm text-slate-600 whitespace-nowrap">
                    <CheckCircle className="w-5 h-5 text-slate-600" />
                    <span className="hidden lg:block">Enable</span>
                  </div>
                </button>

                {/* Disable Button */}
                <button
                  onClick={handleBulkDeactivate}
                  disabled={selectedUrls.size === 0}
                  className="relative rounded-full border border-slate-300 disabled:opacity-50"
                >
                  <div className="flex gap-2 items-center justify-center px-4 py-2.5 font-inter font-semibold text-sm text-slate-600 whitespace-nowrap">
                    <XCircle className="w-5 h-5 text-slate-600" />
                    <span className="hidden lg:block">Disable</span>
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedUrls.size === 0}
                  className="relative rounded-full border border-slate-300 disabled:opacity-50"
                >
                  <div className="flex gap-2 items-center justify-center px-4 py-2.5 font-inter font-semibold text-sm text-slate-600 whitespace-nowrap">
                    <Trash2 className="w-5 h-5 text-slate-600" />
                    <span className="hidden lg:block">Delete</span>
                  </div>
                </button>

                {/* Block URL Button */}
                <button
                  onClick={() => setBlockUrlDialogOpen(true)}
                  className="font-semibold text-sm text-danger-60 whitespace-nowrap bg-danger-10 flex gap-2 items-center px-4 py-2.5 rounded-full hover:bg-danger-20 transition-colors"
                >
                  <Plus className="w-5 h-5" />{" "}
                  <span className="hidden lg:block">Block URL</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* Table Section */}
            <div className="max-h-[calc(100dvh-400px)] sm:max-h-[calc(100dvh-290px)] xl:max-h-[calc(100dvh-230px)] overflow-y-auto scrollbar-custom">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                  <TableRow>
                    <TableHead className="w-16 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      <SimpleCheckbox
                        checked={isAllSelected}
                        indeterminate={isPartiallySelected}
                        onChange={handleSelectAll}
                        aria-label="Select all URLs"
                      />
                    </TableHead>
                    <TableHead className="w-[200px] py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800 whitespace-nowrap">
                      Website Icon
                    </TableHead>
                    <TableHead className="py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800 whitespace-nowrap">
                      Website Name
                    </TableHead>
                    <TableHead className="py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800 whitespace-nowrap">
                      Website URL
                    </TableHead>
                    <TableHead className="w-24 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800 whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="w-24 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800 whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-[calc(100dvh-450px)] sm:h-[calc(100dvh-340px)] xl:h-[calc(100dvh-280px)]"
                      >
                        <Loading size="lg" />
                      </TableCell>
                    </TableRow>
                  ) : blockUrls?.length === 0 ? (
                    <TableRow className="hover:bg-white">
                      <TableCell
                        colSpan={5}
                        className="text-center h-[calc(100dvh-450px)] sm:h-[calc(100dvh-340px)] xl:h-[calc(100dvh-280px)]"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3 h-full">
                          <NoDataFound width={105} height={130} />
                          <div>
                            <h3 className="text-lg font-medium text-slate-900">
                              No Block URLs Found...
                            </h3>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    blockUrls?.map((url, index) => (
                      <TableRow
                        key={url._id}
                        className="hover:bg-gray-50 w-[200px]"
                      >
                        <TableCell>
                          <SimpleCheckbox
                            checked={selectedUrls.has(url._id)}
                            onChange={(checked) =>
                              handleSelect(url._id, checked)
                            }
                            aria-label={`Select ${url.websiteName}`}
                          />
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
                            <WebsiteIcon
                              logoFilename={url?.website_id?.logo}
                              websiteName={
                                url?.website_id?.name || url?.domain || "-"
                              }
                              size="default"
                              alt={url?.website_id?.name || url?.domain}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {url?.website_id?.name || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600 truncate max-w-xs">
                            {url.domain}
                          </div>
                        </TableCell>
                        <TableCell>
                          <CustomSwitch
                            checked={url.isActive}
                            onChange={(checked) =>
                              handleToggleStatus(url._id, checked)
                            }
                            size="default"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CustomTooltip content="Delete" position="top">
                              <button
                                onClick={() => handleDeleteClick(url)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </CustomTooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            totalItems={totalCount}
            currentPage={currentPage}
            rowsPerPage={pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handlePageSizeChange}
          />
        </div>

        {/* Block URL Dialog */}
        <BlockUrlDialog
          isOpen={blockUrlDialogOpen}
          onClose={() => setBlockUrlDialogOpen(false)}
          onSuccess={fetchBlockUrls}
        />

        {/* Status Toggle Confirmation Dialog */}
        <StatusToggleDialog
          isOpen={statusToggleDialogOpen}
          onClose={() => {
            setStatusToggleDialogOpen(false);
            setStatusToggleData(null);
          }}
          onSuccess={handleStatusToggleSuccess}
          urlData={statusToggleData}
          newStatus={statusToggleData?.newStatus}
        />

        {/* Delete Confirmation Dialog */}
        <BlockUrlDeleteDialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          loading={isDeleting}
          urlData={urlToDelete}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <BlockUrlDeleteDialog
          open={bulkDeleteDialogOpen}
          onClose={handleBulkDeleteDialogClose}
          onConfirm={handleBulkDeleteConfirm}
          loading={isBulkDeleting}
          title="Confirm Bulk Delete"
          selectedCount={selectedUrls.size}
          isBulkDelete={true}
        />

        {/* Bulk Status Toggle Confirmation Dialog */}
        <StatusToggleDialog
          isOpen={bulkStatusToggleDialogOpen}
          onClose={handleBulkStatusToggleDialogClose}
          newStatus={bulkStatusToggleData?.newStatus}
          isBulkOperation={true}
          selectedCount={bulkStatusToggleData?.selectedCount}
          onBulkConfirm={handleBulkStatusToggleConfirm}
        />
      </div>
    </div>
  );
}
