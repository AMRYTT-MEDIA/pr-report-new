import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// CSV parsing utilities
export function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Format number with K, M suffixes
export function formatNumber(num) {
  if (num === undefined || num === null || num === "") {
    return "0";
  }

  let numValue;
  if (typeof num === "string") {
    numValue = parseFloat(num.replace(/,/g, ""));
  } else {
    numValue = Number(num);
  }

  if (isNaN(numValue)) {
    return "0";
  }

  if (numValue >= 10000000) {
    return `${(numValue / 1000000).toFixed(1)}M`;
  } else if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(2)}M`;
  } else if (numValue >= 10000) {
    return `${(numValue / 1000).toFixed(0)}K`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`;
  } else {
    return numValue.toLocaleString();
  }
}

// Format date
export function formatDate(dateString) {
  if (!dateString) {
    return "Unknown date";
  }

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

// Generate unique ID
export function generateId() {
  return crypto.randomUUID();
}

// Local storage utilities for reports
export function saveReportToLocal(report) {
  try {
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    reports.push(report);
    localStorage.setItem("reports", JSON.stringify(reports));
    return true;
  } catch (error) {
    console.error("Error saving report to local storage:", error);
    return false;
  }
}

export function getReportsFromLocal() {
  try {
    return JSON.parse(localStorage.getItem("reports") || "[]");
  } catch (error) {
    console.error("Error reading reports from local storage:", error);
    return [];
  }
}

export function deleteReportFromLocal(reportId) {
  try {
    const reports = getReportsFromLocal();
    const filteredReports = reports.filter((report) => report.id !== reportId);
    localStorage.setItem("reports", JSON.stringify(filteredReports));
    return true;
  } catch (error) {
    console.error("Error deleting report from local storage:", error);
    return false;
  }
}
