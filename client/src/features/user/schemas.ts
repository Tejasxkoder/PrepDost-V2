import { z } from "zod";

/** Backend `User` JSON (`_id`, `avatar`, …) → the shape the UI uses. */
export const userSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullish(),
    role: z.enum(["user", "admin"]).default("user"),
    githubUsername: z.string().nullish(),
    leetcodeUsername: z.string().nullish(),
    createdAt: z.string().optional(),
  })
  .transform((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatar ?? null,
    role: u.role,
    githubUsername: u.githubUsername ?? null,
    leetcodeUsername: u.leetcodeUsername ?? null,
  }));
export type User = z.output<typeof userSchema>;

/** `PUT /users/profile` body. `null` clears a field (e.g. disconnect an account). */
export interface UpdateProfileInput {
  name?: string;
  githubUsername?: string | null;
  leetcodeUsername?: string | null;
  avatar?: string | null;
}

const countRecord = z.record(z.string(), z.number());

/** `GET /users/stats` */
export const userStatsSchema = z.object({
  interviews: z.object({
    total: z.number(),
    completed: z.number(),
    averageScore: z.number(),
    bestScore: z
      .object({
        score: z.number().nullish(),
        type: z.string(),
        company: z.string().nullish(),
      })
      .nullable(),
    byType: countRecord,
  }),
  dsa: z.object({
    totalSubmissions: z.number(),
    totalAccepted: z.number(),
    uniqueProblemsSolved: z.number(),
    acceptanceRate: z.number(),
    byLanguage: countRecord,
    recentSolved: z.array(
      z.object({
        title: z.string(),
        slug: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        language: z.string(),
        createdAt: z.string(),
      }),
    ),
  }),
  streak: z.object({
    current: z.number(),
    longest: z.number(),
    lastActive: z.string().nullable(),
  }),
  recentActivity: z.array(
    z.object({
      _id: z.string(),
      type: z.enum([
        "interview_completed",
        "interview_started",
        "problem_solved",
        "problem_attempted",
      ]),
      metadata: z
        .object({
          interviewId: z.string().optional(),
          interviewType: z.string().optional(),
          company: z.string().optional(),
          score: z.number().optional(),
          problemId: z.string().optional(),
          problemTitle: z.string().optional(),
          difficulty: z.string().optional(),
          language: z.string().optional(),
        })
        .default({}),
      createdAt: z.string(),
    }),
  ),
});
export type UserStats = z.infer<typeof userStatsSchema>;
