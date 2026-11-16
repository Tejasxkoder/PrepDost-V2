import { SubmissionModel } from "../models/submission.model.js"
import { ProblemModel } from "../models/problem.model.js"
import { runCodeAgainstTests } from "./judge.service.js"
import { reviewCode } from "./ai.service.js"
import type { Language } from "../models/submission.model.js"
import { logActivity } from "./stats.service.js"

export const submitCode = async (
  userId: string,
  problemId: string,
  code: string,
  language: Language
) => {
  const problem = await ProblemModel.findById(problemId).select(
    "+testCases +solution"
  )
  if (!problem) throw new Error("Problem not found")

  await ProblemModel.findByIdAndUpdate(problemId, {
    $inc: { attemptCount: 1 },
  })

  const submission = await SubmissionModel.create({
    user: userId,
    problem: problemId,
    code,
    language,
    status: "pending",
  })

  try {
    const { results, passedCount, executionTimeMs, memoryUsedMb } =
      await runCodeAgainstTests(code, language, problem.testCases)

    const totalTests = problem.testCases.length
    const allPassed = passedCount === totalTests

    let status: string = "wrong-answer"
    if (allPassed) status = "accepted"
    else {
      const failedResult = results.find((r) => !r.passed)
      if (failedResult?.error?.includes("Time Limit")) {
        status = "time-limit-exceeded"
      } else if (failedResult?.error?.includes("Compilation")) {
        status = "compilation-error"
      } else if (failedResult?.error) {
        status = "runtime-error"
      }
    }

    let aiReview = null
    if (passedCount >= Math.floor(totalTests / 2)) {
      try {
        aiReview = await reviewCode(
          problem.description,
          code,
          language,
          results
        )
      } catch {
      }
    }

    submission.status = status as any
    // Hidden tests are judged server-side only: never persist (or return) their
    // input / expected output, otherwise a failed submission would leak the answers.
    submission.testResults = results.map((result, index) =>
      problem.testCases[index]?.isHidden
        ? {
            passed: result.passed,
            input: "",
            expected: "",
            actual: "",
            error: result.error ? "Error on a hidden test case" : undefined,
          }
        : result
    )
    submission.passedTests = passedCount
    submission.totalTests = totalTests
    submission.executionTimeMs = executionTimeMs
    submission.memoryUsedMb = memoryUsedMb
    submission.aiReview = aiReview
    await submission.save()

    await logActivity(userId, allPassed ? "problem_solved" : "problem_attempted", {
      problemId: problemId,
      problemTitle: problem.title,
      difficulty: problem.difficulty,
      language,
    })

    if (allPassed) {
      const alreadySolved = await SubmissionModel.findOne({
        user: userId,
        problem: problemId,
        status: "accepted",
        _id: { $ne: submission._id },
      })

      if (!alreadySolved) {
        await ProblemModel.findByIdAndUpdate(problemId, {
          $inc: { solvedCount: 1 },
        })
      }
    }

    return submission
  } catch (error) {
    submission.status = "runtime-error"
    await submission.save()
    throw error
  }
}

export const getUserSubmissions = async (
  userId: string,
  problemId?: string
) => {
  const query: Record<string, any> = { user: userId }
  if (problemId) query.problem = problemId

  return SubmissionModel.find(query)
    .select("-testResults -aiReview")
    .populate("problem", "title slug difficulty")
    .sort({ createdAt: -1 })
    .limit(50)
}

export const getSubmissionById = async (
  submissionId: string,
  userId: string
) => {
  const submission = await SubmissionModel.findOne({
    _id: submissionId,
    user: userId,
  }).populate("problem", "title slug difficulty")

  if (!submission) throw new Error("Submission not found")
  return submission
}
/**
 * "Run" button: executes the code against the problem's VISIBLE sample tests only.
 * Nothing is persisted, no stats change, hidden tests never leave the server.
 */
export const runSamples = async (
  problemId: string,
  code: string,
  language: Language
) => {
  const problem = await ProblemModel.findById(problemId).select("testCases isActive")
  if (!problem || !problem.isActive) throw new Error("Problem not found")

  const samples = problem.testCases.filter((testCase) => !testCase.isHidden)
  if (samples.length === 0) throw new Error("This problem has no sample tests")

  const { results, passedCount, executionTimeMs, memoryUsedMb } =
    await runCodeAgainstTests(code, language, samples)

  return {
    results,
    passedTests: passedCount,
    totalTests: samples.length,
    executionTimeMs,
    memoryUsedMb,
  }
}
