import { confirmPasswordReset, sendPasswordResetEmail, verifyPasswordResetCode } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

// Helper function for error messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No user found with this email address.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/expired-action-code":
      return "Reset link has expired. Please request a new one.";
    case "auth/invalid-action-code":
      return "Invalid reset link. Please request a new one.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
};

// Send password reset email with custom page redirect
export const sendCustomPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
    return { success: true, message: "Reset email sent successfully!" };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error.code),
    };
  }
};

// Verify password reset code
export const verifyResetCode = async (oobCode) => {
  try {
    const email = await verifyPasswordResetCode(getFirebaseAuth(), oobCode);
    return { success: true, email };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error.code),
    };
  }
};

// Confirm password reset
export const confirmPasswordResetWithCode = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(getFirebaseAuth(), oobCode, newPassword);
    return { success: true, message: "Password reset successfully!" };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error.code),
    };
  }
};
