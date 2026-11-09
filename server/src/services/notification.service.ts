import mongoose from "mongoose"
import {
  NotificationModel,
  type INotification,
  type NotificationKind,
} from "../models/notification.model.js"

const LIST_LIMIT = 30

export interface NotificationDTO {
  id: string
  kind: NotificationKind
  title: string
  body: string
  href?: string
  read: boolean
  createdAt: string
}

const toDTO = (n: INotification): NotificationDTO => ({
  id: n._id.toString(),
  kind: n.kind,
  title: n.title,
  body: n.body,
  ...(n.href ? { href: n.href } : {}),
  read: n.read,
  createdAt: n.createdAt.toISOString(),
})

export const listNotifications = async (
  userId: string
): Promise<NotificationDTO[]> => {
  const items = await NotificationModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT)

  return items.map(toDTO)
}

export const markNotificationRead = async (
  userId: string,
  id: string
): Promise<boolean> => {
  if (!mongoose.isValidObjectId(id)) return false

  const result = await NotificationModel.updateOne(
    { _id: id, user: userId },
    { $set: { read: true } }
  )
  return result.matchedCount > 0
}

export const markAllNotificationsRead = async (
  userId: string
): Promise<void> => {
  await NotificationModel.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  )
}

interface CreateNotificationInput {
  userId: string
  kind: NotificationKind
  title: string
  body: string
  href?: string
  dedupeKey?: string
}

export const createNotification = async (
  input: CreateNotificationInput
): Promise<void> => {
  try {
    await NotificationModel.create({
      user: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      href: input.href,
      dedupeKey: input.dedupeKey,
    })
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) {
      console.error("Failed to create notification:", error)
    }
  }
}
