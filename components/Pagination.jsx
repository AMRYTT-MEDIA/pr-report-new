import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import LeftArrow from "./icon/LeftArrow";
import RightArrow from "./icon/RightArrow";
// import { useIsMobile } from "@/hooks/use-mobile";

const Pagination = ({
  totalItems = 0,
  currentPage = 1,
  rowsPerPage = 25,
  onPageChange,
  onRowsPerPageChange,
  className = "",
}) => {
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(rowsPerPage);
  const [goToPage, setGoToPage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const rowsPerPageOptions = [25, 50, 100];
  const totalPages = Math.ceil(totalItems / localRowsPerPage);
  // const totalPages = 100; // for testing
  const startItem = (localCurrentPage - 1) * localRowsPerPage + 1;
  const endItem = Math.min(localCurrentPage * localRowsPerPage, totalItems);

  useEffect(() => {
    setLocalCurrentPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setLocalRowsPerPage(rowsPerPage);
  }, [rowsPerPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setLocalCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    const newRowsPerPageNum = parseInt(newRowsPerPage);
    setLocalRowsPerPage(newRowsPerPageNum);
    setLocalCurrentPage(1);
    setIsDropdownOpen(false);
    onRowsPerPageChange?.(newRowsPerPageNum);
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setGoToPage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleGoToPage();
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    // const isMobile = useIsMobile();

    // If there's only one page, just return [1]
    if (totalPages <= 1) {
      return [1];
    }

    // if (isMobile) {
    //   // Mobile logic: show only 3 pages
    //   if (localCurrentPage <= 2) {
    //     for (let i = 1; i <= Math.min(3, totalPages); i++) {
    //       pages.push(i);
    //     }
    //   } else if (localCurrentPage >= totalPages - 1) {
    //     for (let i = Math.max(1, totalPages - 2); i <= totalPages; i++) {
    //       pages.push(i);
    //     }
    //   } else {
    //     for (let i = localCurrentPage - 1; i <= localCurrentPage + 1; i++) {
    //       pages.push(i);
    //     }
    //   }
    // } else {
    // Desktop logic: show 5 pages
    if (totalPages <= 5) {
      // If total pages is 5 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (localCurrentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (localCurrentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = localCurrentPage - 1; i <= localCurrentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    }
    // }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`px-4 md:px-6 py-4 flex justify-center items-center border-t xl:flex-row gap-2.5 sm:gap-8 flex-col  ${className}`}
      style={{
        color: "#475569",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      <div className="flex justify-center items-center sm:flex-row flex-col gap-2.5 md:gap-8">
        <div className="flex items-center gap-4 order-1 sm:order-2">
          <div
            className={`flex items-center gap-2 cursor-pointer select-none ${
              localCurrentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() =>
              localCurrentPage > 1 && handlePageChange(localCurrentPage - 1)
            }
          >
            <LeftArrow /> <span className="hidden sm:block">Previous</span>
          </div>

          <div className="flex items-center md:gap-2 gap-1">
            {getVisiblePages().map((page, index) => (
              <div
                key={index}
                className={`flex items-center px-3 cursor-pointer ${
                  page === localCurrentPage
                    ? "text-primary font-medium text-sm border border-primary rounded-full py-1"
                    : page !== "..."
                    ? "hover:text-primary hover:outline hover:outline-primary hover:outline-1 rounded-full py-1"
                    : ""
                }`}
                onClick={() => page !== "..." && handlePageChange(page)}
              >
                <p>{page}</p>
              </div>
            ))}
          </div>

          <div
            className={`flex items-center gap-2 cursor-pointer select-none ${
              localCurrentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              localCurrentPage < totalPages &&
              handlePageChange(localCurrentPage + 1)
            }
          >
            <span className="hidden sm:block">Next</span> <RightArrow />
          </div>
        </div>

        <p className="flex-1 order-2 sm:order-1">
          Showing {startItem}-{endItem} of {totalItems} results
        </p>
      </div>

      <div className="flex justify-center items-center flex-row gap-2 md:gap-6">
        {/* Rows Per Page */}
        <div className="flex items-center gap-2 relative">
          <p className="m-0">Rows Per Page:</p>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2 w-16 text-sm font-medium text-gray-700 focus:border-gray-400 hover:border-gray-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>{localRowsPerPage}</span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-20 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {rowsPerPageOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleRowsPerPageChange(option)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      option === localRowsPerPage
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Go to Page */}
        <div className="flex items-center gap-2">
          <p className="text-nowrap m-0">Go to Page:</p>
          <Input
            placeholder="#"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-center bg-white max-w-[50px] max-h-[40px] border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:border-gray-400 hover:border-gray-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
