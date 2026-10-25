import mongoose, { Document, Schema } from "mongoose"

export type ActivityType =
  | "interview_completed"
  | "interview_started"
  | "problem_solved"
  | "problem_attempted"

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  type: ActivityType
  metadata: {
    interviewId?: string
    interviewType?: string
    company?: string
    score?: number
    problemId?: string
    problemTitle?: string
    difficulty?: string
    language?: string
  }
  createdAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "interview_completed",
        "interview_started",
        "problem_solved",
        "problem_attempted",
      ],
      required: true,
    },
    metadata: {
      interviewId: String,
      interviewType: String,
      company: String,
      score: Number,
      problemId: String,
      problemTitle: String,
      difficulty: String,
      language: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

activitySchema.index({ user: 1, createdAt: -1 })
activitySchema.index({ user: 1, type: 1 })

export const ActivityModel = mongoose.model<IActivity>(
  "Activity",
  activitySchema
)