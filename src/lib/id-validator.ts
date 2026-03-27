import { z } from "zod";

/** Regex pattern for user ID validation */
const USER_ID_REGEX = /^[a-zA-Z0-9._@-]{3,100}$/;

/**
 * Validates a user ID format
 * @param userId The user ID to validate
 * @returns Whether the user ID is valid
 */
export function isValidUserId(userId: string): boolean {
  return USER_ID_REGEX.test(userId);
}

/**
 * Zod schema for user ID validation (for use in API routes)
 */
export const UserIdSchema = z.string().trim().min(3).max(100);
