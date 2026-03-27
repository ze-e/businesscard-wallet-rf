import { z } from "zod";

/** Regex pattern for password validation */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;

/**
 * Result of password validation
 */
export interface ValidationResult {
  /** Whether the password is valid */
  isValid: boolean;
  /** Error message if invalid, undefined if valid */
  error?: string;
}

/**
 * Validates a password against the security requirements
 * @param password The password to validate
 * @returns Validation result with isValid flag and error message
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length < 7) {
    return {
      isValid: false,
      error: "Password must be at least 7 characters",
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error:
      "Password must include uppercase, lowercase, number, and special character.",
    };
  }

  return { isValid: true };
}

/**
 * Zod schema for password validation (for use in API routes)
 */
export const PasswordSchema = z
  .string()
  .min(7, "Password must be at least 7 characters")
  .regex(
    PASSWORD_REGEX,
    "Password must include uppercase, lowercase, number, and special character."
  );
