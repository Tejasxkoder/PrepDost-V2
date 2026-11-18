import { ApiError, getErrorMessage } from "@/lib/api/errors";

/** `code` values the auth endpoints put on their error envelope. */
export const AUTH_ERROR_CODE = {
  emailNotVerified: "EMAIL_NOT_VERIFIED",
  invalidCode: "INVALID_CODE",
  tooManyAttempts: "TOO_MANY_ATTEMPTS",
} as const;

export function hasAuthErrorCode(
  error: unknown,
  code: (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE],
): boolean {
  return error instanceof ApiError && error.code === code;
}

/** Message for a failed code check; the server's own wording wins, these only cover an empty one. */
export function getOtpErrorMessage(error: unknown): string {
  if (error instanceof ApiError && !error.message) {
    if (error.code === AUTH_ERROR_CODE.tooManyAttempts)
      return "Too many wrong attempts. Request a new code.";
    if (error.code === AUTH_ERROR_CODE.invalidCode) return "Invalid or expired code";
  }
  return getErrorMessage(error);
}
