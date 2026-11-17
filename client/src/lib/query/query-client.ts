import { isServer, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

function handleUnauthorized(error: unknown) {
  if (typeof window === "undefined") return;
  if (error instanceof ApiError && error.isUnauthorized) {
    const { pathname } = window.location;
    if (pathname !== ROUTES.login && pathname !== ROUTES.signup) {
      // Full reload on purpose: drops every cached query of the expired session.
      window.location.replace(`${ROUTES.login}?next=${encodeURIComponent(pathname)}`);
    }
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserClient ??= makeQueryClient();
  return browserClient;
}
