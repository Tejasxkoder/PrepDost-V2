import type { Request, Response, NextFunction } from "express"
import { UserModel } from "../models/user.model.js"
import { verifyToken, type JWTPayload } from "../utils/jwt.utils.js"
import { sendError } from "../utils/response.utils.js"
import { isTokenRevoked } from "../services/token.service.js"

export interface AuthRequest extends Request {
  user?: JWTPayload & {
    _id: string
     id: string
  }
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
      sendError(res, "Authentication required", 401)
      return
    }

    const token = authHeader.split(" ")[1]

    const decoded = verifyToken(token)

    // Logged out or deleted: the token is still signed and unexpired, but blocked.
    if (await isTokenRevoked(decoded.jti)) {
      sendError(res, "Session expired. Please log in again.", 401)
      return
    }

    const user = await UserModel.findById(decoded.id).select("-password")

    if (!user) {
      sendError(res, "User not found", 401)
      return
    }

    // Password changed or reset after this token was issued.
    if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) {
      sendError(res, "Session expired. Please log in again.", 401)
      return
    }

    if (!user.isActive) {
      sendError(res, "Account is deactivated", 403)
      return
    }

    if (user.emailVerified === false) {
      sendError(res, "Please verify your email to continue", 403, undefined, "EMAIL_NOT_VERIFIED")
      return
    }

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      jti: decoded.jti,
      exp: decoded.exp,
    }

    next()
  } catch {
    sendError(res, "Invalid or expired token", 401)
  }
}

export const restrictTo = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401)
      return
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, "Permission denied", 403)
      return
    }

    next()
  }
}
