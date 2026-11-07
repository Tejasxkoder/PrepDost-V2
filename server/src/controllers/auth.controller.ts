import type { Request, Response } from "express"
import type { ZodError } from "zod"
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  logoutUser,
  getUserProfile,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  emailSchema,
  resetPasswordSchema,
} from "../services/auth.service.js"
import { sendSuccess, sendError } from "../utils/response.utils.js"
import { HttpError } from "../utils/http-error.js"
import { logger } from "../utils/logger.js"
import type { AuthRequest } from "../middlewares/auth.middleware.js"

const fieldErrors = (error: ZodError): Record<string, string> =>
  error.issues.reduce(
    (acc, issue) => {
      acc[issue.path[0] as string] = issue.message
      return acc
    },
    {} as Record<string, string>
  )

const fail = (res: Response, error: unknown, scope: string, fallback: string): void => {
  if (error instanceof HttpError) {
    sendError(res, error.message, error.status, undefined, error.code)
    return
  }
  logger.error(scope, fallback, {
    error: error instanceof Error ? error.message : String(error),
  })
  sendError(res, fallback, 500)
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400, fieldErrors(validation.error))
      return
    }

    const result = await registerUser(validation.data)

    sendSuccess(
      res,
      "Account created. Check your email for a 6-digit verification code.",
      result,
      201
    )
  } catch (error) {
    fail(res, error, "auth.register", "Registration failed")
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400)
      return
    }

    const { user, token } = await loginUser(validation.data)

    sendSuccess(res, "Login successful", { user, token })
  } catch (error) {
    fail(res, error, "auth.login", "Login failed")
  }
}

export const verifyEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = verifyEmailSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400, fieldErrors(validation.error))
      return
    }

    const { user, token } = await verifyEmail(
      validation.data.email,
      validation.data.code
    )

    sendSuccess(res, "Email verified", { user, token })
  } catch (error) {
    fail(res, error, "auth.verify", "Could not verify email")
  }
}

export const resendVerificationHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = emailSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400, fieldErrors(validation.error))
      return
    }

    const result = await resendVerification(validation.data.email)

    sendSuccess(
      res,
      "If this account needs verification, a new code has been sent.",
      result
    )
  } catch (error) {
    fail(res, error, "auth.resend", "Could not send a new code")
  }
}

export const forgotPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = emailSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400, fieldErrors(validation.error))
      return
    }

    const result = await forgotPassword(validation.data.email)

    sendSuccess(
      res,
      "If an account exists for this email, a reset code has been sent.",
      result
    )
  } catch (error) {
    fail(res, error, "auth.forgot", "Could not start password reset")
  }
}

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400, fieldErrors(validation.error))
      return
    }

    await resetPassword(
      validation.data.email,
      validation.data.code,
      validation.data.newPassword
    )

    sendSuccess(res, "Password updated. Log in with your new password.")
  } catch (error) {
    fail(res, error, "auth.reset", "Could not reset password")
  }
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getUserProfile(req.user!.id)
    sendSuccess(res, "Profile fetched", user)
  } catch (error) {
    sendError(res, "User not found", 404)
  }
}

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await logoutUser(req.user?.jti, req.user?.exp)
    sendSuccess(res, "Logged out successfully")
  } catch (error) {
    fail(res, error, "auth.logout", "Could not log out")
  }
}
