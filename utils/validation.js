/**
 * Validation Utilities
 * Common validation rules and schemas for forms
 */

import * as Yup from "yup";
import { isEmail, isURL } from "validator";
import { VALIDATION, ERROR_MESSAGES } from "@/constants/index.js";

/**
 * Common validation rules
 */
export const validationRules = {
  // Email validation
  email: Yup.string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .max(
      VALIDATION.EMAIL.MAX_LENGTH,
      `Email must be less than ${VALIDATION.EMAIL.MAX_LENGTH} characters`
    )
    .required(ERROR_MESSAGES.REQUIRED_FIELD),

  // Password validation
  password: Yup.string()
    .min(
      VALIDATION.PASSWORD.MIN_LENGTH,
      `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`
    )
    .max(
      VALIDATION.PASSWORD.MAX_LENGTH,
      `Password must be less than ${VALIDATION.PASSWORD.MAX_LENGTH} characters`
    )
    .required(ERROR_MESSAGES.REQUIRED_FIELD),

  // Name validation
  name: Yup.string()
    .min(
      VALIDATION.NAME.MIN_LENGTH,
      `Name must be at least ${VALIDATION.NAME.MIN_LENGTH} characters`
    )
    .max(
      VALIDATION.NAME.MAX_LENGTH,
      `Name must be less than ${VALIDATION.NAME.MAX_LENGTH} characters`
    )
    .required(ERROR_MESSAGES.REQUIRED_FIELD),

  // URL validation
  url: Yup.string()
    .url("Please enter a valid URL")
    .max(
      VALIDATION.URL.MAX_LENGTH,
      `URL must be less than ${VALIDATION.URL.MAX_LENGTH} characters`
    )
    .required(ERROR_MESSAGES.REQUIRED_FIELD),

  // Optional URL validation
  urlOptional: Yup.string()
    .url("Please enter a valid URL")
    .max(
      VALIDATION.URL.MAX_LENGTH,
      `URL must be less than ${VALIDATION.URL.MAX_LENGTH} characters`
    )
    .nullable(),

  // Required field validation
  required: (fieldName = "This field") =>
    Yup.string().required(`${fieldName} is required`),

  // Optional string validation
  optionalString: Yup.string().nullable(),

  // Number validation
  number: Yup.number()
    .typeError("Must be a number")
    .required(ERROR_MESSAGES.REQUIRED_FIELD),

  // Optional number validation
  numberOptional: Yup.number().typeError("Must be a number").nullable(),

  // Positive number validation
  positiveNumber: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive number")
    .required(ERROR_MESSAGES.REQUIRED_FIELD),

  // Boolean validation
  boolean: Yup.boolean(),

  // Array validation
  array: Yup.array(),

  // Select validation (dropdown)
  select: (options = []) =>
    Yup.string()
      .oneOf(
        options.map((opt) => opt.value),
        "Please select a valid option"
      )
      .required(ERROR_MESSAGES.REQUIRED_FIELD),
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // Login form
  login: Yup.object({
    email: validationRules.email,
    password: Yup.string().required(ERROR_MESSAGES.REQUIRED_FIELD),
  }),

  // Registration form
  register: Yup.object({
    name: validationRules.name,
    email: validationRules.email,
    password: validationRules.password,
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required(ERROR_MESSAGES.REQUIRED_FIELD),
  }),

  // Forgot password form
  forgotPassword: Yup.object({
    email: validationRules.email,
  }),

  // Reset password form
  resetPassword: Yup.object({
    password: validationRules.password,
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required(ERROR_MESSAGES.REQUIRED_FIELD),
  }),

  // User form
  user: Yup.object({
    name: validationRules.name,
    email: validationRules.email,
    role: validationRules.required("Role"),
    status: validationRules.required("Status"),
  }),

  // Website form
  website: Yup.object({
    name: validationRules.name,
    url: validationRules.url,
    description: validationRules.optionalString,
    category: validationRules.optionalString,
  }),

  // Block URL form
  blockUrl: Yup.object({
    url: validationRules.url,
    reason: validationRules.optionalString,
  }),

  // Contact form
  contact: Yup.object({
    name: validationRules.name,
    email: validationRules.email,
    subject: validationRules.required("Subject"),
    message: Yup.string()
      .min(10, "Message must be at least 10 characters")
      .required(ERROR_MESSAGES.REQUIRED_FIELD),
  }),
};

/**
 * Custom validation functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const validateEmail = (email) => {
  return isEmail(email || "");
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export const validateUrl = (url) => {
  if (!url) return false;
  return isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
  });
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, feedback: "Password is required" };
  }

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= VALIDATION.PASSWORD.MIN_LENGTH) {
    score += 1;
  } else {
    feedback.push(`At least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`);
  }

  // Uppercase letter
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else if (VALIDATION.PASSWORD.REQUIRE_UPPERCASE) {
    feedback.push("One uppercase letter");
  }

  // Lowercase letter
  if (/[a-z]/.test(password)) {
    score += 1;
  } else if (VALIDATION.PASSWORD.REQUIRE_LOWERCASE) {
    feedback.push("One lowercase letter");
  }

  // Number
  if (/\d/.test(password)) {
    score += 1;
  } else if (VALIDATION.PASSWORD.REQUIRE_NUMBERS) {
    feedback.push("One number");
  }

  // Special character
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else if (VALIDATION.PASSWORD.REQUIRE_SPECIAL_CHARS) {
    feedback.push("One special character");
  }

  return {
    score,
    feedback:
      feedback.length > 0
        ? `Password must contain: ${feedback.join(", ")}`
        : "",
    isValid: score >= 1 && password.length >= VALIDATION.PASSWORD.MIN_LENGTH,
  };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    required = false,
  } = options;

  if (!file) {
    return {
      isValid: !required,
      error: required ? "File is required" : null,
    };
  }

  // Size validation
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(
        maxSize / 1024 / 1024
      )}MB`,
    };
  }

  // Type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.join(", ")}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ""); // Remove event handlers
};

/**
 * Validate and sanitize form data
 * @param {Object} data - Form data to validate
 * @param {Object} schema - Yup validation schema
 * @returns {Object} - Validation result
 */
export const validateAndSanitizeForm = async (data, schema) => {
  try {
    // Sanitize string fields
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      acc[key] =
        typeof data[key] === "string" ? sanitizeInput(data[key]) : data[key];
      return acc;
    }, {});

    // Validate with schema
    const validData = await schema.validate(sanitizedData, {
      abortEarly: false,
    });

    return {
      isValid: true,
      data: validData,
      errors: {},
    };
  } catch (error) {
    const errors = {};

    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }

    return {
      isValid: false,
      data: null,
      errors,
    };
  }
};
