import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware.js"
import { sendSuccess, sendError } from "../utils/response.utils.js"
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service.js"

export const list = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const notifications = await listNotifications(req.user!.id)
    sendSuccess(res, "Notifications fetched", notifications)
  } catch {
    sendError(res, "Failed to fetch notifications", 500)
  }
}

export const markRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const found = await markNotificationRead(
      req.user!.id,
      req.params.id as string
    )

    if (!found) {
      sendError(res, "Notification not found", 404)
      return
    }

    sendSuccess(res, "Notification marked as read")
  } catch {
    sendError(res, "Failed to update notification", 500)
  }
}

export const markAllRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await markAllNotificationsRead(req.user!.id)
    sendSuccess(res, "All notifications marked as read")
  } catch {
    sendError(res, "Failed to update notifications", 500)
  }
}
