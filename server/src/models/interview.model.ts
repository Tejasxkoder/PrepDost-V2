import mongoose, { Document, Schema } from "mongoose"

export type InterviewType =
  | "behavioral"
  | "technical"
  | "dsa"
  | "system-design"

export type Difficulty = "easy" | "medium" | "hard"

export type InterviewStatus =
  | "in-progress"
  | "completed"
  | "abandoned"

export interface IMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface IFeedback {
  overallScore: number
  communicationScore: number
  technicalScore: number
  problemSolvingScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  summary: string
}

export interface IInterview extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  type: InterviewType
  company: string
  difficulty: Difficulty
  status: InterviewStatus
  messages: IMessage[]
  feedback?: IFeedback
  totalMessages: number
  durationMinutes?: number
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const feedbackSchema = new Schema<IFeedback>(
  {
    overallScore: { type: Number, min: 0, max: 100 },
    communicationScore: { type: Number, min: 0, max: 100 },
    technicalScore: { type: Number, min: 0, max: 100 },
    problemSolvingScore: { type: Number, min: 0, max: 100 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    summary: { type: String },
  },
  { _id: false }
)

const interviewSchema = new Schema<IInterview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["behavioral", "technical", "dsa", "system-design"],
      required: [true, "Interview type is required"],
    },
    company: {
      type: String,
      trim: true,
      default: "General",
      maxlength: [100, "Company name too long"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    feedback: {
      type: feedbackSchema,
      default: null,
    },
    totalMessages: {
      type: Number,
      default: 0,
    },
    durationMinutes: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

interviewSchema.index({ user: 1, createdAt: -1 })
interviewSchema.index({ user: 1, status: 1 })
interviewSchema.index({ user: 1, type: 1 })

export const InterviewModel = mongoose.model<IInterview>(
  "Interview",
  interviewSchema
)