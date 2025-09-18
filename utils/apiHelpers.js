/**
 * API Helper Utilities
 * Common patterns for API calls, pagination, and data handling
 */

import { handleApiError, withErrorHandling } from "./errorHandler.js";
import { LOADING_MESSAGES } from "@/constants/index.js";

/**
 * Create a standard API call wrapper with loading states
 * @param {Function} apiCall - API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - API call utilities
 */
export const createApiCall = (apiCall, options = {}) => {
  const {
    loadingKey = "default",
    context = "",
    onSuccess = null,
    onError = null,
    showSuccessToast = false,
    successMessage = "",
  } = options;

  return async (params = {}, setLoading = null) => {
    if (setLoading) {
      setLoading(true);
    }

    const result = await withErrorHandling(() => apiCall(params), {
      context,
      onSuccess: (data) => {
        if (showSuccessToast && successMessage) {
          const { showSuccessToast: showToast } = require("./errorHandler.js");
          showToast(successMessage);
        }
        if (onSuccess) {
          onSuccess(data);
        }
      },
      onError,
    });

    if (setLoading) {
      setLoading(false);
    }

    return result;
  };
};

/**
 * Standard pagination handler
 * @param {Object} paginationState - Current pagination state
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Function} setData - Function to set data
 * @param {Function} setTotalCount - Function to set total count
 * @param {Function} setLoading - Function to set loading state
 * @returns {Function} - Fetch function with pagination
 */
export const createPaginatedFetch = (
  paginationState,
  fetchFunction,
  setData,
  setTotalCount,
  setLoading
) => {
  return async (additionalParams = {}) => {
    if (setLoading) {
      setLoading(true);
    }

    const params = {
      page: paginationState.currentPage,
      pageSize: paginationState.pageSize,
      ...additionalParams,
    };

    const result = await withErrorHandling(() => fetchFunction(params), {
      context: "pagination fetch",
      onSuccess: (response) => {
        if (response) {
          setData(response.data || response || []);
          setTotalCount(response.totalCount || response.length || 0);
        }
      },
    });

    if (setLoading) {
      setLoading(false);
    }

    return result;
  };
};

/**
 * Debounced search handler
 * @param {Function} searchFunction - Function to perform search
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} - Debounced search function
 */
export const createDebouncedSearch = (searchFunction, delay = 500) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      searchFunction(...args);
    }, delay);
  };
};

/**
 * URL state synchronization for pagination and search
 * @param {Object} state - Current state
 * @param {Function} router - Next.js router
 * @param {string} basePath - Base path for URL
 */
export const syncUrlState = (state, router, basePath) => {
  const searchParams = new URLSearchParams();

  // Add search query
  if (state.searchQuery) {
    searchParams.set("q", state.searchQuery);
  }

  // Add pagination
  if (state.currentPage > 1) {
    searchParams.set("page", state.currentPage);
  }

  if (state.pageSize !== 25) {
    searchParams.set("limit", state.pageSize);
  }

  // Add sorting
  if (state.sortField && state.sortOrder) {
    const sort = `${state.sortField}:${state.sortOrder}`;
    if (sort !== "createdAt:desc") {
      searchParams.set("sort", sort);
    }
  }

  // Update URL without triggering navigation
  const newUrl = `${basePath}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  router.replace(newUrl, { shallow: true });
};

/**
 * Extract state from URL search parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} - Extracted state
 */
export const getStateFromUrl = (searchParams) => {
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 25;
  const sort = searchParams.get("sort") || "createdAt:desc";
  const [sortField, sortOrder] = sort.split(":");

  return {
    searchQuery: q,
    currentPage: page,
    pageSize: limit,
    sortField: sortField || "createdAt",
    sortOrder: sortOrder || "desc",
  };
};

/**
 * Generic delete handler with confirmation
 * @param {Function} deleteFunction - API delete function
 * @param {Function} refreshData - Function to refresh data after delete
 * @param {string} itemName - Name of item being deleted (for confirmation)
 * @returns {Function} - Delete handler function
 */
export const createDeleteHandler = (
  deleteFunction,
  refreshData,
  itemName = "item"
) => {
  return async (id, setDeleting = null) => {
    if (!confirm(`Are you sure you want to delete this ${itemName}?`)) {
      return false;
    }

    if (setDeleting) {
      setDeleting(true);
    }

    const result = await withErrorHandling(() => deleteFunction(id), {
      context: `delete ${itemName}`,
      showToast: true,
      onSuccess: () => {
        const { showSuccessToast } = require("./errorHandler.js");
        showSuccessToast(`${itemName} deleted successfully`);
        refreshData();
      },
    });

    if (setDeleting) {
      setDeleting(false);
    }

    return result !== null;
  };
};

/**
 * Bulk operations handler
 * @param {Function} bulkFunction - API bulk operation function
 * @param {Function} refreshData - Function to refresh data
 * @param {string} operation - Name of operation (e.g., "delete", "update")
 * @returns {Function} - Bulk operation handler
 */
export const createBulkHandler = (
  bulkFunction,
  refreshData,
  operation = "update"
) => {
  return async (selectedIds, data = {}, setLoading = null) => {
    if (selectedIds.length === 0) {
      const { showErrorToast } = require("./errorHandler.js");
      showErrorToast("Please select items to " + operation);
      return false;
    }

    if (
      !confirm(
        `Are you sure you want to ${operation} ${selectedIds.length} items?`
      )
    ) {
      return false;
    }

    if (setLoading) {
      setLoading(true);
    }

    const result = await withErrorHandling(
      () => bulkFunction(selectedIds, data),
      {
        context: `bulk ${operation}`,
        showToast: true,
        onSuccess: () => {
          const { showSuccessToast } = require("./errorHandler.js");
          showSuccessToast(
            `${selectedIds.length} items ${operation}d successfully`
          );
          refreshData();
        },
      }
    );

    if (setLoading) {
      setLoading(false);
    }

    return result !== null;
  };
};

/**
 * Form submission handler with validation
 * @param {Function} submitFunction - API submit function
 * @param {Object} options - Configuration options
 * @returns {Function} - Form submit handler
 */
export const createFormSubmitHandler = (submitFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    successMessage = "Data saved successfully",
    resetForm = true,
    redirectTo = null,
  } = options;

  return async (values, formikBag, router = null) => {
    const { setSubmitting, setErrors, resetForm: formikReset } = formikBag;

    setSubmitting(true);

    const result = await withErrorHandling(() => submitFunction(values), {
      context: "form submission",
      showToast: false, // Handle success toast manually
      onSuccess: (data) => {
        const { showSuccessToast } = require("./errorHandler.js");
        showSuccessToast(successMessage);

        if (resetForm && formikReset) {
          formikReset();
        }

        if (redirectTo && router) {
          router.push(redirectTo);
        }

        if (onSuccess) {
          onSuccess(data);
        }
      },
      onError: (error, errorMessage) => {
        // Handle validation errors
        if (error?.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          const { showErrorToast } = require("./errorHandler.js");
          showErrorToast(errorMessage);
        }

        if (onError) {
          onError(error, errorMessage);
        }
      },
    });

    setSubmitting(false);
    return result;
  };
};
