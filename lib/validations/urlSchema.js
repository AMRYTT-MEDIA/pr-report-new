import * as Yup from "yup";
import validator from "validator";

/**
 * Shared URL validation schemas using Yup and validator.js
 * Provides consistent validation for URL fields across the application
 */

/**
 * Single URL validation schema
 * Validates a single URL with strict requirements
 */
export const singleUrlSchema = Yup.string()
  .trim()
  .required("URL is required")
  .test("is-valid-url", "Please enter a valid URL", function (value) {
    if (!value) return false;

    const urlValue = value.trim();

    // Check if it's a valid URL using validator.js with strict settings
    if (
      !validator.isURL(urlValue, {
        protocols: ["http", "https"],
        require_protocol: false, // Allow URLs without protocol (will be auto-added)
        require_host: true,
        require_valid_protocol: true,
        allow_underscores: false,
        host_whitelist: false,
        host_blacklist: false,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: false,
        disallow_auth: true,
        allow_fragments: true,
        allow_query_components: true,
      })
    ) {
      return false;
    }

    // Check if URL contains invalid characters
    if (!validator.isAscii(urlValue)) {
      return false;
    }

    // Normalize URL by adding protocol if missing
    const normalizedUrl = urlValue.startsWith("http")
      ? urlValue
      : `https://${urlValue}`;

    // Extract domain part for FQDN validation
    const cleanUrl = normalizedUrl.replace(/^https?:\/\//, "");
    const domainPart = cleanUrl.split("/")[0]; // Get only domain part, ignore path

    // Validate domain using FQDN (Fully Qualified Domain Name)
    if (
      !validator.isFQDN(domainPart, {
        require_tld: true,
        allow_underscores: false,
        allow_trailing_dot: false,
        allow_numeric_tld: false,
      })
    ) {
      return false;
    }

    // Additional check for proper domain extension
    const parts = domainPart.split(".");
    if (parts.length < 2) return false;

    const extension = parts[parts.length - 1];
    return validator.isAlpha(extension) && extension.length >= 2;
  });

/**
 * Multiple URLs validation schema
 * Validates multiple URLs separated by commas or newlines
 */
export const multipleUrlsSchema = Yup.string()
  .trim()
  .required("At least one URL is required")
  .test("valid-urls", "Please enter valid URLs", function (value) {
    if (!value) return false;

    const urls = value
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      return this.createError({
        message: "At least one URL is required",
      });
    }

    // Check for duplicate URLs (case-insensitive)
    const normalizedUrls = urls.map((url) => {
      const normalized = url.startsWith("http") ? url : `https://${url}`;
      return normalized.toLowerCase();
    });

    const uniqueUrls = [...new Set(normalizedUrls)];
    if (normalizedUrls.length !== uniqueUrls.length) {
      // Find and report duplicate URLs
      const duplicates = [];
      const seen = new Set();

      for (let i = 0; i < urls.length; i++) {
        const normalized = normalizedUrls[i];
        if (seen.has(normalized)) {
          duplicates.push(urls[i]);
        } else {
          seen.add(normalized);
        }
      }

      return this.createError({
        message: `Duplicate URLs found: ${duplicates.join(", ")}`,
      });
    }

    const invalidUrls = [];

    for (const url of urls) {
      // Check if it's a valid URL using validator.js
      if (
        !validator.isURL(url, {
          protocols: ["http", "https"],
          require_protocol: true,
          require_host: true,
          require_valid_protocol: true,
          allow_underscores: false,
          host_whitelist: false,
          host_blacklist: false,
          allow_trailing_dot: false,
          allow_protocol_relative_urls: false,
          disallow_auth: true,
          allow_fragments: true,
          allow_query_components: true,
        })
      ) {
        invalidUrls.push(url);
        continue;
      }

      // Check if URL contains invalid characters
      if (!validator.isAscii(url)) {
        invalidUrls.push(url);
        continue;
      }

      // Normalize URL by adding protocol if missing
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

      // Extract domain part for FQDN validation
      const cleanUrl = normalizedUrl.replace(/^https?:\/\//, "");
      const domainPart = cleanUrl.split("/")[0];

      // Validate domain using FQDN
      if (
        !validator.isFQDN(domainPart, {
          require_tld: true,
          allow_underscores: false,
          allow_trailing_dot: false,
          allow_numeric_tld: false,
        })
      ) {
        invalidUrls.push(url);
        continue;
      }

      // Additional check for proper domain extension
      const parts = domainPart.split(".");
      if (parts.length < 2) {
        invalidUrls.push(url);
        continue;
      }

      const extension = parts[parts.length - 1];
      if (!validator.isAlpha(extension) || extension.length < 2) {
        invalidUrls.push(url);
      }
    }

    if (invalidUrls.length > 0) {
      return this.createError({
        message: `Invalid URLs found: ${invalidUrls.join(", ")}`,
      });
    }

    return true;
  });

/**
 * Block URL validation schema (for blocking URLs)
 * Similar to multiple URLs but with specific messaging
 */
export const blockUrlSchema = Yup.string()
  .trim()
  .required("Website URL is required")
  .test("valid-urls", "Please enter a valid URL", function (value) {
    if (!value) return false;

    const urls = value
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      return this.createError({
        message: "At least one URL is required",
      });
    }

    // Check for duplicate URLs (case-insensitive)
    const normalizedUrls = urls.map((url) => {
      const normalized = url.startsWith("http") ? url : `https://${url}`;
      return normalized.toLowerCase();
    });

    const uniqueUrls = [...new Set(normalizedUrls)];
    if (normalizedUrls.length !== uniqueUrls.length) {
      // Find and report duplicate URLs
      const duplicates = [];
      const seen = new Set();

      for (let i = 0; i < urls.length; i++) {
        const normalized = normalizedUrls[i];
        if (seen.has(normalized)) {
          duplicates.push(urls[i]);
        } else {
          seen.add(normalized);
        }
      }

      return this.createError({
        message: `Duplicate URLs found: ${duplicates.join(", ")}`,
      });
    }

    const invalidUrls = [];

    for (const url of urls) {
      // Check if it's a valid URL using validator.js with less strict settings for blocking
      if (
        !validator.isURL(url, {
          protocols: ["http", "https"],
          require_protocol: true, // Allow URLs without protocol (will be auto-added)
          require_host: true,
          require_valid_protocol: true,
          allow_underscores: false,
          host_whitelist: false,
          host_blacklist: false,
          allow_trailing_dot: false,
          allow_protocol_relative_urls: false,
          disallow_auth: true,
          allow_fragments: true,
          allow_query_components: true,
        })
      ) {
        invalidUrls.push(url);
        continue;
      }

      // Check if URL contains invalid characters
      if (!validator.isAscii(url)) {
        invalidUrls.push(url);
        continue;
      }

      // Normalize URL by adding protocol if missing
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

      // Extract domain part for FQDN validation
      const cleanUrl = normalizedUrl.replace(/^https?:\/\//, "");
      const domainPart = cleanUrl.split("/")[0]; // Get only domain part, ignore path

      // Validate domain using FQDN (Fully Qualified Domain Name) - less strict for blocking
      if (
        !validator.isFQDN(domainPart, {
          require_tld: true,
          allow_underscores: false,
          allow_trailing_dot: false,
          allow_numeric_tld: false,
        })
      ) {
        invalidUrls.push(url);
        continue;
      }

      // Additional check for proper domain extension
      const parts = domainPart.split(".");
      if (parts.length < 2) {
        invalidUrls.push(url);
        continue;
      }

      const extension = parts[parts.length - 1];
      if (!validator.isAlpha(extension) || extension.length < 2) {
        invalidUrls.push(url);
      }
    }

    if (invalidUrls.length > 0) {
      return this.createError({
        message: `Invalid URLs found: ${invalidUrls.join(", ")}`,
      });
    }

    return true;
  });

/**
 * Form validation schemas for different use cases
 */
export const urlValidationSchemas = {
  // For single URL input (edit mode)
  singleUrl: Yup.object().shape({
    websiteUrls: singleUrlSchema,
  }),

  // For multiple URLs input (bulk add mode)
  multipleUrls: Yup.object().shape({
    websiteUrls: multipleUrlsSchema,
  }),

  // For block URLs (less strict validation)
  blockUrls: Yup.object().shape({
    websiteUrls: blockUrlSchema,
  }),
};

/**
 * Utility function to normalize URLs (add protocol if missing)
 */
export const normalizeUrl = (url) => {
  if (!url) return url;
  return url.startsWith("http") ? url : `https://${url}`;
};

/**
 * Utility function to parse and normalize multiple URLs
 */
export const parseAndNormalizeUrls = (urlsString) => {
  if (!urlsString) return [];

  return urlsString
    .split(/[,\n]/)
    .map((url) => normalizeUrl(url.trim()))
    .filter((url) => url.length > 0);
};

/**
 * Utility function to check for duplicate URLs
 * Returns array of duplicate URLs found
 */
export const findDuplicateUrls = (urlsString) => {
  if (!urlsString) return [];

  const urls = urlsString
    .split(/[,\n]/)
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  // Normalize URLs for comparison (case-insensitive)
  const normalizedUrls = urls.map((url) => {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    return normalized.toLowerCase();
  });

  // Find duplicates
  const duplicates = [];
  const seen = new Set();

  for (let i = 0; i < urls.length; i++) {
    const normalized = normalizedUrls[i];
    if (seen.has(normalized)) {
      duplicates.push(urls[i]);
    } else {
      seen.add(normalized);
    }
  }

  return duplicates;
};
