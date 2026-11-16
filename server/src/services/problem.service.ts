import { ProblemModel } from "../models/problem.model.js"
import { z } from "zod"

export const getProblemFiltersSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  tag: z.string().optional(),
  company: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
})

export type ProblemFilters = z.infer<typeof getProblemFiltersSchema>

export const getAllProblems = async (filters: ProblemFilters) => {
  const query: Record<string, any> = { isActive: true }

  if (filters.difficulty) query.difficulty = filters.difficulty
  if (filters.tag) query.tags = filters.tag
  if (filters.company) query.companies = { $regex: filters.company, $options: "i" }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ]
  }

  const skip = (filters.page - 1) * filters.limit
  const total = await ProblemModel.countDocuments(query)

  const problems = await ProblemModel.find(query)
    .select("-testCases -solution -examples")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(filters.limit)

  return {
    problems,
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export const getProblemBySlug = async (slug: string) => {
  const problem = await ProblemModel.findOne({
    slug,
    isActive: true,
  })
    .select("-solution")
    .lean()

  if (!problem) throw new Error("Problem not found")

  // Hidden cases are only ever run server-side (submission.service loads them itself).
  return {
    ...problem,
    testCases: problem.testCases.filter((testCase) => !testCase.isHidden),
    hiddenTestCount: problem.testCases.filter((testCase) => testCase.isHidden).length,
  }
}

export const createProblem = async (data: any) => {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const existing = await ProblemModel.findOne({ slug })
  if (existing) throw new Error("Problem with this title already exists")

  return ProblemModel.create({ ...data, slug })
}

export const getProblemStats = async () => {
  const stats = await ProblemModel.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$difficulty",
        count: { $sum: 1 },
      },
    },
  ])

  return stats.reduce(
    (acc, item) => {
      acc[item._id] = item.count
      return acc
    },
    { easy: 0, medium: 0, hard: 0 } as Record<string, number>
  )
}
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export interface CompanySummary {
  name: string
  slug: string
  problemCount: number
}

/** Distinct companies derived from active problems, most problems first. */
export const getCompanies = async (): Promise<CompanySummary[]> => {
  const rows = await ProblemModel.aggregate<{ _id: string; count: number }>([
    { $match: { isActive: true } },
    { $unwind: "$companies" },
    { $group: { _id: "$companies", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ])

  return rows
    .filter((row) => row._id && row._id.trim().length > 0)
    .map((row) => ({
      name: row._id,
      slug: slugify(row._id),
      problemCount: row.count,
    }))
}
