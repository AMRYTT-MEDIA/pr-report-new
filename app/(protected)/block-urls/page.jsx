"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  ImageOff,
  X,
} from "lucide-react";
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
import Image from "next/image";
import { blockUrlsService } from "@/services/blockUrls";
import {
  BlockUrlDialog,
  StatusToggleDialog,
  BlockUrlDeleteDialog,
} from "@/components/block-urls";

export default function BlockURLsPage() {
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
      setError("Failed to load blocked URLs. Please try again.");
      toast.error("Failed to load blocked URLs");
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

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedUrls.size === 0) {
      toast.error("Please select URLs to approve");
      return;
    }

    try {
      // Bulk update: set isActive=true for selected
      await blockUrlsService.bulkUpdateBlocks({
        ids: Array.from(selectedUrls),
        update: { isActive: true },
      });
      toast.success(`Enabled ${selectedUrls.size} URL(s)`);
      setSelectedUrls(new Set());
      fetchBlockUrls();
    } catch (error) {
      toast.error("Failed to enable URLs");
    }
  };

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (selectedUrls.size === 0) {
      toast.error("Please select URLs to reject");
      return;
    }

    try {
      // Bulk update: set isActive=false for selected
      await blockUrlsService.bulkUpdateBlocks({
        ids: Array.from(selectedUrls),
        update: { isActive: false },
      });
      toast.success(`Disabled ${selectedUrls.size} URL(s)`);
      setSelectedUrls(new Set());
      fetchBlockUrls();
    } catch (error) {
      toast.error("Failed to disable URLs");
    }
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
      await blockUrlsService.deleteBlock(urlId);
      const updatedUrls = blockUrls.filter((url) => url._id !== urlId);
      setBlockUrls(updatedUrls);
      setTotalCount(updatedUrls.length);
      toast.success("URL deleted successfully");
      setDeleteDialogOpen(false);
      setUrlToDelete(null);
    } catch (error) {
      toast.error("Failed to delete URL");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setUrlToDelete(null);
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

  // Show loading while auth is initializing
  if (authLoading || loading) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-86px)] justify-center">
        <Loading
          size="lg"
          color="purple"
          showText={true}
          text="Loading..."
          textColor="black"
          textPosition="bottom"
        />
      </div>
    );
  }

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
          <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                Block URLs
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="flex items-center gap-2 w-full relative max-w-full sm:max-w-[400px]">
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

              {/* Enable Button */}
              <button
                onClick={handleBulkApprove}
                disabled={selectedUrls.size === 0}
                className="relative rounded-full border border-slate-300 disabled:opacity-50"
              >
                <div className="flex gap-2 items-center justify-center px-4 py-2.5">
                  <CheckCircle className="w-5 h-5 text-slate-600" />
                  <span className="font-inter font-semibold text-sm text-slate-600 whitespace-nowrap">
                    Enable
                  </span>
                </div>
              </button>

              {/* Disable Button */}
              <button
                onClick={handleBulkReject}
                disabled={selectedUrls.size === 0}
                className="relative rounded-full border border-slate-300 disabled:opacity-50"
              >
                <div className="flex gap-2 items-center justify-center px-4 py-2.5">
                  <XCircle className="w-5 h-5 text-slate-600" />
                  <span className="font-inter font-semibold text-sm text-slate-600 whitespace-nowrap">
                    Disable
                  </span>
                </div>
              </button>

              {/* Block URL Button */}
              <button
                onClick={() => setBlockUrlDialogOpen(true)}
                className="font-semibold text-sm text-danger-60 whitespace-nowrap bg-danger-10 flex gap-2 items-center px-4 py-2.5 rounded-full hover:bg-danger-20 transition-colors"
              >
                <Plus /> Block URL
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* Table Section */}
            <div className="max-h-[calc(100dvh-300px)] lg:max-h-[calc(100dvh-230px)] overflow-y-auto scrollbar-custom">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      <SimpleCheckbox
                        checked={isAllSelected}
                        indeterminate={isPartiallySelected}
                        onChange={handleSelectAll}
                        aria-label="Select all URLs"
                      />
                    </TableHead>
                    <TableHead className="w-60 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      Website Icon
                    </TableHead>
                    {/* <TableHead className="py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      Website Name
                    </TableHead> */}
                    <TableHead className="py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      Website URL
                    </TableHead>
                    <TableHead className="w-24 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      Status
                    </TableHead>
                    <TableHead className="w-24 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                {blockUrls?.length > 0 && (
                  <TableBody>
                    {blockUrls.map((url, index) => (
                      <TableRow key={url._id} className="hover:bg-gray-50">
                        <TableCell>
                          <SimpleCheckbox
                            checked={selectedUrls.has(url._id)}
                            onChange={(checked) =>
                              handleSelect(url._id, checked)
                            }
                            aria-label={`Select ${url.websiteName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
                            {url?.logo ? (
                              <Image
                                src={url.logo}
                                alt={url.logo}
                                width={138}
                                height={38}
                                className="max-w-[120px] sm:max-w-[137px] max-h-[38px] object-contain w-full h-full"
                              />
                            ) : (
                              <ImageOff className="w-6 h-6 text-gray-scale-60" />
                            )}
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          <div className="font-medium text-gray-900">
                            {url.websiteName}
                          </div>
                        </TableCell> */}
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
                    ))}
                  </TableBody>
                )}
              </Table>
            </div>

            {blockUrls?.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[368px] w-full border-t border-gray-200">
                <div className="flex flex-col items-center justify-center gap-2">
                  <NoDataFound />
                  <p className="text-gray-scale-80 text-sm font-semibold">
                    No Block URLs Found...
                  </p>
                </div>
              </div>
            )}
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
      </div>
    </div>
  );
}
