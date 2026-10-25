
import mongoose, { Document, Schema } from "mongoose";

export type Language = "javascript" | "python" | "java" | "cpp";

export type SubmissionStatus =
  | "pending"
  | "accepted"
  | "wrong-answer"
  | "time-limit-exceeded"
  | "runtime-error"
  | "compilation-error";

export interface ITestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

export interface IAIReview {
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  feedback: string;
  improvements: string[];
  approach: string;
}

export interface ISubmission extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  problem: mongoose.Types.ObjectId;
  code: string;
  language: Language;
  status: SubmissionStatus;
  testResults: ITestResult[];
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number;
  memoryUsedMb?: number;
  aiReview?: IAIReview;
  createdAt: Date;
}

const testResultSchema = new Schema<ITestResult>(
  {
    passed: { type: Boolean, required: true },
    input: { type: String },
    expected: { type: String },
    actual: { type: String },
    error: { type: String },
  },
  {
    _id: false,
  },
);

const aiReviewSchema = new Schema<IAIReview>(
  {
    score: { type: Number, min: 0, max: 100 },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    feedback: { type: String },
    improvements: [{ type: String }],
    approach: { type: String },
  },
  {
    _id: false,
  },
);

const submissionSchema = new Schema<ISubmission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    code: {
      type: String,
      required: [true, "Code is required"],
      maxlength: [50000, "Code too long"],
    },

    language: {
      type: String,
      enum: ["javascript", "python", "java", "cpp"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "wrong-answer",
        "time-limit-exceeded",
        "runtime-error",
        "compilation-error",
      ],
      default: "pending",
    },

    testResults: [testResultSchema],
    passedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    executionTimeMs: { type: Number },
    memoryUsedMb: { type: Number },

    aiReview: {
      type: aiReviewSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ problem: 1, status: 1 });

export const SubmissionModel = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema,
);
