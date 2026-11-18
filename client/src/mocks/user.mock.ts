import type { UserApi } from "@/features/user/api";
import { ApiError } from "@/lib/api/errors";
import { delay } from "./delay";
import { updateMockSessionUser } from "./auth.mock";

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const mockUserApi: UserApi = {
  async changePassword({ currentPassword }) {
    await delay(500);
    if (currentPassword !== "Demo@1234" && currentPassword.length < 8)
      throw new ApiError("Current password is incorrect", 400);
  },
  async deleteAccount() {
    await delay(500);
  },
  async updateProfile(input) {
    await delay(350);
    return updateMockSessionUser({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.githubUsername !== undefined && { githubUsername: input.githubUsername }),
      ...(input.leetcodeUsername !== undefined && { leetcodeUsername: input.leetcodeUsername }),
      ...(input.avatar !== undefined && { avatarUrl: input.avatar }),
    });
  },

  async stats() {
    await delay();
    return {
      interviews: {
        total: 14,
        completed: 11,
        averageScore: 78,
        bestScore: { score: 92, type: "technical", company: "Razorpay" },
        byType: { technical: 6, behavioral: 4, dsa: 3, "system-design": 1 },
      },
      dsa: {
        totalSubmissions: 96,
        totalAccepted: 51,
        uniqueProblemsSolved: 42,
        acceptanceRate: 53,
        byLanguage: { javascript: 40, python: 38, cpp: 18 },
        recentSolved: [
          {
            title: "Two Sum",
            slug: "two-sum",
            difficulty: "easy",
            language: "javascript",
            createdAt: daysAgo(0),
          },
          {
            title: "Valid Parentheses",
            slug: "valid-parentheses",
            difficulty: "medium",
            language: "python",
            createdAt: daysAgo(1),
          },
        ],
      },
      streak: { current: 6, longest: 11, lastActive: daysAgo(0) },
      recentActivity: [
        {
          _id: "a1",
          type: "problem_solved",
          metadata: { problemTitle: "Two Sum", difficulty: "easy", language: "javascript" },
          createdAt: daysAgo(0),
        },
        {
          _id: "a2",
          type: "interview_completed",
          metadata: { interviewType: "technical", company: "Razorpay", score: 92 },
          createdAt: daysAgo(1),
        },
        {
          _id: "a3",
          type: "problem_attempted",
          metadata: { problemTitle: "Trapping Rain Water", difficulty: "hard", language: "python" },
          createdAt: daysAgo(2),
        },
        {
          _id: "a4",
          type: "interview_started",
          metadata: { interviewType: "behavioral", company: "General" },
          createdAt: daysAgo(3),
        },
      ],
    };
  },
};
