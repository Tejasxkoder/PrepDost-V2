import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware.js"
import { sendSuccess, sendError } from "../utils/response.utils.js"
import { z } from "zod"
import {
  submitCode,
  runSamples,
  getUserSubmissions,
  getSubmissionById,
} from "../services/submission.service.js"

const submitSchema = z.object({
  problemId: z.string().min(1, "Problem ID required"),
  code: z.string().min(1, "Code required").max(50000, "Code too long"),
  language: z.enum(["javascript", "python", "java", "cpp"]),
})

export const submit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation = submitSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400)
      return
    }

    const { problemId, code, language } = validation.data
    const result = await submitCode(req.user!.id, problemId, code, language)

    sendSuccess(res, "Code submitted", result, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed"
    sendError(res, message, 500)
  }
}

export const mySubmissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { problemId } = req.query
    const submissions = await getUserSubmissions(
      req.user!.id,
      problemId as string | undefined
    )
    sendSuccess(res, "Submissions fetched", submissions)
  } catch {
    sendError(res, "Failed to fetch submissions", 500)
  }
}

export const getOne = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const submission = await getSubmissionById(req.params.id as string, req.user!.id)
    sendSuccess(res, "Submission fetched", submission)
  } catch (error) {
    sendError(res, "Submission not found", 404)
  }
}
export const run = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation = submitSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, "Validation failed", 400)
      return
    }
    const { problemId, code, language } = validation.data
    const result = await runSamples(problemId, code, language)
    sendSuccess(res, "Run complete", result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Run failed"
    sendError(res, message, message === "Problem not found" ? 404 : 500)
  }
}
