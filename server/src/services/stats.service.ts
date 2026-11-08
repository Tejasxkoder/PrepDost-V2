import mongoose from "mongoose"
import { InterviewModel } from "../models/interview.model.js"
import { SubmissionModel } from "../models/submission.model.js"
import { ActivityModel, ActivityType } from "../models/activity.model.js"
import { createNotification } from "./notification.service.js"

export const getUserStats = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId)

  const [
    interviewStats,
    dsaStats,
    recentActivity,
    streakData,
  ] = await Promise.all([
    getInterviewStats(userObjectId),
    getDSAStats(userObjectId),
    getRecentActivity(userId),
    calculateStreak(userId),
  ])

  return {
    interviews: interviewStats,
    dsa: dsaStats,
    streak: streakData,
    recentActivity,
  }
}

const getInterviewStats = async (userId: mongoose.Types.ObjectId) => {
  const stats = await InterviewModel.aggregate([
    { $match: { user: userId } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
            },
          },
        ],
        byType: [
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ],
        avgScore: [
          { $match: { status: "completed" } },
          {
            $group: {
              _id: null,
              avg: { $avg: "$feedback.overallScore" },
            },
          },
        ],

        bestScore: [
          { $match: { status: "completed" } },
          { $sort: { "feedback.overallScore": -1 } },
          { $limit: 1 },
          {
            $project: {
              score: "$feedback.overallScore",
              type: 1,
              company: 1,
            },
          },
        ],
      },
    },
  ])

  const result = stats[0]
  const totals = result.totals[0] || { total: 0, completed: 0 }
  const avgScore = result.avgScore[0]?.avg || 0

  const byType = result.byType.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count
      return acc
    },
    {}
  )

  return {
    total: totals.total,
    completed: totals.completed,
    averageScore: Math.round(avgScore),
    bestScore: result.bestScore[0] || null,
    byType,
  }
}

const getDSAStats = async (userId: mongoose.Types.ObjectId) => {
  const stats = await SubmissionModel.aggregate([
    { $match: { user: userId } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              accepted: {
                $sum: {
                  $cond: [{ $eq: ["$status", "accepted"] }, 1, 0],
                },
              },
            },
          },
        ],
        uniqueSolved: [
          { $match: { status: "accepted" } },
          { $group: { _id: "$problem" } },
          { $count: "count" },
        ],
        byLanguage: [
          { $group: { _id: "$language", count: { $sum: 1 } } },
        ],
        recentAccepted: [
          { $match: { status: "accepted" } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "problems",
              localField: "problem",
              foreignField: "_id",
              as: "problemData",
            },
          },
          { $unwind: "$problemData" },
          {
            $project: {
              title: "$problemData.title",
              slug: "$problemData.slug",
              difficulty: "$problemData.difficulty",
              language: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ])

  const result = stats[0]
  const totals = result.totals[0] || { total: 0, accepted: 0 }
  const uniqueSolved = result.uniqueSolved[0]?.count || 0

  const byLanguage = result.byLanguage.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count
      return acc
    },
    {}
  )

  const acceptanceRate =
    totals.total > 0
      ? Math.round((totals.accepted / totals.total) * 100)
      : 0

  return {
    totalSubmissions: totals.total,
    totalAccepted: totals.accepted,
    uniqueProblemsSolved: uniqueSolved,
    acceptanceRate,
    byLanguage,
    recentSolved: result.recentAccepted,
  }
}

const getRecentActivity = async (userId: string) => {
  return ActivityModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
}

const calculateStreak = async (userId: string) => {
  // Get all activity dates
  const activities = await ActivityModel.find({
    user: userId,
    type: { $in: ["interview_completed", "problem_solved"] },
  })
    .sort({ createdAt: -1 })
    .select("createdAt")

  if (activities.length === 0) {
    return { current: 0, longest: 0, lastActive: null }
  }

  const uniqueDates = [
    ...new Set(
      activities.map((a) =>
        a.createdAt.toISOString().split("T")[0]
      )
    ),
  ].sort((a, b) => b.localeCompare(a))

  let currentStreak = 0
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0]

  let checkDate =
    uniqueDates[0] === today || uniqueDates[0] === yesterday
      ? uniqueDates[0]
      : null

  if (checkDate) {
    for (const date of uniqueDates) {
      if (date === checkDate) {
        currentStreak++
        const prevDate : string = new Date(
          new Date(checkDate).getTime() - 86400000
        )
          .toISOString()
          .split("T")[0]
        checkDate = prevDate
      } else {
        break
      }
    }
  }

  let longestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i])
    const prev = new Date(uniqueDates[i - 1])
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / 86400000
    )

    if (diffDays === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak)

  return {
    current: currentStreak,
    longest: longestStreak,
    lastActive: activities[0]?.createdAt || null,
  }
}

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100]

export const logActivity = async (
  userId: string,
  type: ActivityType,
  metadata: Record<string, any>
) => {
  await ActivityModel.create({ user: userId, type, metadata })
  // A notification problem must never fail the request that already saved the interview/submission.
  try {
    await notifyFromActivity(userId, type, metadata)
  } catch (error) {
    console.error("Failed to create notifications:", error)
  }
}

const notifyFromActivity = async (
  userId: string,
  type: ActivityType,
  metadata: Record<string, any>
) => {
  if (type === "interview_completed") {
    const target = metadata.company ? `${metadata.company} ` : ""
    await createNotification({
      userId,
      kind: "review",
      title: "Interview reviewed",
      body: `Your ${target}interview AI feedback is ready`,
      href: metadata.interviewId
        ? `/interviews/${metadata.interviewId}`
        : "/interviews",
      dedupeKey: metadata.interviewId
        ? `review-${metadata.interviewId}`
        : undefined,
    })
  }

  if (type === "problem_solved") {
    await createNotification({
      userId,
      kind: "dsa",
      title: "Problem solved",
      body: `You solved ${metadata.problemTitle ?? "a problem"}. Keep going!`,
      href: "/dsa",
    })
  }

  if (type === "interview_completed" || type === "problem_solved") {
    const { current } = await calculateStreak(userId)
    if (STREAK_MILESTONES.includes(current)) {
      await createNotification({
        userId,
        kind: "streak",
        title: "Streak milestone",
        body: `${current} day streak achieved`,
        href: "/dashboard",
        dedupeKey: `streak-${current}-${new Date().toISOString().slice(0, 10)}`,
      })
    }
  }
}