import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/config/site";

const AUTH_PAGES = new Set(["/login", "/signup"]);

/**
 * Optimistic gate: only checks the session cookie EXISTS so users never see a
 * protected shell flash. The backend remains the source of truth (401 -> /login).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);
  const isAuthPage = AUTH_PAGES.has(pathname);

  if (!hasSession && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\..*).*)"],
};
