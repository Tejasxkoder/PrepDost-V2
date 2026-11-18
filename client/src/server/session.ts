import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/config/site";

const DEFAULT_MAX_AGE_S = 7 * 24 * 60 * 60;

/** Reads `exp` from the JWT so the cookie expires exactly with the token. */
function tokenMaxAge(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as { exp?: number };
    if (typeof payload.exp === "number") {
      return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_MAX_AGE_S;
}

/** `Secure` only over https (Safari rejects Secure cookies on http://localhost). */
export function isSecureRequest(request: NextRequest): boolean {
  return (
    request.headers.get("x-forwarded-proto") === "https" || request.nextUrl.protocol === "https:"
  );
}

export function setSessionCookie(response: NextResponse, token: string, secure: boolean) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: tokenMaxAge(token),
  });
}

export function clearSessionCookie(response: NextResponse, secure: boolean) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
