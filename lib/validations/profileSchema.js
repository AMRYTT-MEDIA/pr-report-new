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

  // Current Password - Required when new password or confirm password is provided
  currentPassword: Yup.string().test(
    "current-password-required-when-new",
    "Current password is required when changing password",
    function (value) {
      const { newPassword, confirmPassword } = this.parent;

      // If new password or confirm password is provided, current password is required
      if ((newPassword || confirmPassword) && !value) {
        return false;
      }

      return true;
    }
  ),

  // New Password - Required when current password is provided OR when confirm password is provided
  newPassword: Yup.string()
    .test(
      "new-password-required-when-current-or-confirm",
      "New password is required when changing password",
      function (value) {
        const { currentPassword, confirmPassword } = this.parent;

        // If current password is provided OR confirm password is provided, new password is required
        if ((currentPassword || confirmPassword) && !value) {
          return false;
        }

        return true;
      }
    )
    .test(
      "new-password-validation",
      "Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      function (value) {
        const { currentPassword, confirmPassword } = this.parent;

        // Only validate if any password field is provided and new password exists
        if ((currentPassword || confirmPassword) && value) {
          if (value.length < 6) {
            return this.createError({
              message: "Password must be at least 6 characters",
            });
          }
          if (value.length > 100) {
            return this.createError({
              message: "Password must be less than 100 characters",
            });
          }
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
            return this.createError({
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            });
          }
        }

        return true;
      }
    ),

  // Confirm Password - Required when current password OR new password is provided and must match new password
  confirmPassword: Yup.string()
    .test("confirm-password-required-when-password-change", "Please confirm your new password", function (value) {
      const { currentPassword, newPassword } = this.parent;

      // If current password OR new password is provided, confirm password is required
      if ((currentPassword || newPassword) && !value) {
        return false;
      }

      return true;
    })
    .test("passwords-match", "Passwords must match", function (value) {
      const { newPassword, currentPassword } = this.parent;

      // Only validate if any password field is provided
      if ((currentPassword || newPassword) && newPassword && value) {
        if (newPassword !== value) {
          return false;
        }
      }

      return true;
    }),

  // Avatar - Optional file upload with extension validation
  avatar: Yup.mixed()
    .nullable() // Explicitly allow null/undefined
    .test("fileSize", "File size too large (max 5MB)", (value) => {
      if (!value) return true;

      // If it's a file object (new upload)
      if (value instanceof File) {
        return value.size <= 5 * 1024 * 1024; // 5MB
      }

      // If it's a data URL, check size
      if (typeof value === "string" && value.startsWith("data:")) {
        // Rough estimation: base64 string length * 0.75
        const sizeInBytes = value.length * 0.75;
        return sizeInBytes <= 5 * 1024 * 1024; // 5MB
      }

      // If it's an existing image path/URL
      return true;
    })
    .test("fileType", "Please upload a valid image file (JPG, PNG, GIF, SVG)", (value) => {
      if (!value) return true;

      // If it's a file object (new upload)
      if (value instanceof File) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/svg+xml", "image/webp"];
        return allowedTypes.includes(value.type.toLowerCase());
      }

      // If it's a data URL, check the MIME type
      if (typeof value === "string" && value.startsWith("data:")) {
        const [dataPart] = value.split(",");
        const [, typeWithEncoding] = dataPart.split(":");
        const [mimeType] = typeWithEncoding.split(";");
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/svg+xml", "image/webp"];
        return allowedTypes.includes(mimeType.toLowerCase());
      }

      // If it's an existing image path/URL
      return true;
    })
    .test("fileExtension", "Invalid file extension. Please use JPG, PNG, GIF, or SVG", (value) => {
      if (!value) return true;

      // If it's a file object (new upload)
      if (value instanceof File) {
        const fileName = value.name.toLowerCase();
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
        return allowedExtensions.some((ext) => fileName.endsWith(ext));
      }

      // For data URLs and existing paths, file type test above is sufficient
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
  currentPassword: "",
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
    delete transformed.currentPassword;
  }

  // Remove role as it's read-only
  delete transformed.role;

  return transformed;
};

export default profileValidationSchema;
