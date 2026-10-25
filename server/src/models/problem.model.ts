
import mongoose, { Document, Schema } from "mongoose";

export type ProblemDifficulty = "easy" | "medium" | "hard";

export type ProblemTag =
  | "array"
  | "string"
  | "linked-list"
  | "tree"
  | "graph"
  | "dynamic-programming"
  | "binary-search"
  | "stack"
  | "queue"
  | "heap"
  | "hashing"
  | "recursion"
  | "sorting"
  | "greedy"
  | "math"
  | "two-pointers"
  | "sliding-window"
  | "backtracking";

export interface IExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IStarterCode {
  javascript: string;
  python: string;
  java: string;
  cpp: string;
}

export interface IProblem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  tags: ProblemTag[];
  examples: IExample[];
  testCases: ITestCase[];
  starterCode: IStarterCode;
  companies: string[];
  hints: string[];
  solution?: string;
  isActive: boolean;
  solvedCount: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const exampleSchema = new Schema<IExample>(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  },
  {
    _id: false,
  },
);

const testCaseSchema = new Schema<ITestCase>(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  {
    _id: false,
  },
);

const starterCodeSchema = new Schema<IStarterCode>(
  {
    javascript: {
      type: String,
      default: "// Write your solution here\n",
    },
    python: {
      type: String,
      default: "# Write your solution here\n",
    },
    java: {
      type: String,
      default: "// Write your solution here\n",
    },
    cpp: {
      type: String,
      default: "// Write your solution here\n",
    },
  },
  {
    _id: false,
  },
);

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    tags: [
      {
        type: String,
        enum: [
          "array",
          "string",
          "linked-list",
          "tree",
          "graph",
          "dynamic-programming",
          "binary-search",
          "stack",
          "queue",
          "heap",
          "hashing",
          "recursion",
          "sorting",
          "greedy",
          "math",
          "two-pointers",
          "sliding-window",
          "backtracking",
        ],
      },
    ],

    examples: [exampleSchema],
    testCases: [testCaseSchema],

    starterCode: {
      type: starterCodeSchema,
      default: () => ({}),
    },

    companies: [{ type: String, trim: true }],
    hints: [{ type: String }],
    solution: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    solvedCount: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ isActive: 1 });
problemSchema.index({ companies: 1 });

export const ProblemModel = mongoose.model<IProblem>(
  "Problem",
  problemSchema,
);
