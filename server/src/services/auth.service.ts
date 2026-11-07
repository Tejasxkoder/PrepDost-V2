import { z } from "zod"
import { UserModel } from "../models/user.model.js"
import {
  hashPassword,
  comparePassword,
} from "../utils/hash.utils.js"
import {
  generateToken,
} from "../utils/jwt.utils.js"
import { HttpError } from "../utils/http-error.js"
import { logger } from "../utils/logger.js"
import {
  clearOtps,
  hasLiveOtp,
  sendOtp,
  sendOtpInBackground,
  verifyOtp,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "./otp.service.js"
import { revokeToken } from "./token.service.js"

const emailField = z
  .string()
  .email()
  .toLowerCase()

const passwordRules = z
  .string()
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)

export const registerSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100),

  email: emailField,

  password: passwordRules,
})

export const loginSchema = z.object({
  email: emailField,

  password: z
    .string()
    .min(1),
})

export const emailSchema = z.object({
  email: emailField,
})

export const verifyEmailSchema = z.object({
  email: emailField,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
})

export const resetPasswordSchema = z.object({
  email: emailField,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
  newPassword: passwordRules,
})

export type RegisterInput =
  z.infer<typeof registerSchema>

export type LoginInput =
  z.infer<typeof loginSchema>

const issueSession = (user: {
  _id: { toString(): string }
  email: string
  role: string
  tokenVersion?: number
}) =>
  generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    tv: user.tokenVersion ?? 0,
  })

const checkToHttpError = (result: "invalid" | "locked"): HttpError =>
  result === "locked"
    ? new HttpError(
        "Too many wrong attempts. Request a new code.",
        429,
        "TOO_MANY_ATTEMPTS"
      )
    : new HttpError("Invalid or expired code", 400, "INVALID_CODE")

export const registerUser = async (
  input: RegisterInput
) => {
  const existingUser =
    await UserModel.findOne({
      email: input.email,
    })

  const hashedPassword =
    await hashPassword(
      input.password
    )

  if (existingUser) {
    if (existingUser.emailVerified !== false) {
      throw new HttpError("Email already registered", 409)
    }

    if (await hasLiveOtp(input.email, "verify")) {
      throw new HttpError(
        "A verification code was already sent to this email. Enter it, or try again in a few minutes.",
        409
      )
    }

    existingUser.name = input.name
    existingUser.password = hashedPassword
    await existingUser.save()
  } else {
    await UserModel.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      emailVerified: false,
    })
  }

  try {
    await sendOtp(input.email, "verify")
  } catch (error) {
    logger.error("auth.register", "Verification email failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    throw new HttpError(
      "We couldn't send the verification email. Please try again in a moment.",
      502
    )
  }

  return {
    email: input.email,
    requiresVerification: true as const,
  }
}

export const loginUser = async (
  input: LoginInput
) => {
  const user =
    await UserModel.findOne({
      email: input.email,
    }).select("+password")

  if (!user || !user.password) {
    throw new HttpError(
      "Invalid email or password",
      401
    )
  }

  const isMatch =
    await comparePassword(
      input.password,
      user.password
    )

  if (!isMatch) {
    throw new HttpError(
      "Invalid email or password",
      401
    )
  }

  if (!user.isActive) {
    throw new HttpError(
      "Account is deactivated",
      401
    )
  }

  if (user.emailVerified === false) {
    sendOtpInBackground(user.email, "verify")
    throw new HttpError(
      "Please verify your email to continue",
      403,
      "EMAIL_NOT_VERIFIED"
    )
  }

  user.lastLoginAt = new Date()
  await user.save()

  return {
    user: user.toJSON(),
    token: issueSession(user),
  }
}

export const verifyEmail = async (
  email: string,
  code: string
) => {
  const check = await verifyOtp(email, "verify", code)
  if (check !== "ok") throw checkToHttpError(check)

  const user = await UserModel.findOne({ email })
  if (!user) throw new HttpError("Invalid or expired code", 400, "INVALID_CODE")
  if (!user.isActive) throw new HttpError("Account is deactivated", 403)

  user.emailVerified = true
  user.lastLoginAt = new Date()
  await user.save()

  return {
    user: user.toJSON(),
    token: issueSession(user),
  }
}

export const resendVerification = async (
  email: string
) => {
  const user = await UserModel.findOne({ email })

  if (user && user.isActive && user.emailVerified === false) {
    sendOtpInBackground(email, "verify")
  }

  return { cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS }
}

export const forgotPassword = async (
  email: string
) => {
  const user = await UserModel.findOne({ email })

  if (user && user.isActive) {
    sendOtpInBackground(email, "reset")
  }

  return { cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS }
}

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const check = await verifyOtp(email, "reset", code)
  if (check !== "ok") throw checkToHttpError(check)

  const user = await UserModel.findOne({ email })
  if (!user || !user.isActive) {
    throw new HttpError("Invalid or expired code", 400, "INVALID_CODE")
  }

  user.password = await hashPassword(newPassword)
  user.emailVerified = true
  user.tokenVersion = (user.tokenVersion ?? 0) + 1
  await user.save()

  await clearOtps(email)
}

export const logoutUser = async (
  jti: string | undefined,
  exp: number | undefined
) => {
  await revokeToken(jti, exp)
}

export const getUserProfile = async (
  userId: string
) => {
  const user =
    await UserModel.findById(userId).select(
      "-password"
    )

  if (!user) {
    throw new Error("User not found")
  }

  return user
}
