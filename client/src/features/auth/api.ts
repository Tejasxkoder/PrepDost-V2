import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { mockAuthApi } from "@/mocks/auth.mock";
import type { User } from "@/features/user/schemas";
import {
  authSessionSchema,
  cooldownSchema,
  registerResultSchema,
  type AuthSession,
  type CooldownResult,
  type LoginInput,
  type RegisterResult,
  type SignupInput,
} from "./schemas";

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthApi {
  login(input: LoginInput): Promise<AuthSession>;
  /** Signs in (or up) with the ID token Google Identity Services returns; the server verifies it. */
  google(credential: string): Promise<AuthSession>;
  /** Creates an unverified account; the user only gets a session after `verifyEmail`. */
  register(input: Omit<SignupInput, "terms">): Promise<RegisterResult>;
  /** Confirms the emailed code and signs the user in. */
  verifyEmail(input: VerifyEmailRequest): Promise<AuthSession>;
  resendVerification(email: string): Promise<CooldownResult>;
  forgotPassword(email: string): Promise<CooldownResult>;
  resetPassword(input: ResetPasswordRequest): Promise<void>;
  me(signal?: AbortSignal): Promise<User>;
  logout(): Promise<void>;
}

// The backend is expected to set/clear an httpOnly session cookie on these routes.
const httpAuthApi: AuthApi = {
  login: (input) => apiClient.post("/auth/login", input, { schema: authSessionSchema }),
  google: (credential) =>
    apiClient.post("/auth/google", { credential }, { schema: authSessionSchema }),
  register: (input) => apiClient.post("/auth/register", input, { schema: registerResultSchema }),
  verifyEmail: (input) =>
    apiClient.post("/auth/verify-email", input, { schema: authSessionSchema }),
  resendVerification: (email) =>
    apiClient.post("/auth/resend-verification", { email }, { schema: cooldownSchema }),
  forgotPassword: (email) =>
    apiClient.post("/auth/forgot-password", { email }, { schema: cooldownSchema }),
  resetPassword: async (input) => {
    await apiClient.post("/auth/reset-password", input);
  },
  me: async (signal) =>
    (await apiClient.get("/auth/me", { schema: authSessionSchema, signal })).user,
  logout: () => apiClient.post<void>("/auth/logout"),
};

export const authApi: AuthApi = env.NEXT_PUBLIC_USE_MOCKS ? mockAuthApi : httpAuthApi;
