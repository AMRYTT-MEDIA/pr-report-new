import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Undo,
  Redo,
  X,
  Save,
  GripVertical,
  Check,
  ImageOff,
  TriangleAlert,
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { websitesService } from "@/services/websites";
import { toast } from "sonner";
import Image from "next/image";
import WebsiteConstants from "./constans";
import { NoDataFound } from "../icon";

// Simple checkbox component for this dialog
const SimpleCheckbox = ({ checked, onChange, className = "" }) => {
  return (
    <div
      className={`w-5 h-5 rounded-[6px] border-2 cursor-pointer flex items-center justify-center transition-colors ${
        checked
          ? "bg-indigo-500 border-indigo-500 text-white"
          : "border-slate-300 bg-white hover:border-indigo-400"
      } ${className}`}
      onClick={() => onChange(!checked)}
    >
      {checked && <Check className="w-3 h-3" strokeWidth={4} />}
    </div>
  );
};

const WebsiteReOrderDialog = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWebsites, setSelectedWebsites] = useState(new Set());
  const [bulkMovePosition, setBulkMovePosition] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const dragCounter = useRef(0);

  // Undo/Redo state management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Warning dialog state
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningType, setWarningType] = useState("cancel"); // 'cancel' or 'save'

  // Save current state to history
  const saveToHistory = useCallback(
    (newWebsites) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...newWebsites]);

      // Limit history to 50 entries to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex((prev) => prev + 1);
      }

      setHistory(newHistory);
      setCanUndo(true);
      setCanRedo(false);
    },
    [history, historyIndex]
  );

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setWebsites([...history[newIndex]]);
      setHistoryIndex(newIndex);
      setCanUndo(newIndex > 0);
      setCanRedo(true);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setWebsites([...history[newIndex]]);
      setHistoryIndex(newIndex);
      setCanUndo(true);
      setCanRedo(newIndex < history.length - 1);
    }
  }, [history, historyIndex]);

  // Store original websites data for reset functionality
  const [originalWebsites, setOriginalWebsites] = useState([]);

  // Reset history when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHistory([]);
      setHistoryIndex(-1);
      setCanUndo(false);
      setCanRedo(false);
    } else {
      // Reset all states when dialog closes
      setWebsites(originalWebsites);
      setSelectedWebsites(new Set());
      setBulkMovePosition("");
      setSearchTerm("");
      setDraggedItem(null);
      setDragOverIndex(null);
      setHistory([]);
      setHistoryIndex(-1);
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [isOpen, originalWebsites]);

  // Fetch websites data when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadWebsites = async () => {
        setLoading(true);
        try {
          const response = await websitesService.getAllWebsites();
          const websitesData = response.data || response;
          setWebsites(websitesData);
          setOriginalWebsites([...websitesData]); // Store original data for reset
        } catch (error) {
          console.error("Error loading websites:", error);
          toast.error("Failed to load websites. Please try again.");
          setWebsites([]);
          setOriginalWebsites([]);
        } finally {
          setLoading(false);
        }
      };

      loadWebsites();
    }
  }, [isOpen]);

  // Save initial state to history when websites are loaded
  useEffect(() => {
    if (websites.length > 0 && history.length === 0) {
      const newHistory = [...websites];
      setHistory([newHistory]);
      setHistoryIndex(0);
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [websites, history.length]);

  const handleWebsiteSelect = useCallback((websiteId, isChecked) => {
    setSelectedWebsites((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(websiteId);
      } else {
        newSet.delete(websiteId);
      }
      return newSet;
    });
  }, []);

  const filteredWebsites = websites.filter(
    (website) =>
      website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBulkMove = useCallback(() => {
    if (selectedWebsites.size === 0 || !bulkMovePosition) return;
    const position = parseInt(bulkMovePosition) - 1; // Convert to 0-based index
    if (position < 0 || position >= websites.length) {
      toast.error("Invalid position. Please enter a valid position number.");
      return;
    }
    const newWebsites = [...websites];
    const selectedWebsiteIds = Array.from(selectedWebsites);
    // Get selected websites
    const selectedWebsitesData = selectedWebsiteIds
      .map((id) => newWebsites.find((website) => website._id === id))
      .filter(Boolean);
    // Remove selected websites from their current positions
    const filteredWebsites = newWebsites.filter(
      (website) => !selectedWebsites.has(website._id)
    );
    // Insert selected websites at the specified position
    filteredWebsites.splice(position, 0, ...selectedWebsitesData);
    setWebsites(filteredWebsites);
    // Save state to history for undo/redo
    saveToHistory(filteredWebsites);
    // Clear selection and bulk move position
    setSelectedWebsites(new Set());
    setBulkMovePosition("");
    toast.success(
      `Moved ${selectedWebsitesData.length} website(s) to position ${bulkMovePosition}`
    );
  }, [bulkMovePosition, selectedWebsites, websites, saveToHistory]);

  // Check if there are any changes made
  const hasChanges = useCallback(() => {
    if (websites.length !== originalWebsites.length) return true;

    return websites.some((website, index) => {
      const originalWebsite = originalWebsites[index];
      return !originalWebsite || website._id !== originalWebsite._id;
    });
  }, [websites, originalWebsites]);

  // Handle cancel button click
  const handleCancelClick = useCallback(() => {
    if (hasChanges()) {
      setWarningType("cancel");
      setShowWarningDialog(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  // Handle save and close
  const handleSaveAndClose = useCallback(async () => {
    try {
      // Prepare reorder data in the format you specified
      const reorderData = websites.map((website, index) => ({
        _id: website._id,
        srno: index + 1,
      }));

      await websitesService.reorderWebsites(reorderData);

      toast.success("Website order saved successfully!");
      setShowWarningDialog(false);
      onClose();
    } catch (error) {
      console.error("Error saving website order:", error);
      toast.error("Failed to save website order. Please try again.");
    }
  }, [websites, onClose]);

  // Handle discard and close
  const handleDiscardAndClose = useCallback(() => {
    setShowWarningDialog(false);
    onClose();
  }, [onClose]);

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    if (hasChanges()) {
      setWarningType("save");
      setShowWarningDialog(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  const handleSave = useCallback(async () => {
    try {
      // Prepare reorder data in the format you specified
      const reorderData = websites.map((website, index) => ({
        _id: website._id,
        srno: index + 1,
      }));

      await websitesService.reorderWebsites(reorderData);

      toast.success("Website order saved successfully!");
      setShowWarningDialog(false);
      onClose();
    } catch (error) {
      console.error("Error saving website order:", error);
      toast.error("Failed to save website order. Please try again.");
    }
  }, [websites, onClose]);

  // Handle position input change
  const handlePositionChange = useCallback(
    (e, currentIndex) => {
      const value = e.target.value;
      // Allow empty value for editing
      if (value === "") return;

      const newPosition = parseInt(value);
      if (newPosition < 1 || newPosition > websites.length) {
        return; // Invalid position, don't update
      }
    },
    [websites.length]
  );

  // Handle position input blur (when user clicks away)
  const handlePositionBlur = useCallback(
    (e, currentIndex) => {
      const value = e.target.value;
      if (value === "") {
        // Reset to current position if empty
        e.target.value = currentIndex + 1;
        return;
      }

      const newPosition = parseInt(value);
      if (newPosition < 1 || newPosition > websites.length) {
        // Reset to current position if invalid
        e.target.value = currentIndex + 1;
        toast.error(
          `Invalid position. Please enter a number between 1 and ${websites.length}`
        );
        return;
      }

      // Move website to new position
      if (newPosition !== currentIndex + 1) {
        const newWebsites = [...websites];
        const websiteToMove = newWebsites[currentIndex];

        // Remove website from current position
        newWebsites.splice(currentIndex, 1);

        // Insert at new position (convert to 0-based index)
        newWebsites.splice(newPosition - 1, 0, websiteToMove);

        setWebsites(newWebsites);
        saveToHistory(newWebsites);

        toast.success(
          `Moved "${websiteToMove.name}" to position ${newPosition}`
        );
      } else {
        // If position is same, just reset the input value
        e.target.value = currentIndex + 1;
      }
    },
    [websites, saveToHistory]
  );

  // Handle Enter key press
  const handlePositionKeyDown = useCallback((e, currentIndex) => {
    if (e.key === "Enter") {
      e.target.blur(); // Trigger blur event to move the website
    }
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  }, []);

  const handleDragOver = useCallback(
    (e, index) => {
      e.preventDefault();
      if (draggedItem !== null && draggedItem !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedItem]
  );

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    dragCounter.current++;
  }, []);

  const handleDragLeave = useCallback((e) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e, dropIndex) => {
      e.preventDefault();
      dragCounter.current = 0;
      if (draggedItem !== null && draggedItem !== dropIndex) {
        const newWebsites = [...websites];
        const draggedWebsite = newWebsites[draggedItem];
        // Check if dragging to immediate upper neighbor (swap case)
        if (draggedItem === dropIndex + 1) {
          // Swap positions: dragged item goes up, target goes down
          newWebsites[draggedItem] = newWebsites[dropIndex];
          newWebsites[dropIndex] = draggedWebsite;
        } else {
          // Remove the dragged item
          newWebsites.splice(draggedItem, 1);
          // Insert at new position - place below the target website
          const insertIndex =
            draggedItem < dropIndex ? dropIndex : dropIndex + 1;
          newWebsites.splice(insertIndex, 0, draggedWebsite);
        }
        setWebsites(newWebsites);
        // Save state to history for undo/redo
        saveToHistory(newWebsites);
      }
      setDraggedItem(null);
      setDragOverIndex(null);
    },
    [draggedItem, websites, saveToHistory]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  }, []);

  // Truncate title
  const formatTitle = (title, type) => {
    let maxLength = 100;
    if (type === "name") {
      maxLength = 20;
    } else if (type === "url") {
      maxLength = 100;
    }
    if (!title) return "-";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // Check if title needs truncation
  const needsTruncation = (title, type) => {
    let maxLength = 100;
    if (type === "name") {
      maxLength = 20;
    } else if (type === "url") {
      maxLength = 100;
    }
    return title && title.length > maxLength;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[1570px] w-[95vw] max-h-[880px] bg-slate-100 border border-slate-200 shadow-[0px_0px_20px_0px_rgba(52,64,84,0.08)] p-[5px]"
        showCloseButton={false}
      >
        <div className="bg-white h-full rounded-[10px] flex flex-col overflow-hidden border border-gray-scale-30">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-2 sm:px-6 px-4 py-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-[#344054] whitespace-nowrap mr-2">
                Reorder Websites
              </h2>
            </div>

            {/* Search */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-full text-sm font-semibold placeholder:text-slate-600 placeholder:opacity-50 focus:outline-none focus:border-gray-scale-80"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Action Buttons */}
              <button
                className={`flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-full text-sm font-semibold hover:bg-slate-50 ${
                  canUndo
                    ? "text-slate-600"
                    : "text-slate-400 cursor-not-allowed"
                }`}
                onClick={handleUndo}
                disabled={!canUndo}
              >
                <Undo className="h-5 w-5" />
                <span className="hidden lg:inline">Undo</span>
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-full text-sm font-semibold hover:bg-slate-50 ${
                  canRedo
                    ? "text-slate-600"
                    : "text-slate-400 cursor-not-allowed"
                }`}
                onClick={handleRedo}
                disabled={!canRedo}
              >
                <Redo className="h-5 w-5" />
                <span className="hidden lg:inline">Redo</span>
              </button>

              <button
                onClick={handleCancelClick}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
                <span className="hidden lg:inline">Cancel</span>
              </button>

              <button
                onClick={handleSaveClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-semibold hover:bg-indigo-600"
              >
                <Save className="h-5 w-5" />
                <span className="hidden lg:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden">
            <div className="overflow-auto lg:h-[calc(100dvh-290px)] 4xl:h-[calc(100dvh-480px)] h-[calc(100dvh-334px)] scrollbar-custom">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="w-[105px] px-6 py-3.5 text-left"></th>
                    <th className="w-[68px] px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                        No.
                      </span>
                    </th>
                    <th className="w-[241px] px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                        Web Portal Icon
                      </span>
                    </th>
                    <th className="px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                        Website Name
                      </span>
                    </th>
                    <th className="px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                        Website URL
                      </span>
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center h-[calc(100dvh-350px)]"
                      >
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                          <span className="ml-2 text-sm text-slate-600">
                            Loading websites...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredWebsites.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center h-[calc(100dvh-350px)]"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3 h-full">
                          <NoDataFound width={105} height={130} />
                          <div>
                            <h3 className="text-lg font-medium text-slate-900">
                              {searchTerm
                                ? WebsiteConstants.noWebsiteFound
                                : WebsiteConstants.noWebsiteYetTitle}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              {searchTerm
                                ? WebsiteConstants.noDataFoundDescription
                                : WebsiteConstants.addFirstWebsiteDescription}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWebsites.map((website, index) => (
                      <tr
                        key={website._id}
                        className={`border-b border-slate-200 transition-colors ${
                          draggedItem === index ? "opacity-50" : ""
                        } ${
                          dragOverIndex === index
                            ? "bg-indigo-50 border-indigo-200"
                            : ""
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <td className="px-6 py-[15px]">
                          <div className="flex items-center gap-[15px]">
                            <GripVertical className="h-5 w-5 text-gray-scale-60 cursor-grab active:cursor-grabbing" />
                            <SimpleCheckbox
                              checked={selectedWebsites.has(website._id)}
                              onChange={(checked) =>
                                handleWebsiteSelect(website._id, checked)
                              }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-[6px]">
                          <input
                            key={`position-${website._id}-${index}`}
                            type="number"
                            defaultValue={index + 1}
                            onChange={(e) => handlePositionChange(e, index)}
                            onBlur={(e) => handlePositionBlur(e, index)}
                            onKeyDown={(e) => handlePositionKeyDown(e, index)}
                            className="border border-slate-300 rounded px-[6px] py-[6px] inline-flex items-center justify-center w-[38px] h-[22px] text-sm font-medium text-slate-600 text-center focus:outline-none focus:border-gray-scale-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                            max={websites.length}
                          />
                        </td>
                        <td className="px-6 py-[6px]">
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
                              <ImageOff className="w-6 h-6 text-gray-scale-60" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-[6px]">
                          {needsTruncation(website.name, "name") ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-sm font-medium text-gray-scale-60 truncate cursor-help max-w-[150px]">
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
                            <p className="text-sm font-medium text-gray-scale-60 truncate">
                              {website.name || "-"}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-[6px]">
                          <div className="flex-1 min-w-0">
                            {needsTruncation(website.url, "url") ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm font-medium text-gray-scale-60 truncate cursor-help">
                                      {formatTitle(website.url, "url")}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    className="max-w-sm bg-gray-900 text-white border-gray-700"
                                    side="top"
                                    align="start"
                                  >
                                    <div className="break-words">
                                      {website.url}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <p className="text-sm font-medium text-gray-scale-60">
                                {website.url || "-"}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4 bg-white">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-indigo-500">
                  {selectedWebsites.size}
                </span>
                <span className="text-base font-semibold text-slate-600">
                  Website Selected of {websites.length} results
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-slate-600">
                  Bulk Move To:
                </span>
                <input
                  type="text"
                  placeholder="#"
                  value={bulkMovePosition}
                  onChange={(e) => setBulkMovePosition(e.target.value)}
                  className="px-4 py-2.5 border border-slate-300 rounded-full text-sm font-semibold text-slate-700 w-16 text-center focus:outline-none focus:border-gray-scale-80 leading-4"
                />
                <button
                  onClick={handleBulkMove}
                  disabled={selectedWebsites.size === 0}
                  className="px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed leading-4"
                >
                  Move
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-1xl bg-white boder border-gray-200 shadow-2xl z-[10000] h-auto overflow-hidden p-0 bg-gray-scale-10 border-gray-scale-10 gap-0 max-w-[90vw] sm:max-w-[550px]"
          showCloseButton={false}
        >
          <div className="flex flex-col gap-5 border border-gray-200 rounded-xl p-5 bg-white overflow-y-auto max-h-[84vh] scrollbar-custom">
            {/* Header */}
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                  <TriangleAlert className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowWarningDialog(false)}
                  className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-font-h2">
                  {warningType === "cancel"
                    ? "Unsaved Changes"
                    : "Save Changes"}
                </h2>
                <p className="text-font-h2-5 text-sm font-medium">
                  {warningType === "cancel"
                    ? "Website order changed. Save or discard changes?"
                    : "Website order has been modified. Do you want to save these changes?"}
                </p>
              </div>
            </div>
          </div>
          {/* Footer Buttons */}
          <div className="flex gap-2.5 items-center justify-center sm:justify-end p-5">
            <Button
              type="button"
              variant="outline"
              onClick={
                warningType === "cancel"
                  ? handleDiscardAndClose
                  : () => setShowWarningDialog(false)
              }
              className="px-6 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium"
            >
              <X className="w-5 h-5" />
              {warningType === "cancel" ? "Discard" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={
                warningType === "cancel" ? handleSaveAndClose : handleSave
              }
              className="px-6 py-2 bg-primary-50 hover:bg-primary-60 text-white rounded-full font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default WebsiteReOrderDialog;
