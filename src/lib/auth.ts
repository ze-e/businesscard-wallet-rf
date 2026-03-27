import { NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

const USER_ID_REGEX = /^[a-zA-Z0-9._@-]{3,100}$/;

export function getUserIdFromRequest(request: NextRequest): string {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = readSessionToken(sessionCookie);
  if (session && USER_ID_REGEX.test(session.userId)) {
    return session.userId.toLowerCase();
  }

  const userId = request.headers.get("x-user-id");
  if (userId && USER_ID_REGEX.test(userId)) {
    return userId.toLowerCase();
  }

  throw new Error("Unauthorized: please login");
}

export function isValidUserId(userId: string): boolean {
  return USER_ID_REGEX.test(userId);
}