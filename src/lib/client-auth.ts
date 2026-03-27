"use client";

const USER_KEY = "business-card-user-id";

export function getUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(USER_KEY);
  if (existing) {
    return existing;
  }

  const fallback = "demo.user@example.com";
  localStorage.setItem(USER_KEY, fallback);
  return fallback;
}

export function setUserId(value: string): void {
  localStorage.setItem(USER_KEY, value);
}