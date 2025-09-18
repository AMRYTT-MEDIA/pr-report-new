"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import Loading from "@/components/ui/loading";
import { LOADING_MESSAGES } from "@/constants/index.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CommonTable = ({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onToggle,
  onView,
  onMore,
  isLoading = false,
  isLoadingBody = false, // New prop for body-only loading
  noDataText = "No data found",
  showCheckbox = false,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  className = "",
  headerClassName = "",
  rowClassName = "",
  cellClassName = "",
  actionColumnLabel = "Actions",
  showActions = true,
  customActions = [],
  emptyStateAction,
  emptyStateActionText = "Add New",
  title = "",
  subtitle = "",
  badgeCount = null,
  headerActions = null,
  pagination = null,
}) => {
  // Handle row selection
  const handleRowSelect = (row, isSelected) => {
    if (onRowSelect) {
      onRowSelect(row, isSelected);
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (onSelectAll) {
      onSelectAll(isSelected);
    }
  };

  // Check if all rows are selected
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < data.length;

  // Render loading state
  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-[10px] border border-slate-200 overflow-hidden ${className}`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-800">
                  {title}
                </h2>
                {badgeCount !== null && (
                  <Badge className="bg-indigo-50 hover:bg-indigo-50 text-indigo-500 border-indigo-500 rounded-full px-2 py-1">
                    {badgeCount}
                  </Badge>
                )}
              </div>
              {headerActions}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className="p-8">
          <div className="flex items-center justify-center">
            <Loading
              size="lg"
              color="purple"
              showText={true}
              text={LOADING_MESSAGES.FETCHING_DATA}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-[10px] border border-slate-200 overflow-hidden ${className}`}
    >
      {/* Header Section */}
      {title && (
        <div
          className={`px-6 py-4 border-b border-slate-200 ${headerClassName}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
              {badgeCount !== null && (
                <Badge className="bg-indigo-50 text-indigo-500 border-indigo-500 rounded-full px-2 py-1">
                  {badgeCount}
                </Badge>
              )}
            </div>
            {headerActions}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Table Section with Sticky Header */}
      <div className="relative overflow-hidden">
        <div className="max-h-[calc(100dvh-350px)] lg:max-h-[calc(100dvh-228px)] overflow-y-auto scrollbar-custom">
          <Table className="w-full">
            <TableHeader sticky={true}>
              <TableRow>
                {showCheckbox && (
                  <TableHead
                    sticky={true}
                    className="bg-slate-50 px-6 py-3.5 text-slate-800 font-semibold text-sm whitespace-nowrap"
                    style={{ width: "5%" }}
                  >
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    sticky={true}
                    className="bg-slate-50 px-6 py-3.5 text-slate-800 font-semibold text-sm min-h-12 whitespace-nowrap"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {showActions &&
                  (onEdit ||
                    onDelete ||
                    onToggle ||
                    onView ||
                    onMore ||
                    customActions.length > 0) && (
                    <TableHead
                      sticky={true}
                      className="bg-slate-50 px-6 py-3 text-slate-800 font-semibold text-sm min-h-12 whitespace-nowrap"
                      style={{ width: "10%" }}
                    >
                      {actionColumnLabel}
                    </TableHead>
                  )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingBody ? (
                // Loading component in table body
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (showCheckbox ? 1 : 0) +
                      (showActions ? 1 : 0)
                    }
                    className="px-6 py-8 text-center bg-white"
                  >
                    <div className="flex items-center justify-center min-h-[calc(100dvh-340px)]">
                      <Loading
                        size="lg"
                        color="purple"
                        showText={false}
                        text="Loading..."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (showCheckbox ? 1 : 0) +
                      (showActions ? 1 : 0)
                    }
                    className="px-6 py-8 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-slate-500 text-sm">{noDataText}</p>
                      {emptyStateAction && (
                        <Button
                          onClick={emptyStateAction}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          {emptyStateActionText}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={row._id || row.id || index}
                    className={`border-b border-slate-200 hover:bg-slate-50 ${rowClassName}`}
                  >
                    {showCheckbox && (
                      <TableCell
                        className="px-6 py-3 min-h-[72px] whitespace-nowrap"
                        style={{ width: "5%" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.some(
                            (selected) =>
                              selected._id === row._id || selected.id === row.id
                          )}
                          onChange={(e) =>
                            handleRowSelect(row, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`px-6 py-3 min-h-[72px] whitespace-nowrap ${cellClassName}`}
                        style={{ width: column.width }}
                      >
                        {column.render ? (
                          column.render(row[column.key], row, index)
                        ) : (
                          <div className="font-medium text-gray-scale-60 text-sm whitespace-nowrap">
                            {row[column.key]}
                          </div>
                        )}
                      </TableCell>
                    ))}
                    {showActions &&
                      (onEdit ||
                        onDelete ||
                        onToggle ||
                        onView ||
                        onMore ||
                        customActions.length > 0) && (
                        <TableCell
                          className="px-6 py-3 min-h-[72px] whitespace-nowrap"
                          style={{ width: "9%" }}
                        >
                          <div className="flex items-center gap-2">
                            {onView && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onView(row)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 rounded-full px-4 py-2.5 h-10"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(row)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 rounded-full px-4 py-2.5 h-10"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            )}
                            {onToggle && (
                              <button
                                onClick={() => onToggle(row, !row.isActive)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  row.isActive
                                    ? "bg-indigo-500"
                                    : "bg-slate-600"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                                    row.isActive
                                      ? "translate-x-1"
                                      : "translate-x-4"
                                  }`}
                                />
                              </button>
                            )}
                            {onDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(row)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-0 rounded-full px-4 py-2.5 h-10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            )}
                            {customActions.map((action, actionIndex) => {
                              const buttonElement = (
                                <Button
                                  key={actionIndex}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => action.onClick(row)}
                                  className={
                                    action.className ||
                                    "bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 rounded-full px-4 py-2.5 h-10"
                                  }
                                >
                                  {action.icon && (
                                    <action.icon className="w-4 h-4 mr-2" />
                                  )}
                                  {action.label}
                                </Button>
                              );

                              // If tooltip is enabled, wrap with tooltip
                              if (action.showTooltip && action.tooltipText) {
                                return (
                                  <TooltipProvider key={actionIndex}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        {buttonElement}
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{action.tooltipText}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              }

                              return buttonElement;
                            })}
                            {onMore && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onMore(row)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 rounded-full px-4 py-2.5 h-10"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Section */}
      {pagination && pagination}
    </div>
  );
};

export default CommonTable;
