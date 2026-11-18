import { z } from "zod";
import { userSchema } from "@/features/user/schemas";

/** Seconds the UI waits before it lets the user ask for another code (server may override). */
export const RESEND_COOLDOWN_SECONDS = 60;
export const OTP_LENGTH = 6;

const emailSchema = z.email("Enter a valid email address");

/** Same rules as the backend (8+ chars, one uppercase letter, one number). */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: emailSchema,
  password: passwordSchema,
  terms: z.boolean().refine((v) => v, "You must accept the terms to continue"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const otpCodeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const verifyEmailSchema = z.object({ code: otpCodeSchema });
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  code: otpCodeSchema,
  newPassword: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** 0–4 strength meter (prototype scoring). Validity is enforced by `passwordSchema`. */
export function passwordStrength(value: string): 0 | 1 | 2 | 3 | 4 {
  if (!value) return 0;
  const score =
    Number(value.length >= 8) +
    Number(/\d/.test(value)) +
    Number(/[^A-Za-z0-9]/.test(value)) +
    Number(value.length >= 12 || (/[a-z]/.test(value) && /[A-Z]/.test(value)));
  return score as 0 | 1 | 2 | 3 | 4;
}

export const authSessionSchema = z.object({ user: userSchema });
export type AuthSession = z.infer<typeof authSessionSchema>;

/** `POST /auth/register` — no user and no session until the email code is confirmed. */
export const registerResultSchema = z.object({
  email: z.string(),
  requiresVerification: z.boolean(),
});
export type RegisterResult = z.infer<typeof registerResultSchema>;

/** `POST /auth/resend-verification` and `/auth/forgot-password`. Falls back to the default cooldown. */
export const cooldownSchema = z.object({
  cooldownSeconds: z.number().int().positive().catch(RESEND_COOLDOWN_SECONDS),
});
export type CooldownResult = z.infer<typeof cooldownSchema>;
