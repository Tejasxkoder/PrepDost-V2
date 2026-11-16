import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware.js"
import { sendSuccess, sendError } from "../utils/response.utils.js"
import { z } from "zod"
import {
  createInterview,
  sendMessage,
  getUserInterviews,
  getInterviewById,
  deleteInterview,
  abandonInterview,
} from "../services/interview.service.js"

const createInterviewSchema = z.object({
  type: z.enum([
    "behavioral",
    "technical",
    "dsa",
    "system-design",
  ], {
    message: "Interview type is required"
  }),
  company: z.string().max(100).optional().default("General"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
})

const chatSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"),
})

export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation = createInterviewSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400)
      return
    }

    const result = await createInterview({
      userId: req.user!.id,
      ...validation.data,
    })

    sendSuccess(res, "Interview started", result, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create interview"
    sendError(res, message, 500)
  }
}

export const chat = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation = chatSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Message is required", 400)
      return
    }

    const result = await sendMessage(
      req.params.id as string,
      req.user!.id,
      validation.data.message
    )

    sendSuccess(res, "Message sent", result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message"
    const statusCode = message.includes("not found") ? 404 : 500
    sendError(res, message, statusCode)
  }
}

export const getAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const interviews = await getUserInterviews(req.user!.id)
    sendSuccess(res, "Interviews fetched", interviews)
  } catch (error) {
    sendError(res, "Failed to fetch interviews", 500)
  }
}

export const getOne = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const interview = await getInterviewById(req.params.id as string, req.user!.id)
    sendSuccess(res, "Interview fetched", interview)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not found"
    sendError(res, message, 404)
  }
}

export const remove = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await deleteInterview(req.params.id as string, req.user!.id)
    sendSuccess(res, "Interview deleted")
  } catch (error) {
    sendError(res, "Interview not found", 404)
  }
}

export const abandon = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await abandonInterview(req.params.id as string, req.user!.id)
    sendSuccess(res, "Interview abandoned")
  } catch (error) {
    sendError(res, "Interview not found", 404)
  }
}