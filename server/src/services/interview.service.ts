import { InterviewModel, type IInterview } from "../models/interview.model.js"
import {
  getInterviewResponse,
  generateFeedback,
  MAX_INTERVIEW_MESSAGES,
} from "./ai.service.js"
import type { InterviewType, Difficulty } from "../models/interview.model.js"
import { logActivity } from "./stats.service.js"

interface CreateInterviewInput {
  userId: string
  type: InterviewType
  company?: string
  difficulty?: Difficulty
}

export const createInterview = async (input: CreateInterviewInput) => {
  const interview = await InterviewModel.create({
    user: input.userId,
    type: input.type,
    company: input.company || "General",
    difficulty: input.difficulty || "medium",
    messages: [],
  })

  const aiResponse = await getInterviewResponse(
    interview.type,
    interview.company,
    interview.difficulty,
    []
  )

  interview.messages.push({
    role: "assistant",
    content: aiResponse.message,
    timestamp: new Date(),
  })
  interview.totalMessages = 1
  await interview.save()

  await logActivity(input.userId, "interview_started", {
    interviewId: interview._id.toString(),
    interviewType: input.type,
    company: input.company,
  })
  return {
    interviewId: interview._id,
    message: aiResponse.message,
    type: interview.type,
    company: interview.company,
    difficulty: interview.difficulty,
  }

}

export const sendMessage = async (
  interviewId: string,
  userId: string,
  userMessage: string
) => {
  const interview = await InterviewModel.findOne({
    _id: interviewId,
    user: userId,
  })

  if (!interview) throw new Error("Interview not found")
  if (interview.status === "completed") throw new Error("Interview already completed")
  if (interview.status === "abandoned") throw new Error("Interview was abandoned")

  interview.messages.push({
    role: "user",
    content: userMessage.trim(),
    timestamp: new Date(),
  })

  const aiResponse = await getInterviewResponse(
    interview.type,
    interview.company,
    interview.difficulty,
    interview.messages
  )

  interview.messages.push({
    role: "assistant",
    content: aiResponse.message,
    timestamp: new Date(),
  })

  interview.totalMessages = interview.messages.length

  const isComplete =
    aiResponse.isComplete ||
    interview.messages.length >= MAX_INTERVIEW_MESSAGES

  let feedback = null

  if (isComplete) {

    feedback = await generateFeedback(
      interview.messages,
      interview.type,
      interview.company
    )

    interview.feedback = feedback
    interview.status = "completed"

    const start = interview.createdAt.getTime()
    const end = Date.now()
    interview.durationMinutes = Math.round((end - start) / 60000)
  }

  await interview.save()
  if (isComplete) {
    await logActivity(userId, "interview_completed", {
      interviewId,
      interviewType: interview.type,
      company: interview.company,
      score: feedback?.overallScore,
    })
  }

  return {
    message: aiResponse.message,
    isComplete,
    feedback: isComplete ? feedback : null,
  }
}

export const getUserInterviews = async (userId: string) => {
  return InterviewModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("-messages")
}

export const getInterviewById = async (
  interviewId: string,
  userId: string
) => {
  const interview = await InterviewModel.findOne({
    _id: interviewId,
    user: userId,
  })

  if (!interview) throw new Error("Interview not found")
  return interview
}

export const deleteInterview = async (
  interviewId: string,
  userId: string
) => {
  const interview = await InterviewModel.findOneAndDelete({
    _id: interviewId,
    user: userId,
  })

  if (!interview) throw new Error("Interview not found")
  return interview
}

export const abandonInterview = async (
  interviewId: string,
  userId: string
) => {
  const interview = await InterviewModel.findOneAndUpdate(
    { _id: interviewId, user: userId, status: "in-progress" },
    { status: "abandoned" },
    { returnDocument: "after" }
  )

  if (!interview) throw new Error("Interview not found")
  return interview
}
