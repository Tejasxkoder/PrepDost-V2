import { AUTH_COOKIE_NAME } from "@/config/site";
import type { AuthApi } from "@/features/auth/api";
import type { User } from "@/features/user/schemas";
import { deleteCookie, hasCookie, setCookie } from "@/lib/cookies";
import { ApiError } from "@/lib/api/errors";
import { AUTH_ERROR_CODE } from "@/features/auth/errors";
import { RESEND_COOLDOWN_SECONDS, passwordSchema } from "@/features/auth/schemas";
import { delay } from "./delay";

interface StoredUser extends User {
  password: string;
  /** `false` until the emailed code is confirmed. Records without the flag (e.g. the demo user) are verified. */
  emailVerified?: boolean;
}

const USERS_KEY = "pd_mock_users";
const SESSION_KEY = "pd_mock_session";

export const MOCK_DEMO_CREDENTIALS = { email: "demo@prepdost.dev", password: "Demo@1234" } as const;

/** The only code the mock "emails"; shown as a hint on the OTP steps. */
export const MOCK_OTP_CODE = "123456";
const MAX_OTP_ATTEMPTS = 5;
const ATTEMPTS_KEY = "pd_mock_otp_attempts";
type OtpPurpose = "verify" | "reset";

const DEMO_USER: StoredUser = {
  id: "u_demo",
  name: "Tejas Kumar",
  email: MOCK_DEMO_CREDENTIALS.email,
  password: MOCK_DEMO_CREDENTIALS.password,
  avatarUrl: null,
  role: "user",
  githubUsername: null,
  leetcodeUsername: null,
};

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : [];
    // stored records win over the seeded demo user (so demo edits persist)
    return [...parsed, ...(parsed.some((u) => u.id === DEMO_USER.id) ? [] : [DEMO_USER])];
  } catch {
    return [DEMO_USER];
  }
}

function saveUser(user: StoredUser) {
  const others = readUsers().filter((u) => u.id !== user.id);
  localStorage.setItem(USERS_KEY, JSON.stringify([...others, user]));
}

function strip({ password: _password, emailVerified: _emailVerified, ...user }: StoredUser): User {
  return user;
}

function startSession(user: StoredUser) {
  localStorage.setItem(SESSION_KEY, user.id);
  // Real backend sets this httpOnly; the mock mimics it so the route proxy works the same.
  setCookie(AUTH_COOKIE_NAME, user.id);
}

function findUser(email: string): StoredUser | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function readAttempts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeAttempts(attempts: Record<string, number>) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

const attemptKey = (purpose: OtpPurpose, email: string) => `${purpose}:${email.toLowerCase()}`;

/** A fresh code was "sent": the wrong-attempt counter starts over. */
function issueCode(purpose: OtpPurpose, email: string) {
  const attempts = readAttempts();
  delete attempts[attemptKey(purpose, email)];
  writeAttempts(attempts);
}

const invalidCode = () =>
  new ApiError("Invalid or expired code", 400, { code: AUTH_ERROR_CODE.invalidCode });

const tooManyAttempts = () =>
  new ApiError("Too many wrong attempts. Request a new code.", 429, {
    code: AUTH_ERROR_CODE.tooManyAttempts,
  });

/** Accepts MOCK_OTP_CODE for an eligible account; 5 wrong tries lock the code until a new one is requested. */
function checkCode(purpose: OtpPurpose, email: string, code: string, eligible: boolean) {
  const key = attemptKey(purpose, email);
  const attempts = readAttempts();
  const used = attempts[key] ?? 0;
  if (used >= MAX_OTP_ATTEMPTS) throw tooManyAttempts();
  if (eligible && code === MOCK_OTP_CODE) {
    delete attempts[key];
    writeAttempts(attempts);
    return;
  }
  attempts[key] = used + 1;
  writeAttempts(attempts);
  if (used + 1 >= MAX_OTP_ATTEMPTS) throw tooManyAttempts();
  throw invalidCode();
}

