import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import LeftArrow from "./icon/LeftArrow";
import RightArrow from "./icon/RightArrow";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const rowsPerPageOptions = [25, 50, 100];
  const totalPages = Math.ceil(totalItems / localRowsPerPage);
  const startItem = (localCurrentPage - 1) * localRowsPerPage + 1;
  const endItem = Math.min(localCurrentPage * localRowsPerPage, totalItems);

  useEffect(() => {
    setLocalCurrentPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setLocalRowsPerPage(rowsPerPage);
  }, [rowsPerPage]);

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
    const isMobile = useIsMobile();

    // If there's only one page, just return [1]
    if (totalPages <= 1) {
      return [1];
    }

    if (isMobile) {
      // Mobile logic: show only 3 pages
      if (localCurrentPage <= 2) {
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
          pages.push(i);
        }
      } else if (localCurrentPage >= totalPages - 1) {
        for (let i = Math.max(1, totalPages - 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = localCurrentPage - 1; i <= localCurrentPage + 1; i++) {
          pages.push(i);
        }
      }
    } else {
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
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`px-6 py-4 flex justify-center items-center border-t xl:flex-row gap-8 md:gap-2.5 flex-col  ${className}`}
      style={{
        color: "#475569",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      <div className="flex justify-center items-center md:flex-row flex-col gap-4 md:gap-8">
        <p>
          Showing {startItem}-{endItem} of {totalItems} results
        </p>

        <div className="flex items-center md:gap-4 gap-2">
          <div
            className={`flex items-center gap-2 cursor-pointer select-none ${
              localCurrentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() =>
              localCurrentPage > 1 && handlePageChange(localCurrentPage - 1)
            }
          >
            <LeftArrow /> Previous
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
            className={`flex items-center px-2 gap-2 cursor-pointer select-none ${
              localCurrentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() =>
              localCurrentPage < totalPages &&
              handlePageChange(localCurrentPage + 1)
            }
          >
            Next <RightArrow />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center md:flex-row flex-col gap-8 md:gap-6 hidden md:flex">
        {/* Rows Per Page */}
        <div className="flex items-center gap-2 relative">
          <p className="m-0">Rows Per Page:</p>
          <Select
            value={localRowsPerPage.toString()}
            onValueChange={handleRowsPerPageChange}
          >
            <SelectTrigger className="bg-white custom-dropdown w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bottom-10 right-0">
              {rowsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Go to Page */}
        <div className="flex items-center gap-2">
          <p className="text-nowrap m-0">Go to Page:</p>
          <Input
            placeholder="#"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-center bg-white max-w-[50px] py-2 max-h-[40px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
