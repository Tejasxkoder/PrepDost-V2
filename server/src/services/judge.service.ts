export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 93, 
  python: 71,     
  java: 62,       
  cpp: 54,        
}

const JUDGE0_URL =
  process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com"

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || ""

interface Judge0Result {
  status: { id: number; description: string }
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  time: string | null
  memory: number | null
}

const STATUS = {
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
}

const submitToJudge0 = async (
  code: string,
  languageId: number,
  stdin: string,
  expectedOutput: string
): Promise<Judge0Result> => {
  const response = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin,
      expected_output: expectedOutput,
      cpu_time_limit: 5,
      memory_limit: 256000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Judge0 API error: ${response.statusText}`)
  }

  return response.json()
}

export interface TestRunResult {
  passed: boolean
  input: string
  expected: string
  actual: string
  error?: string
  executionTimeMs?: number
  memoryUsedMb?: number
}

export const runCodeAgainstTests = async (
  code: string,
  language: string,
  testCases: { input: string; expectedOutput: string }[]
): Promise<{
  results: TestRunResult[]
  passedCount: number
  executionTimeMs: number
  memoryUsedMb: number
}> => {
  const languageId = LANGUAGE_IDS[language]
  if (!languageId) throw new Error(`Unsupported language: ${language}`)

  const results: TestRunResult[] = []
  let totalTime = 0
  let maxMemory = 0

  for (const testCase of testCases) {
    try {
      const result = await submitToJudge0(
        code,
        languageId,
        testCase.input,
        testCase.expectedOutput
      )

      const executionMs = result.time ? Math.round(parseFloat(result.time) * 1000) : 0
      const memoryMb = result.memory ? Math.round(result.memory / 1024) : 0

      totalTime += executionMs
      maxMemory = Math.max(maxMemory, memoryMb)

      const actual = (result.stdout || "").trim()
      const expected = testCase.expectedOutput.trim()
      const passed = result.status.id === STATUS.ACCEPTED || actual === expected

      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: result.stdout || "",
        error:
          result.stderr ||
          result.compile_output ||
          undefined,
        executionTimeMs: executionMs,
        memoryUsedMb: memoryMb,
      })
    } catch (error) {
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: "",
        error: error instanceof Error ? error.message : "Execution failed",
      })
    }
  }

  return {
    results,
    passedCount: results.filter((r) => r.passed).length,
    executionTimeMs: totalTime,
    memoryUsedMb: maxMemory,
  }
}