import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware.js"
import { sendSuccess, sendError } from "../utils/response.utils.js"
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  updateProfileSchema,
  changePasswordSchema,
} from "../services/user.service.js"
import { getUserStats } from "../services/stats.service.js"
import { ActivityModel } from "../models/activity.model.js"

export const profile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await getProfile(req.user!.id)
    sendSuccess(res, "Profile fetched", user)
  } catch (error) {
    sendError(res, "User not found", 404)
  }
}

export const updateProfileHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation = updateProfileSchema.safeParse(req.body)
    if (!validation.success) {
      const errors = validation.error.issues.reduce(
        (acc, issue) => {
          acc[issue.path[0] as string] = issue.message
          return acc
        },
        {} as Record<string, string>
      )
      sendError(res, "Validation failed", 400, errors)
      return
    }

    const user = await updateProfile(req.user!.id, validation.data)
    sendSuccess(res, "Profile updated", user)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed"
    sendError(res, message, 500)
  }
}

export const changePasswordHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation = changePasswordSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400)
      return
    }

    const { token } = await changePassword(
      req.user!.id,
      validation.data.currentPassword,
      validation.data.newPassword
    )
    
    sendSuccess(res, "Password changed successfully", { token })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed"
    const statusCode = message.includes("incorrect") ? 400 : 500
    sendError(res, message, statusCode)
  }
}

export const stats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userStats = await getUserStats(req.user!.id)
    sendSuccess(res, "Stats fetched", userStats)
  } catch (error) {
    sendError(res, "Failed to fetch stats", 500)
  }
}

export const activity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const activities = await ActivityModel.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(20)
    sendSuccess(res, "Activity fetched", activities)
  } catch {
    sendError(res, "Failed to fetch activity", 500)
  }
}

export const deleteAccountHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await deleteAccount(req.user!.id, {
      jti: req.user!.jti,
      exp: req.user!.exp,
    })
    sendSuccess(res, "Account deleted successfully")
  } catch (error) {
    sendError(res, "Failed to delete account", 500)
  }
}