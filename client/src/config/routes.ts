import type { Route } from "next";

export const ROUTES = {
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  interviews: "/interviews",
  interview: (id: string) => `/interviews/${encodeURIComponent(id)}` as Route,
  dsa: "/dsa",
  problem: (slug: string) => `/dsa/${encodeURIComponent(slug)}` as Route,
  voice: "/voice",
  voiceSession: (id: string) => `/voice/${encodeURIComponent(id)}` as Route,
  companies: "/companies",
  company: (slug: string) => `/companies/${encodeURIComponent(slug)}` as Route,
  settings: "/settings",
  profile: "/profile",
} as const satisfies Record<string, Route | ((arg: string) => Route)>;

/** Only allow same-origin relative redirects (prevents open-redirect via ?next=). */
export function safeRedirect(
  path: string | null | undefined,
  fallback: Route = ROUTES.dashboard,
): Route {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\"))
    return fallback;
  return path as Route;
}
