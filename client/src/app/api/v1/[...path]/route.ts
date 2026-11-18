import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/config/site";
import { clearSessionCookie, isSecureRequest, setSessionCookie } from "@/server/session";

/**
 * Backend-for-frontend proxy.
 *
 * The Express API authenticates with `Authorization: Bearer <jwt>` and returns the
 * JWT in the login/register body. The browser never sees it: we move it into an
 * httpOnly cookie here and re-attach it as a Bearer header on every proxied call.
 */
export const dynamic = "force-dynamic";
// Vercel: AI + code-execution calls can run long; match the upstream timeout below.
export const maxDuration = 60;

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");
const UPSTREAM_TIMEOUT_MS = 60_000; // AI endpoints (interview chat, feedback) can be slow
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// These responses start a session: the token goes into the httpOnly cookie and never reaches the browser.
// Sign-up no longer logs in; the account is created unverified and the session starts at verify-email.
const TOKEN_ROUTES = new Set(["auth/login", "auth/google", "auth/verify-email"]);
// The token is only there when the action replaced the session (changing the password signs the other devices out).
const OPTIONAL_TOKEN_ROUTES = new Set(["users/password"]);
const DROP_RESPONSE_HEADERS = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "set-cookie",
];

type Context = { params: Promise<{ path: string[] }> };

/**
 * Compare the browser's Origin with the host the request really arrived on.
 * `request.nextUrl.origin` is NOT used: in a Docker/standalone server it reflects the
 * bind address (e.g. 0.0.0.0), which would reject every legitimate same-site login.
 */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, server-to-server) send no Origin
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim();
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function handle(request: NextRequest, { params }: Context): Promise<Response> {
  const { path } = await params;
  const route = path.join("/");

  // CSRF defence in depth (cookie is also SameSite=Lax).
  if (MUTATING.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Cross-origin request blocked" },
      { status: 403 },
    );
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secure = isSecureRequest(request);

  // Logout always succeeds locally, even if the token is already invalid upstream.
  if (route === "auth/logout") {
    if (token) {
      await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5_000),
      }).catch(() => undefined);
    }
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    clearSessionCookie(response, secure);
    return response;
  }

  const headers = new Headers();
  for (const name of ["content-type", "accept", "accept-language"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (token) headers.set("authorization", `Bearer ${token}`);
  // let the API rate-limit per real client instead of per proxy
  const clientIp = request.headers.get("x-forwarded-for");
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/api/v1/${route}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // required by undici when streaming a request body (audio uploads, later phases)
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    } as RequestInit);
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return NextResponse.json(
      {
        success: false,
        message: timedOut ? "The server took too long to respond." : "Backend is unreachable.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }

  // Login / Google sign-in / verify-email / password change: lift the token out of the JSON body into the cookie.
  const tokenRequired = TOKEN_ROUTES.has(route);
  if ((tokenRequired || OPTIONAL_TOKEN_ROUTES.has(route)) && upstream.ok) {
    const body = (await upstream.json().catch(() => null)) as { data?: { token?: string } } | null;
    const issued = body?.data?.token;
    if (!body || (tokenRequired && !issued)) {
      return NextResponse.json(
        { success: false, message: "Unexpected response from the server." },
        { status: 502 },
      );
    }
    if (body.data) delete body.data.token;
    const response = NextResponse.json(body, { status: upstream.status });
    if (issued) setSessionCookie(response, issued, secure);
    return response;
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const name of DROP_RESPONSE_HEADERS) responseHeaders.delete(name);
  responseHeaders.set("cache-control", "no-store");

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });

  // Expired / revoked token, or the account was just deleted: drop the cookie so the route guard
  // stops treating us as signed in.
  const accountDeleted = request.method === "DELETE" && route === "users/account" && upstream.ok;
  if ((upstream.status === 401 && token) || accountDeleted) clearSessionCookie(response, secure);

  return response;
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
