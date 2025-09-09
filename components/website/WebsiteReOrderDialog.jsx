import React, { useState, useCallback, useRef } from "react";
import { Search, Undo, Redo, X, Save, GripVertical, Check } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";

// Simple checkbox component for this dialog
const SimpleCheckbox = ({ checked, onChange, className = "" }) => {
  return (
    <div
      className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
        checked
          ? "bg-indigo-500 border-indigo-500 text-white"
          : "border-slate-300 bg-white hover:border-indigo-400"
      } ${className}`}
      onClick={() => onChange(!checked)}
    >
      {checked && <Check className="w-3 h-3" />}
    </div>
  );
};

const WebsiteReOrderDialog = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWebsites, setSelectedWebsites] = useState(new Set());
  const [bulkMovePosition, setBulkMovePosition] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragCounter = useRef(0);

  // Sample website data - this would come from props or API
  const [websites, setWebsites] = useState([
    {
      id: 1,
      name: "Financial Post",
      url: "https://financialpost.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 2,
      name: "TechCrunch",
      url: "https://www.bloomberg.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 3,
      name: "The Verge",
      url: "https://www.reuters.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Wired",
      url: "https://www.wsj.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 5,
      name: "Mashable",
      url: "https://www.cnbc.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 6,
      name: "Hacker News",
      url: "https://www.forbes.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 7,
      name: "Recode",
      url: "https://www.marketwatch.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 8,
      name: "Bloomberg Technology",
      url: "https://www.theguardian.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 9,
      name: "CNET",
      url: "https://www.nytimes.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 10,
      name: "Engadget",
      url: "https://www.bbc.com/news/business",
      icon: "/placeholder.svg",
    },
    {
      id: 11,
      name: "Gizmodo",
      url: "https://www.economist.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 12,
      name: "Fast Company",
      url: "https://www.theverge.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 13,
      name: "Ars Technica",
      url: "https://www.techcrunch.com/",
      icon: "/placeholder.svg",
    },
    {
      id: 14,
      name: "ZDNet",
      url: "https://www.fastcompany.com/",
      icon: "/placeholder.svg",
    },
  ]);

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

  const handleSelectAll = useCallback(
    (isChecked) => {
      if (isChecked) {
        setSelectedWebsites(new Set(filteredWebsites.map((w) => w.id)));
      } else {
        setSelectedWebsites(new Set());
      }
    },
    [filteredWebsites]
  );

  const handleBulkMove = useCallback(() => {
    console.log("Moving selected websites to position:", bulkMovePosition);
    // Implementation for bulk move
  }, [bulkMovePosition, selectedWebsites]);

  const handleSave = useCallback(() => {
    console.log("Saving website order");
    // Implementation for saving order
    onClose();
  }, [onClose]);

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

        // Remove the dragged item
        newWebsites.splice(draggedItem, 1);

        // Insert at new position
        const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
        newWebsites.splice(insertIndex, 0, draggedWebsite);

        setWebsites(newWebsites);
      }

      setDraggedItem(null);
      setDragOverIndex(null);
    },
    [draggedItem, websites]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  }, []);

  // Calculate if all filtered websites are selected
  const allFilteredSelected =
    filteredWebsites.length > 0 &&
    filteredWebsites.every((website) => selectedWebsites.has(website.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[1570px] w-[95vw] max-h-[800px] p-0 bg-slate-100 border border-slate-200 shadow-[0px_0px_20px_0px_rgba(52,64,84,0.08)]"
        showCloseButton={false}
      >
        <div className="bg-white h-full rounded-[10px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-[#344054]">
                Reorder Websites
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-1.5 border border-slate-200 rounded-full text-sm font-semibold placeholder:text-slate-600 placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <Undo className="h-5 w-5" />
                Undo
              </button>

              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <Redo className="h-5 w-5" />
                Redo
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-semibold hover:bg-indigo-600"
              >
                <Save className="h-5 w-5" />
                Save
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto lg:max-h-[calc(100dvh-290px)] max-h-[calc(100dvh-234px)] scrollbar-custom">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-[105px] px-6 py-3.5 text-left">
                      <div className="flex items-center justify-end">
                        <SimpleCheckbox
                          checked={allFilteredSelected}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th className="w-[68px] px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800">
                        No.
                      </span>
                    </th>
                    <th className="w-[241px] px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800">
                        Web Portal Icon
                      </span>
                    </th>
                    <th className="px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800">
                        Website Name
                      </span>
                    </th>
                    <th className="px-6 py-3.5 text-left">
                      <span className="text-sm font-semibold text-slate-800">
                        Website URL
                      </span>
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {filteredWebsites.map((website, index) => (
                    <tr
                      key={website.id}
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
                          <GripVertical className="h-5 w-5 text-slate-400 cursor-grab active:cursor-grabbing" />
                          <SimpleCheckbox
                            checked={selectedWebsites.has(website.id)}
                            onChange={(checked) =>
                              handleWebsiteSelect(website.id, checked)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-[15px]">
                        <div className="border border-slate-300 rounded px-[6px] py-[6px] inline-flex items-center justify-center min-w-[22px] h-[22px]">
                          <span className="text-sm font-medium text-slate-600">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-[15px]">
                        <div className="w-[137px] h-[38px] bg-slate-100 rounded flex items-center justify-center">
                          <span className="text-xs text-slate-500">
                            FINANCIAL POST
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-[15px]">
                        <span className="text-sm font-medium text-slate-600">
                          {website.name}
                        </span>
                      </td>
                      <td className="px-6 py-[15px]">
                        <span className="text-sm font-medium text-slate-600">
                          {website.url}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-indigo-500">
                  {selectedWebsites.size}
                </span>
                <span className="text-base font-semibold text-slate-600">
                  Website Selected of 1,000 results
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
                  className="px-4 py-2.5 border border-slate-300 rounded-full text-sm font-semibold text-slate-700 w-16 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleBulkMove}
                  disabled={selectedWebsites.size === 0}
                  className="px-4 py-2.5 bg-indigo-500 text-white rounded-full text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Move
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteReOrderDialog;