/** Reads the claims out of a Google ID token without checking it (the mock has no server to ask). */
function readGoogleClaims(credential: string): { email?: string; name?: string; picture?: string } {
  try {
    const part = credential.split(".")[1] ?? "";
    const base64 = part
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(part.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as {
      email?: string;
      name?: string;
      picture?: string;
    };
  } catch {
    return {};
  }
}

export function getMockSessionUser(): User | null {
  const id = localStorage.getItem(SESSION_KEY);
  const user = id ? readUsers().find((u) => u.id === id) : undefined;
  return user ? strip(user) : null;
}

export function updateMockSessionUser(patch: Partial<Omit<User, "id" | "email">>): User {
  const id = localStorage.getItem(SESSION_KEY);
  const current = id ? readUsers().find((u) => u.id === id) : undefined;
  if (!current) throw new ApiError("Not authenticated.", 401);
  const next: StoredUser = { ...current, ...patch };
  // the seeded demo user is read-only in storage; persist an override under a new record
  saveUser(next);
  return strip(next);
}

export const mockAuthApi: AuthApi = {
  async login({ email, password }) {
    await delay(450);
    const user = findUser(email);
    if (!user || user.password !== password) throw new ApiError("Invalid email or password.", 401);
    if (user.emailVerified === false) {
      issueCode("verify", user.email);
      throw new ApiError("Email not verified. We sent you a new code.", 403, {
        code: AUTH_ERROR_CODE.emailNotVerified,
      });
    }
    startSession(user);
    return { user: strip(user) };
  },

  async google(credential) {
    await delay(450);
    const claims = readGoogleClaims(credential);
    const email = (claims.email ?? "google.demo@prepdost.dev").toLowerCase();
    const existing = findUser(email);
    // Same rules as the server: Google proved the address, so an unverified sign-up for it loses its password.
    const user: StoredUser = existing
      ? {
          ...existing,
          emailVerified: true,
          password: existing.emailVerified === false ? "" : existing.password,
        }
      : {
          id: `u_${crypto.randomUUID()}`,
          name: claims.name ?? "Google Demo",
          email,
          password: "", // signs in with Google only; the empty string can never match a typed password
          emailVerified: true,
          avatarUrl: claims.picture ?? null,
          role: "user",
          githubUsername: null,
          leetcodeUsername: null,
        };
    saveUser(user);
    startSession(user);
    return { user: strip(user) };
  },

  async register({ name, email, password }) {
    await delay(550);
    if (findUser(email)) throw new ApiError("Email already registered", 409);
    const user: StoredUser = {
      id: `u_${crypto.randomUUID()}`,
      name,
      email,
      password,
      emailVerified: false,
      avatarUrl: null,
      role: "user",
      githubUsername: null,
      leetcodeUsername: null,
    };
    saveUser(user);
    issueCode("verify", email);
    return { email, requiresVerification: true };
  },

  async verifyEmail({ email, code }) {
    await delay(450);
    const user = findUser(email);
    checkCode("verify", email, code, user?.emailVerified === false);
    if (!user) throw invalidCode(); // unreachable: `checkCode` only returns for an existing account
    const verified: StoredUser = { ...user, emailVerified: true };
    saveUser(verified);
    startSession(verified);
    return { user: strip(verified) };
  },

  async resendVerification(email) {
    await delay(300);
    if (findUser(email)?.emailVerified === false) issueCode("verify", email);
    return { cooldownSeconds: RESEND_COOLDOWN_SECONDS };
  },

  async forgotPassword(email) {
    await delay(450);
    // identical answer whether or not the account exists
    if (findUser(email)) issueCode("reset", email);
    return { cooldownSeconds: RESEND_COOLDOWN_SECONDS };
  },

  async resetPassword({ email, code, newPassword }) {
    await delay(500);
    const strength = passwordSchema.safeParse(newPassword);
    if (!strength.success) {
      throw new ApiError("Validation failed", 400, {
        fieldErrors: { newPassword: strength.error.issues[0]?.message ?? "Invalid password" },
      });
    }
    const user = findUser(email);
    checkCode("reset", email, code, user !== undefined);
    if (!user) throw invalidCode(); // unreachable: `checkCode` only returns for an existing account
    saveUser({ ...user, password: newPassword });
  },

  async me() {
    await delay(150);
    const id = localStorage.getItem(SESSION_KEY);
    const user =
      id && hasCookie(AUTH_COOKIE_NAME) ? readUsers().find((u) => u.id === id) : undefined;
    if (!user) throw new ApiError("Not authenticated.", 401);
    return strip(user);
  },

  async logout() {
    await delay(150);
    localStorage.removeItem(SESSION_KEY);
    deleteCookie(AUTH_COOKIE_NAME);
  },
};
