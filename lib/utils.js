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
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    const filteredReports = reports.filter((report) => report.id !== reportId);
    localStorage.setItem("reports", JSON.stringify(filteredReports));
    return true;
  } catch (error) {
    console.error("Error deleting report from local storage:", error);
    return false;
  }
}

export const getLogoUrl = (filename) => {
  if (!filename) return null;
  let cleanFilename = filename;
  if (cleanFilename.includes("/")) {
    cleanFilename = cleanFilename.split("/").pop();
  }

  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  const localUrl = `${
    process.env.NEXT_PUBLIC_FRONTEND_URL
  }/websites-logos/${cleanFilename}?v=${Date.now()}`;
  return localUrl;
};

// Upload logo to server using Next.js API route
export const uploadLogo = async (
  logoFile,
  websiteName,
  websiteUrl = null,
  existingLogo = null
) => {
  try {
    // Generate filename
    const fileExtension = logoFile.name.split(".").pop().toLowerCase();

    let filename;

    // If we have an existing logo, use the same filename to replace it
    if (existingLogo) {
      // Extract just the filename from the existing logo path
      const existingFilename = existingLogo.includes("/")
        ? existingLogo.split("/").pop()
        : existingLogo;

      // Keep the same filename but update extension if different
      const existingExtension = existingFilename.split(".").pop().toLowerCase();
      const baseFilename = existingFilename.replace(
        `.${existingExtension}`,
        ""
      );
      filename = `${baseFilename}.${fileExtension}`;
    } else {
      // Generate new filename for new logos
      let sanitizedName;

      // If websiteUrl is provided and looks like a URL, use it
      if (
        websiteUrl &&
        (websiteUrl.startsWith("http://") || websiteUrl.startsWith("https://"))
      ) {
        try {
          const url = new URL(websiteUrl);
          sanitizedName = url.hostname.toLowerCase().replace(/[^a-z0-9]/g, "-");
        } catch (urlError) {
          console.warn(
            "Invalid URL provided, falling back to website name:",
            urlError
          );
          sanitizedName = websiteName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        }
      } else {
        // Fallback to using website name
        sanitizedName = websiteName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      }

      filename = `${sanitizedName}.${fileExtension}`;
    }

    const formData = new FormData();
    formData.append("logo", logoFile);
    formData.append("filename", filename);
    if (existingLogo) {
      formData.append("existingLogo", existingLogo);
    }

    // Use fetch directly for Next.js API route
    const response = await fetch("/api/websites/upload-logo", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      console.error("Upload failed with error:", errorData);
      throw new Error(
        errorData.error || `Upload failed with status ${response.status}`
      );
    }

    const result = await response.json();
    return result.filename || filename;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw new Error(`Logo upload failed: ${error.message}`);
  }
};

// Delete logo file from server
export const deleteLogo = async (logoFilename) => {
  try {
    const response = await fetch(
      `/api/websites/delete-logo?filename=${encodeURIComponent(logoFilename)}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Delete failed" }));
      console.error("Logo deletion failed with error:", errorData);
      throw new Error(
        errorData.error || `Logo deletion failed with status ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting logo:", error);
    throw new Error(`Logo deletion failed: ${error.message}`);
  }
};

export const uploadProfileLogo = async (
  logoFile,
  websiteName,
  websiteUrl = null,
  existingLogo = null
) => {
  try {
    // Generate filename
    const fileExtension = logoFile.name.split(".").pop().toLowerCase();

    let filename;

    // If we have an existing logo, use the same filename to replace it
    if (existingLogo) {
      // Extract just the filename from the existing logo path
      const existingFilename = existingLogo.includes("/")
        ? existingLogo.split("/").pop()
        : existingLogo;

      // Keep the same filename but update extension if different
      const existingExtension = existingFilename.split(".").pop().toLowerCase();
      const baseFilename = existingFilename.replace(
        `.${existingExtension}`,
        ""
      );
      filename = `${baseFilename}.${fileExtension}`;
    } else {
      // Generate new filename for new logos
      let sanitizedName;

      // If websiteUrl is provided and looks like a URL, use it
      if (
        websiteUrl &&
        (websiteUrl.startsWith("http://") || websiteUrl.startsWith("https://"))
      ) {
        try {
          const url = new URL(websiteUrl);
          sanitizedName = url.hostname.toLowerCase().replace(/[^a-z0-9]/g, "-");
        } catch (urlError) {
          console.warn(
            "Invalid URL provided, falling back to website name:",
            urlError
          );
          sanitizedName = websiteName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        }
      } else {
        // Fallback to using website name
        sanitizedName = websiteName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      }

      filename = `${sanitizedName}.${fileExtension}`;
    }

    const formData = new FormData();
    formData.append("logo", logoFile);
    formData.append("filename", filename);
    if (existingLogo) {
      formData.append("existingLogo", existingLogo);
    }

    // Use fetch directly for Next.js API route
    const response = await fetch("/api/profile/upload-logo", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      console.error("Upload failed with error:", errorData);
      throw new Error(
        errorData.error || `Upload failed with status ${response.status}`
      );
    }

    const result = await response.json();
    return result.filename || filename;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw new Error(`Logo upload failed: ${error.message}`);
  }
};

// Delete logo file from server
export const deleteProfileLogo = async (logoFilename) => {
  try {
    const response = await fetch(
      `/api/profile/delete-logo?filename=${encodeURIComponent(logoFilename)}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Delete failed" }));
      console.error("Logo deletion failed with error:", errorData);
      throw new Error(
        errorData.error || `Logo deletion failed with status ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting logo:", error);
    throw new Error(`Logo deletion failed: ${error.message}`);
  }
};
