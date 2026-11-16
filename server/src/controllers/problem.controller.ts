import type { Request, Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware.js"
import { sendSuccess, sendError } from "../utils/response.utils.js"
import {
  getAllProblems,
  getProblemBySlug,
  createProblem,
  getProblemStats,
  getCompanies,
  getProblemFiltersSchema,
} from "../services/problem.service.js"

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = getProblemFiltersSchema.parse(req.query)
    const result = await getAllProblems(filters)
    sendSuccess(res, "Problems fetched", result)
  } catch (error) {
    sendError(res, "Failed to fetch problems", 500)
  }
}

export const getBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const problem = await getProblemBySlug(req.params.slug as string) 
    sendSuccess(res, "Problem fetched", problem)
  } catch (error) {
    sendError(res, "Problem not found", 404)
  }
}

export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const problem = await createProblem(req.body)
    sendSuccess(res, "Problem created", problem, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create"
    sendError(res, message, 400)
  }
}

export const stats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getProblemStats()
    sendSuccess(res, "Stats fetched", result)
  } catch {
    sendError(res, "Failed to fetch stats", 500)
  }
}
export const companies = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getCompanies()
    sendSuccess(res, "Companies fetched", result)
  } catch {
    sendError(res, "Failed to fetch companies", 500)
  }
}
