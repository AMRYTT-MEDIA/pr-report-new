"use client";

import React, { useState, useEffect } from "react";
import { useBreadcrumbDirect } from "@/contexts/BreadcrumbContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListRestart, Plus, Search, Trash2, X, PencilLine } from "lucide-react";
import Pagination from "@/components/Pagination";
import Loading from "@/components/ui/loading";
import { AddNewWebsiteDialog, WebsiteDeleteDialog } from "@/components/website";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import WebsiteConstants from "@/components/website/constans";
import { websitesService } from "@/services/websites";
import Image from "next/image";
import { NoDataFound } from "@/components/icon";

const WebsitePage = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [addEditWebsiteDialog, setAddEditWebsiteDialog] = useState(false);
  const [editWebsite, setEditWebsite] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Direct render - no useEffect needed
  useBreadcrumbDirect([{ name: "Website", href: "/website", current: true }]);

  // Load websites data
  useEffect(() => {
    const loadWebsites = async () => {
      setLoading(true);
      try {
        const response = await websitesService.getWebsites();
        setWebsites(response.data || response);
        setTotalCount(response.data?.length || response.length || 0);
      } catch (error) {
        console.error("Error loading websites:", error);
        toast.error("Failed to load websites. Please try again.");
        // Fallback to empty array
        setWebsites([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadWebsites();
  }, []);

  // Filter websites based on search query
  const filteredWebsites = websites.filter(
    (website) =>
      website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search
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
    setWebsites((prev) => [newWebsite, ...prev]);
    setTotalCount((prev) => prev + 1);
    setEditWebsite(null);
  };

  // Handle edit website
  const handleEdit = (website) => {
    setEditWebsite(website);
    setAddEditWebsiteDialog(true);
  };

  // Handle update website after edit
  const handleUpdateWebsite = (updatedWebsite) => {
    setWebsites((prev) =>
      prev.map((website) =>
        (website._id || website.id) ===
        (updatedWebsite._id || updatedWebsite.id)
          ? updatedWebsite
          : website
      )
    );
    setEditWebsite(null);
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
        websiteToDelete._id || websiteToDelete.id
      );

      // Remove website from list
      setWebsites((prev) =>
        prev.filter(
          (w) => (w._id || w.id) !== (websiteToDelete._id || websiteToDelete.id)
        )
      );
      setTotalCount((prev) => prev - 1);

      toast.success("Website deleted successfully!");
    } catch (error) {
      console.error("Error deleting website:", error);
      toast.error("Failed to delete website. Please try again.");
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

  // Handle view website
  const handleView = (website) => {
    console.log("View website:", website);
    // Implement view functionality
  };

  // Handle share website
  const handleShare = (website) => {
    console.log("Share website:", website);
    // Implement share functionality
  };

  if (loading) {
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

  return (
    <div className="bg-gray-50">
      <div className="mx-auto">
        <div className="bg-white shadow-sm border rounded-lg border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                All Websites
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 w-full relative max-w-[400px]">
                <Search className="w-4 h-4 absolute left-3 text-slate-600" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 rounded-[41px] border-slate-200 text-slate-600 placeholder:text-slate-600 font-semibold"
                />
                {searchQuery && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                    <X
                      className="h-6 w-6 text-muted-foreground bg-gray-100 rounded-xl p-1"
                      onClick={() => setSearchQuery("")}
                    />
                  </div>
                )}
              </div>
              <Button className="text-slate-600 border border-slate-200 rounded-[39px] px-4 py-2.5 font-semibold bg-transparent hover:bg-slate-50">
                <ListRestart className="w-4 h-4 text-slate-600 mr-2" />
                <span className="hidden sm:inline">Re Order</span>
              </Button>
              <Button
                onClick={() => {
                  setEditWebsite(null);
                  setAddEditWebsiteDialog(true);
                }}
                className="text-white px-4 py-2.5 flex items-center gap-2 bg-indigo-500 rounded-[39px]"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Add New</span>
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100dvh-300px)] lg:max-h-[calc(100dvh-234px)] overflow-y-auto scrollbar-custom">
              <table className="w-full divide-y divide-slate-200 table-auto">
                <thead className="bg-slate-50 w-full">
                  <tr className="w-full">
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 w-[68px]">
                      No.
                    </th>
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 w-[241px] whitespace-nowrap">
                      Website Icon
                    </th>
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 flex-1 whitespace-nowrap">
                      Website Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 flex-1 whitespace-nowrap">
                      Website URL
                    </th>
                    <th className="px-6 py-3.5 text-left text-sm font-semibold text-slate-800 w-[260px] whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredWebsites?.length === 0 ? (
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
                                ? "No websites found"
                                : "No websites yet"}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              {searchQuery
                                ? `No websites match "${searchQuery}". Try a different search term.`
                                : "Get started by adding your new website."}
                            </p>
                          </div>
                          {!searchQuery && (
                            <Button
                              onClick={() => {
                                setEditWebsite(null);
                                setAddEditWebsiteDialog(true);
                              }}
                              className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-6"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Website
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWebsites?.map((website, index) => (
                      <tr
                        key={website._id || website.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-3">
                          <p className="text-sm font-medium text-slate-600">
                            {index + 1}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <div className="w-[120px] sm:w-[137px] h-[38px] flex items-center justify-center">
                            {website.logo ? (
                              <Image
                                src={websitesService.getLogoUrl(website.logo)}
                                alt={website.name}
                                width={138}
                                height={38}
                                className="max-w-[120px] sm:max-w-[137px] max-h-[38px] object-contain w-full h-full"
                              />
                            ) : (
                              <Image
                                src="/placeholder.svg"
                                alt="Placeholder"
                                width={138}
                                height={38}
                                className="max-w-[120px] sm:max-w-[137px] max-h-[38px] object-contain w-full h-full"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-sm font-medium text-slate-600">
                            {website.name}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-sm font-medium text-slate-600">
                            {website.url}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleEdit(website)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-[80px] flex items-center gap-2.5 text-sm font-medium"
                            >
                              <PencilLine className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(website)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-[80px] flex items-center gap-2.5 text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
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
        onClose={() => {
          setAddEditWebsiteDialog(false);
          setEditWebsite(null);
        }}
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
    </div>
  );
};

export default WebsitePage;
