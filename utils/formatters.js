/**
 * Formatting Utilities
 * Common formatting functions for dates, numbers, strings, etc.
 */

import { DATE_FORMATS } from "@/constants/index.js";

/**
 * Format date with various options
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (from DATE_FORMATS)
 * @returns {string} - Formatted date
 */
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const options = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  switch (format) {
    case DATE_FORMATS.DISPLAY:
      return dateObj.toLocaleDateString("en-US", options);

    case DATE_FORMATS.DISPLAY_WITH_TIME:
      return dateObj.toLocaleDateString("en-US", {
        ...options,
        hour: "2-digit",
        minute: "2-digit",
      });

    case DATE_FORMATS.INPUT:
      return dateObj.toISOString().split("T")[0];

    case DATE_FORMATS.API:
      return dateObj.toISOString();

    case DATE_FORMATS.RELATIVE:
      return formatRelativeTime(dateObj);

    default:
      return dateObj.toLocaleDateString("en-US", options);
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) return "0";

  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return "0%";

  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: "...")
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength, suffix = "...") => {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return "";

  return text.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Convert camelCase to Title Case
 * @param {string} text - Text to convert
 * @returns {string} - Title case text
 */
export const camelToTitle = (text) => {
  if (!text) return "";

  return text
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX for 10-digit US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Format as +X (XXX) XXX-XXXX for 11-digit numbers starting with 1
  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  // Return original if not a standard format
  return phone;
};

/**
 * Format URL for display (remove protocol, www)
 * @param {string} url - URL to format
 * @returns {string} - Formatted URL
 */
export const formatUrlForDisplay = (url) => {
  if (!url) return "";

  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;

    // Remove www prefix
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }

    return hostname;
  } catch {
    // If URL is invalid, try to clean it manually
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
  }
};

/**
 * Format status badge text
 * @param {string} status - Status to format
 * @returns {string} - Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return "";

  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials
 * @returns {string} - Initials
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name) return "";

  const names = name.trim().split(/\s+/);
  const initials = names
    .slice(0, maxInitials)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  return initials;
};

/**
 * Format search query for display
 * @param {string} query - Search query
 * @param {number} maxLength - Maximum length to display
 * @returns {string} - Formatted search query
 */
export const formatSearchQuery = (query, maxLength = 50) => {
  if (!query) return "";

  const formatted = query.trim();
  return truncateText(formatted, maxLength);
};

/**
 * Format error message for display
 * @param {string} error - Error message
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return "";

  // Remove technical prefixes
  const cleaned = error
    .replace(/^Error:\s*/i, "")
    .replace(/^Firebase:\s*/i, "")
    .replace(/^API Error:\s*/i, "");

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/**
 * Format duration in milliseconds to human readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
export const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0ms";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else if (seconds > 0) {
    return `${seconds}s`;
  } else {
    return `${ms}ms`;
  }
};
