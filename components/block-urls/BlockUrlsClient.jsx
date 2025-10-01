"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { SimpleCheckbox } from "@/components/ui/simple-checkbox";
// Using CommonTable instead of raw table components
import { useAuth } from "@/lib/auth";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import Pagination from "@/components/Pagination";
import { CommonTable, SearchInput } from "@/components/common";
// Empty state handled by CommonTable

import { blockUrlsService } from "@/services/blockUrls";
import { BlockUrlDialog, StatusToggleDialog, BlockUrlDeleteDialog } from "@/components/block-urls";
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
  const [bulkStatusToggleDialogOpen, setBulkStatusToggleDialogOpen] = useState(false);
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
      const response = await blockUrlsService.getBlocks(currentPage, pageSize, searchQuery);

      if (response) {
        setBlockUrls(response.data || response || []);
        setTotalCount(response.totalCount || response.length || 0);
      }
    } catch (error) {
      setError(error.message || "Failed to load blocked URLs");
      toast.error(error?.response?.data?.message || error.message || "Failed to load blocked URLs");
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

  // Selection handlers for CommonTable
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedUrls(new Set(blockUrls.map((url) => url._id)));
    } else {
      setSelectedUrls(new Set());
    }
  };

  const handleRowSelect = (row, isSelected) => {
    const newSelected = new Set(selectedUrls);
    if (isSelected) {
      newSelected.add(row._id);
    } else {
      newSelected.delete(row._id);
    }
    setSelectedUrls(newSelected);
  };

  // Handle bulk activate
  const handleBulkActivate = () => {
    if (selectedUrls.size === 0) {
      toast.error(error?.response?.data?.message || error.message || "Please select URLs to approve");
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
  const handleBulkDeactivate = () => {
    if (selectedUrls.size === 0) {
      toast.error(error?.response?.data?.message || error.message || "Please select URLs to reject");
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
  const handleBulkDelete = () => {
    if (selectedUrls.size === 0) {
      toast.error(error?.response?.data?.message || error.message || "Please select URLs to delete");
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
    const updatedUrls = blockUrls.map((url) => (url._id === urlId ? { ...url, isActive: newStatus } : url));
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
      toast.error(error?.response?.data?.message || error.message || "Failed to delete URL");
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
      const response = await blockUrlsService.bulkDeleteBlocks(Array.from(selectedUrls));
      toast.success(response.message || `Deleted ${selectedUrls.size} URL(s)`);
      setSelectedUrls(new Set());
      setBulkDeleteDialogOpen(false);
      fetchBlockUrls();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete URLs");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Handle bulk delete dialog close
  const handleBulkDeleteDialogClose = () => {
    setBulkDeleteDialogOpen(false);
  };

  // Handle bulk status toggle confirmation
  const handleBulkStatusToggleConfirm = async (_newStatus) => {
    const action = bulkStatusToggleData?.action;

    try {
      let response;
      if (action === "activate") {
        response = await blockUrlsService.bulkActivateBlocks(Array.from(selectedUrls));
        toast.success(response.message || `Enabled ${selectedUrls.size} URL(s)`);
      } else if (action === "deactivate") {
        response = await blockUrlsService.bulkDeactivateBlocks(Array.from(selectedUrls));
        toast.success(response.message || `Disabled ${selectedUrls.size} URL(s)`);
      }

      setSelectedUrls(new Set());
      setBulkStatusToggleDialogOpen(false);
      setBulkStatusToggleData(null);
      fetchBlockUrls();
    } catch (error) {
      const actionText = action === "activate" ? "enable" : "disable";
      toast.error(error?.response?.data?.message || error.message || `Failed to ${actionText} URLs`);
      throw error; // Re-throw to handle loading state in dialog
    }
  };

  // Handle bulk status toggle dialog close
  const handleBulkStatusToggleDialogClose = () => {
    setBulkStatusToggleDialogOpen(false);
    setBulkStatusToggleData(null);
  };

  // Set breadcrumb
  useBreadcrumbDirect([{ name: "Block URLs", href: "/block-urls", current: true }]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (!authLoading && user && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchBlockUrls();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchQuery]);

  // Cleanup function
  useEffect(
    () => () => {
      isFetching.current = false;
      hasInitialFetch.current = false;
    },
    []
  );

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const selectedRows = blockUrls.filter((u) => selectedUrls.has(u._id));

  // Define CommonTable columns preserving widths
  const columns = [
    {
      key: "websiteIcon",
      label: "Website Icon",
      width: "200px",
      render: (value, row) => (
        <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
          <WebsiteIcon
            logoFilename={row?.website_id?.logo}
            websiteName={row?.website_id?.name || row?.domain || "-"}
            size="default"
            alt={row?.website_id?.name || row?.domain}
          />
        </div>
      ),
    },
    {
      key: "name",
      label: "Website Name",
      width: "25%",
      render: (value, row) => <div className="font-medium text-slate-900">{row?.website_id?.name || "-"}</div>,
    },
    {
      key: "domain",
      label: "Website URL",
      width: "40%",
      render: (value, row) => <div className="text-slate-600 truncate max-w-xs">{row?.url}</div>,
    },
    {
      key: "status",
      label: "Status",
      width: "10%",
      render: (value, row) => (
        <CustomSwitch
          checked={row.isActive}
          onChange={(checked) => handleToggleStatus(row._id, checked)}
          size="default"
        />
      ),
    },
  ];

  // Header actions (search + bulk buttons)
  const headerActions = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-2 w-full sm:w-auto">
      <div className="w-full sm:max-w-[400px] order-2 sm:order-1">
        <SearchInput value={searchQuery} onChange={handleSearch} onClear={handleClearSearch} />
      </div>

      <div className="flex items-center gap-2 order-1 sm:order-2">
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

        <button
          onClick={() => setBlockUrlDialogOpen(true)}
          className="font-semibold text-sm text-red-600 whitespace-nowrap bg-red-100 flex gap-2 items-center px-4 py-2.5 rounded-full hover:bg-red-200 transition-colors"
        >
          <Plus className="w-5 h-5" /> <span className="hidden lg:block">Block URL</span>
        </button>
      </div>
    </div>
  );

  // Pagination component (rendered inline in JSX)

  return (
    <div className="bg-white">
      <div className="mx-auto">
        <CommonTable
          columns={columns}
          data={blockUrls}
          isLoading={false}
          isLoadingBody={loading}
          title="Block URLs"
          badgeCount={totalCount}
          headerActions={headerActions}
          headerInnerClassName="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5"
          showCheckbox={true}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          renderSelectAllCheckbox={({ checked, indeterminate, onChange }) => (
            <SimpleCheckbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={onChange}
              aria-label="Select all URLs"
            />
          )}
          renderRowCheckbox={({ row, checked, onChange }) => (
            <SimpleCheckbox
              checked={checked}
              onChange={(isSel) => onChange(isSel)}
              aria-label={`Select ${row?.website_id?.name || row?.domain || "URL"}`}
            />
          )}
          showActions={true}
          actionColumnLabel="Actions"
          customActions={[
            {
              label: "",
              onClick: (row) => handleDeleteClick(row),
              className:
                "text-red-600 hover:text-red-600 border-0 bg-transparent hover:bg-transparent p-0 hover:!bg-transparent",
              icon: Trash2,
              showTooltip: true,
              tooltipText: "Delete",
            },
          ]}
          noDataText="No Block URLs Found..."
          className="rounded-[10px]"
          pagination={
            <Pagination
              totalItems={totalCount}
              currentPage={currentPage}
              rowsPerPage={pageSize}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
            />
          }
        />

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
