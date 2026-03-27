/**
 * Centralized API endpoint paths
 */
export const API_PATHS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  settings: {
    apiKey: "/api/settings/api-key",
  },
  cards: "/api/cards",
  extract: "/api/cards/extract",
  merge: "/api/cards/merge",
  export: "/api/export",
} as const;
