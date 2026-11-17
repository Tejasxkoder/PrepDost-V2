export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  /** Per-field validation messages, e.g. `{ email: "Invalid email" }` (backend `errors`). */
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    status: number,
    options: { code?: string; details?: unknown; fieldErrors?: FieldErrors } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code;
    this.details = options.details;
    this.fieldErrors = options.fieldErrors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
