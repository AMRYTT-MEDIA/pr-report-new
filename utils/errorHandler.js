/**
 * Error Handling Utilities
 * Centralized error handling for consistent error messages and logging
 */

import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/constants/index.js";

/**
 * Extract error message from various error formats
 * @param {Error|Object} error - Error object from API or other sources
 * @returns {string} - Human-readable error message
 */
export const getErrorMessage = (error) => {
  // Handle different error formats
  if (typeof error === "string") {
    return error;
  }

  // API response errors
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Firebase errors
  if (error?.code) {
    switch (error.code) {
      case "auth/invalid-email":
        return ERROR_MESSAGES.INVALID_EMAIL;
      case "auth/user-disabled":
        return ERROR_MESSAGES.ACCOUNT_DISABLED;
      case "auth/user-not-found":
        return ERROR_MESSAGES.USER_NOT_FOUND;
      case "auth/wrong-password":
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      case "auth/too-many-requests":
        return ERROR_MESSAGES.TOO_MANY_REQUESTS;
      case "auth/weak-password":
        return ERROR_MESSAGES.WEAK_PASSWORD;
      case "auth/email-already-in-use":
        return ERROR_MESSAGES.EMAIL_ALREADY_IN_USE;
      case "auth/network-request-failed":
        return ERROR_MESSAGES.NETWORK_ERROR;
      default:
        return error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG;
    }
  }

  // Standard Error objects
  if (error?.message) {
    return error.message;
  }

  // Network errors
  if (error?.name === "NetworkError") {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Default fallback
  return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
};

/**
 * Display error toast with consistent formatting
 * @param {Error|Object|string} error - Error to display
 * @param {string} [fallbackMessage] - Custom fallback message
 */
export const showErrorToast = (error, fallbackMessage = null) => {
  const message = fallbackMessage || getErrorMessage(error);
  toast.error(message);
};

/**
 * Display success toast with consistent formatting
 * @param {string} message - Success message to display
 */
export const showSuccessToast = (message) => {
  toast.success(message);
};

/**
 * Handle API errors with logging and user notification
 * @param {Error|Object} error - Error from API call
 * @param {string} [context] - Context where error occurred (for logging)
 * @param {boolean} [showToast=true] - Whether to show error toast
 * @returns {string} - Error message
 */
export const handleApiError = (error, context = "", showToast = true) => {
  const errorMessage = getErrorMessage(error);

  // Log error for debugging
  console.error(`API Error${context ? ` in ${context}` : ""}:`, error);

  // Show toast notification
  if (showToast) {
    showErrorToast(errorMessage);
  }

  return errorMessage;
};

/**
 * Async wrapper that handles errors automatically
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Options for error handling
 * @returns {Promise} - Result of async function or null if error
 */
export const withErrorHandling = async (asyncFn, options = {}) => {
  const {
    context = "",
    showToast = true,
    fallbackMessage = null,
    onError = null,
    onSuccess = null,
  } = options;

  try {
    const result = await asyncFn();

    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    const errorMessage = handleApiError(error, context, showToast);

    if (onError) {
      onError(error, errorMessage);
    }

    return null;
  }
};

/**
 * Validation error handler for forms
 * @param {Object} errors - Validation errors object
 * @param {string} [field] - Specific field to get error for
 * @returns {string|Object} - Error message(s)
 */
export const getValidationError = (errors, field = null) => {
  if (!errors) return null;

  if (field) {
    return errors[field] || null;
  }

  return errors;
};

/**
 * Network error checker
 * @param {Error} error - Error to check
 * @returns {boolean} - Whether error is network-related
 */
export const isNetworkError = (error) => {
  return (
    error?.name === "NetworkError" ||
    error?.code === "NETWORK_ERROR" ||
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("connection") ||
    !navigator.onLine
  );
};

/**
 * Authentication error checker
 * @param {Error} error - Error to check
 * @returns {boolean} - Whether error is auth-related
 */
export const isAuthError = (error) => {
  return (
    error?.response?.status === 401 ||
    error?.code?.startsWith("auth/") ||
    error?.message?.toLowerCase().includes("unauthorized") ||
    error?.message?.toLowerCase().includes("authentication")
  );
};
