"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, CheckCircle, XCircle, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
// Removed Button and Input imports as we're using custom styled buttons to match Figma design
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { BlockUrlDialog, StatusToggleDialog } from "@/components/block-urls";

export default function BlockURLsPage() {
  const { user, loading: authLoading } = useAuth();
  const [blockUrls, setBlockUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUrls, setSelectedUrls] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [blockUrlDialogOpen, setBlockUrlDialogOpen] = useState(false);
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false);
  const [statusToggleData, setStatusToggleData] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Add refs to prevent duplicate API calls
  const isFetching = useRef(false);
  const hasInitialFetch = useRef(false);

  // URL state
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  // Mock data for now - will be replaced with API calls
  const mockData = [
    {
      id: 1,
      websiteName: "TechCrunch",
      websiteUrl: "https://techcrunch.com",
      logoUrl: "/logos/techcrunch.png",
      isBlocked: false,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      websiteName: "Forbes",
      websiteUrl: "https://forbes.com",
      logoUrl: "/logos/forbes.png",
      isBlocked: true,
      createdAt: "2024-01-14",
    },
    {
      id: 3,
      websiteName: "CNN",
      websiteUrl: "https://cnn.com",
      logoUrl: "/logos/cnn.png",
      isBlocked: false,
      createdAt: "2024-01-13",
    },
    {
      id: 4,
      websiteName: "BBC News",
      websiteUrl: "https://bbc.com/news",
      logoUrl: "/logos/bbc.png",
      isBlocked: true,
      createdAt: "2024-01-12",
    },
    {
      id: 5,
      websiteName: "The Guardian",
      websiteUrl: "https://theguardian.com",
      logoUrl: "/logos/guardian.png",
      isBlocked: false,
      createdAt: "2024-01-11",
    },
  ];

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
      } else {
        // Fallback to mock data if API is not available
        setBlockUrls(mockData);
        setTotalCount(mockData.length);
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
  const handleSearch = () => {
    setCurrentPage(1);
    fetchBlockUrls();
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
      setSelectedUrls(new Set(blockUrls.map((url) => url.id)));
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
      // Bulk update blocks: set isBlocked=false for selected
      await blockUrlsService.bulkUpdateBlocks({
        ids: Array.from(selectedUrls),
        update: { isBlocked: false },
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
      // Bulk update blocks: set isBlocked=true for selected
      await blockUrlsService.bulkUpdateBlocks({
        ids: Array.from(selectedUrls),
        update: { isBlocked: true },
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
    const url = blockUrls.find((u) => u.id === urlId);
    if (url) {
      setStatusToggleData({ ...url, newStatus });
      setStatusToggleDialogOpen(true);
    }
  };

  // Handle status toggle success from dialog
  const handleStatusToggleSuccess = (urlId, newStatus) => {
    const updatedUrls = blockUrls.map((url) =>
      url.id === urlId ? { ...url, isBlocked: newStatus } : url
    );
    setBlockUrls(updatedUrls);
  };

  // Handle delete
  const handleDelete = async (urlId) => {
    try {
      await blockUrlsService.deleteBlock(urlId);
      const updatedUrls = blockUrls.filter((url) => url.id !== urlId);
      setBlockUrls(updatedUrls);
      setTotalCount(updatedUrls.length);
      toast.success("URL deleted successfully");
    } catch (error) {
      toast.error("Failed to delete URL");
    }
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
    if (!authLoading && user && hasInitialFetch.current) {
      fetchBlockUrls();
    }
  }, [currentPage, pageSize]);

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
              <div className="bg-white h-10 relative rounded-full w-96 border border-slate-300">
                <div className="flex gap-3 h-full items-center px-4 py-1.5">
                  <div className="flex gap-2 items-center flex-1">
                    <Search className="w-5 h-5 text-slate-600 opacity-50" />
                    <input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 font-inter font-semibold text-sm text-slate-600 opacity-50 bg-transparent border-none outline-none placeholder:text-slate-600 placeholder:opacity-50"
                    />
                  </div>
                </div>
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
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all URLs"
                      />
                    </TableHead>
                    <TableHead className="w-60 py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      Website Icon
                    </TableHead>
                    <TableHead className="py-3.5 px-6 text-left bg-gray-50 font-semibold text-gray-800">
                      Website Name
                    </TableHead>
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
                      <TableRow key={url.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedUrls.has(url.id)}
                            onCheckedChange={(checked) =>
                              handleSelect(url.id, checked)
                            }
                            aria-label={`Select ${url.websiteName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative">
                              <Image
                                src={url.logoUrl}
                                alt={`${url.websiteName} logo`}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {url.websiteName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600 truncate max-w-xs">
                            {url.websiteUrl}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={url.isBlocked}
                            onCheckedChange={(checked) =>
                              handleToggleStatus(url.id, checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CustomTooltip content="Delete" position="top">
                              <button
                                onClick={() => handleDelete(url.id)}
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
      </div>
    </div>
  );
}
