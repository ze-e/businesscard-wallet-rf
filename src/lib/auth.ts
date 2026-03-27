import { NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { isValidUserId } from "./id-validator";

/** Session user information */
export interface SessionUser {
  userId: string;
}

/**
 * Extracts the user ID from a request
 * First checks session cookie, then falls back to header
 * @param request The incoming request
 * @returns The lowercase user ID
 * @throws Error if no valid user ID is found
 */
export function getUserIdFromRequest(request: NextRequest): string {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = readSessionToken(sessionCookie);

  if (session && isValidUserId(session.userId)) {
    return session.userId.toLowerCase();
  }

  const userId = request.headers.get("x-user-id");
  if (userId && isValidUserId(userId)) {
    return userId.toLowerCase();
  }

  throw new Error("Unauthorized: please login");
}

/**
 * Validates a user ID format
 * @param userId The user ID to validate
 * @returns Whether the user ID is valid
 */
export function isValidUserId(userId: string): boolean {
  return isValidUserId(userId);
}
