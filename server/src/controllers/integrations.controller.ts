import type { Response } from "express"
import type { AuthRequest } from "../middlewares/auth.middleware.js"
import { UserModel } from "../models/user.model.js"
import { sendSuccess, sendError } from "../utils/response.utils.js"
import {
  getGithubActivity,
  getLeetcodeActivity,
  IntegrationError,
} from "../services/integrations.service.js"

export const integrationActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const provider = req.params.provider

  if (provider !== "github" && provider !== "leetcode") {
    sendError(res, "Unknown integration", 404)
    return
  }

  try {
    const user = await UserModel.findById(req.user!.id).select(
      "githubUsername leetcodeUsername"
    )

    const username =
      provider === "github" ? user?.githubUsername : user?.leetcodeUsername

    if (!username) {
      sendError(
        res,
        `${provider === "github" ? "GitHub" : "LeetCode"} account is not linked`,
        400
      )
      return
    }

    const activity =
      provider === "github"
        ? await getGithubActivity(username)
        : await getLeetcodeActivity(username)

    sendSuccess(res, "Activity fetched", activity)
  } catch (error) {
    if (error instanceof IntegrationError) {
      sendError(res, error.message, error.statusCode)
      return
    }
    sendError(res, "Failed to fetch activity", 500)
  }
}
