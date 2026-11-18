import type { z } from "zod";
import { env } from "@/config/env";
import { ApiError, type FieldErrors } from "./errors";

type Params = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions<T> {
  params?: Params;
  body?: unknown;
  signal?: AbortSignal;
  /** Validates + types the response at the network boundary. */
  schema?: z.ZodType<T>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function buildUrl(path: string, params?: Params) {
  const base = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const qs = query.toString();
  return `${base}${path.startsWith("/") ? path : `/${path}`}${qs ? `?${qs}` : ""}`;
}

/**
 * Backend envelope adapter. Express answers `{ success, message, data? }` (errors: `{ success: false, message, errors? }`);
 * change ONLY this function if the contract differs.
 */
function unwrap(body: unknown): unknown {
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return (body as { data: unknown }).data;
  }
  return body;
}

function extractError(
  body: unknown,
  fallback: string,
): { message: string; code?: string; fieldErrors?: FieldErrors } {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    const message =
      typeof b.message === "string" ? b.message : typeof b.error === "string" ? b.error : fallback;

    let fieldErrors: FieldErrors | undefined;
    if (b.errors && typeof b.errors === "object" && !Array.isArray(b.errors)) {
      const entries = Object.entries(b.errors).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      );
      if (entries.length > 0) fieldErrors = Object.fromEntries(entries);
    }

    return { message, code: typeof b.code === "string" ? b.code : undefined, fieldErrors };
  }
  return { message: fallback };
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions<T> = {},
): Promise<T> {
  const { params, body, signal, schema, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const timeout = AbortSignal.timeout(timeoutMs);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        // FormData sets its own multipart boundary header
        ...(body !== undefined && !(body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("The server took too long to respond.", 408);
    }
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Cannot reach the server. Check your connection.", 0);
  }

  const raw: unknown = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const { message, code, fieldErrors } = extractError(raw, `Request failed (${response.status})`);
    throw new ApiError(message, response.status, { code, details: raw, fieldErrors });
  }

  const data = unwrap(raw);
  if (!schema) return data as T;

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError("Received an unexpected response from the server.", 502, {
      details: parsed.error.issues,
    });
  }
  return parsed.data;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions<T>, "body">) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions<T>, "body">) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions<T>, "body">) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions<T>, "body">) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions<T>, "body">) =>
    request<T>("DELETE", path, options),
};
