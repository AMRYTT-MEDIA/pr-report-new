import * as Yup from "yup";

/**
 * Profile form validation schema using Yup
 * Provides comprehensive validation for all profile fields
 */
export const profileValidationSchema = Yup.object().shape({
  // User Name - Required field with length constraints
  fullName: Yup.string()
    .required("User name is required")
    .min(2, "User name must be at least 2 characters")
    .max(50, "User name must be less than 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "User name can only contain letters and spaces")
    .trim(),

  // Email - Required with proper email format
  email: Yup.string()
    .required("Email address is required")
    .email("Please enter a valid email address")
    .max(100, "Email address must be less than 100 characters"),

  // User Role - Read-only, no validation needed but included for completeness
  role: Yup.string(),

  // New Password - Optional but with strong requirements if provided
  newPassword: Yup.string()
    .test(
      "password-required-when-confirm",
      "Please enter a new password",
      function (value) {
        const { confirmPassword } = this.parent;

        // If confirm password is entered but new password is empty, show error
        if (confirmPassword && !value) {
          return false;
        }

        return true;
      }
    )
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  // Confirm Password - Must match new password if provided
  confirmPassword: Yup.string()
    .test(
      "password-required",
      "Please enter a new password first",
      function (value) {
        const { newPassword } = this.parent;

        // If confirm password is entered but new password is empty, show error
        if (value && !newPassword) {
          return false;
        }

        return true;
      }
    )
    .test("passwords-match", "Passwords must match", function (value) {
      const { newPassword } = this.parent;

      // If no new password is provided, confirm password is not required
      if (!newPassword && !value) return true;

      // If new password is provided, confirm password is required and must match
      if (newPassword && !value) {
        return this.createError({ message: "Please confirm your password" });
      }

      return newPassword === value;
    }),

  // Avatar - Optional file upload
  avatar: Yup.mixed()
    .test("fileSize", "File size too large (max 5MB)", function (value) {
      if (!value) return true;

      // If it's a file object (new upload)
      if (value instanceof File) {
        return value.size <= 5 * 1024 * 1024; // 5MB
      }

      // If it's a data URL or existing image path
      return true;
    })
    .test("fileType", "Unsupported file type", function (value) {
      if (!value) return true;

      // If it's a file object (new upload)
      if (value instanceof File) {
        return [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
        ].includes(value.type);
      }

      // If it's a data URL or existing image path
      return true;
    }),
});

/**
 * Initial values for the profile form
 * Can be populated with user data
 */
export const getProfileInitialValues = (user = {}) => ({
  fullName: user?.fullName || "",
  email: user?.email || "",
  role: user?.role?.name || "",
  newPassword: "",
  confirmPassword: "",
  avatar: user?.avatar || null,
});

/**
 * Transform form values for API submission
 * Removes empty password fields and prepares data
 */
export const transformProfileValues = (values) => {
  const transformed = { ...values };

  // Remove password fields if they're empty
  if (!transformed.newPassword) {
    delete transformed.newPassword;
    delete transformed.confirmPassword;
  }

  // Remove role as it's read-only
  delete transformed.role;

  return transformed;
};

export default profileValidationSchema;
