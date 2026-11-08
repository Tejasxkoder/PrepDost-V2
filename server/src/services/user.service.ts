import { z } from "zod"
import { UserModel } from "../models/user.model.js"
import { InterviewModel } from "../models/interview.model.js"
import { SubmissionModel } from "../models/submission.model.js"
import { ActivityModel } from "../models/activity.model.js"
import { NotificationModel } from "../models/notification.model.js"
import { hashPassword, comparePassword } from "../utils/hash.utils.js"
import { generateToken } from "../utils/jwt.utils.js"
import { clearOtps } from "./otp.service.js"
import { revokeToken } from "./token.service.js"
import {
  GITHUB_USERNAME_RE,
  LEETCODE_USERNAME_RE,
} from "./integrations.service.js"

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  githubUsername: z
    .string()
    .trim()
    .regex(GITHUB_USERNAME_RE, "Enter a valid GitHub username")
    .optional()
    .nullable(),
  leetcodeUsername: z
    .string()
    .trim()
    .regex(LEETCODE_USERNAME_RE, "Enter a valid LeetCode username")
    .optional()
    .nullable(),
  avatar: z.string().url("Invalid URL").optional().nullable(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Need uppercase")
    .regex(/[0-9]/, "Need number"),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const getProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password")
  if (!user) throw new Error("User not found")
  return user
}

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: input },
    { returnDocument: "after", runValidators: true }
  ).select("-password")

  if (!user) throw new Error("User not found")
  return user
}

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await UserModel.findById(userId).select("+password")
  if (!user || !user.password) throw new Error("User not found")

  const isMatch = await comparePassword(currentPassword, user.password)
  if (!isMatch) throw new Error("Current password is incorrect")

  user.password = await hashPassword(newPassword)
  user.tokenVersion = (user.tokenVersion ?? 0) + 1
  await user.save()

  return {
    token: generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
    }),
  }
}


export const deleteAccount = async (
  userId: string,
  session?: { jti?: string; exp?: number }
) => {
  const user = await UserModel.findById(userId).select("email")
  if (!user) return

  await Promise.all([
    InterviewModel.deleteMany({ user: userId }),
    SubmissionModel.deleteMany({ user: userId }),
    ActivityModel.deleteMany({ user: userId }),
    NotificationModel.deleteMany({ user: userId }),
    clearOtps(user.email),
  ])

  await UserModel.deleteOne({ _id: userId })

  await revokeToken(session?.jti, session?.exp)
}