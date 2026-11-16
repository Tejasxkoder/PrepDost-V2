import OpenAI from "openai"
import type {
  InterviewType,
  Difficulty,
  IMessage,
} from "../models/interview.model.js"

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
})

export const MAX_INTERVIEW_MESSAGES = 10

const buildSystemPrompt = (
  type: InterviewType,
  company: string,
  difficulty: Difficulty
): string => {
  const difficultyMap = {
    easy: "junior level (0-1 years experience)",
    medium: "mid level (2-4 years experience)",
    hard: "senior level (5+ years experience)",
  }

  const typeInstructions: Record<InterviewType, string> = {
    behavioral: `
      You are conducting a behavioral interview.
      - Use STAR method (Situation, Task, Action, Result)
      - Ask about real past experiences
      - Dig deeper with follow-up questions
      - Assess: communication, leadership, teamwork, conflict resolution
    `,

    technical: `
      You are conducting a technical interview.
      - Ask about core CS concepts, system design fundamentals
      - Evaluate: depth of knowledge, problem-solving approach
      - Ask follow-up questions to test understanding
      - Cover: data structures, algorithms, databases, APIs
    `,

    dsa: `
      You are conducting a DSA coding interview.
      - Start with problem statement clearly
      - Ask candidate to think out loud
      - Give hints if completely stuck
      - Evaluate: approach, complexity analysis, code quality
    `,

    "system-design": `
      You are conducting a system design interview.
      - Start with requirements clarification
      - Discuss scalability, availability, consistency
      - Ask candidate to justify design decisions
      - Cover databases, caching, load balancing, APIs
    `,
  }

  return `
You are an expert interviewer at ${company}.
You are conducting a ${type} interview for a ${difficultyMap[difficulty]} candidate.

${typeInstructions[type]}

STRICT RULES:

1. Ask ONE question at a time
2. Be professional but encouraging
3. Ask follow-up questions when appropriate
4. After ${MAX_INTERVIEW_MESSAGES / 2} exchanges start wrapping up
5. Always respond in JSON format

{
  "message": "your response",
  "isComplete": false,
  "questionNumber": 1
}

6. Set isComplete=true when interview ends
7. Never break character
`.trim()
}

const buildFeedbackPrompt = (
  messages: IMessage[],
  type: InterviewType,
  company: string
): string => {
  const transcript = messages
    .map(
      (m) =>
        `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`
    )
    .join("\n\n")

  return `
You analyzed a ${type} interview for ${company}.

TRANSCRIPT:

${transcript}

Generate detailed feedback in EXACT JSON format:

{
  "overallScore": 0,
  "communicationScore": 0,
  "technicalScore": 0,
  "problemSolvingScore": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "summary": ""
}

Return ONLY JSON.
`.trim()
}

export interface AIResponse {
  message: string
  isComplete: boolean
  questionNumber: number
}

export const getInterviewResponse = async (
  type: InterviewType,
  company: string,
  difficulty: Difficulty,
  messages: IMessage[]
): Promise<AIResponse> => {
  const formattedMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const response =
    await client.chat.completions.create({
      model:
        process.env.INTERVIEW_MODEL ||
        "deepseek/deepseek-chat-v3-0324:free",

      messages: [
        {
          role: "system",
          content: buildSystemPrompt(
            type,
            company,
            difficulty
          ),
        },

        ...(formattedMessages.length > 0
          ? formattedMessages
          : [
            {
              role: "user" as const,
              content:
                "Please start the interview.",
            },
          ]),
      ],

      max_tokens: 1024,
      temperature: 0.7,
    })

  const content =
    response.choices[0]?.message?.content

  if (!content) {
    throw new Error("Empty AI response")
  }

  let cleanedContent = content.trim()

  if (cleanedContent.startsWith("```json")) {
    cleanedContent = cleanedContent
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim()
  }

  try {
    const parsed = JSON.parse(cleanedContent)

    return {
      message: parsed.message || content,
      isComplete: parsed.isComplete || false,
      questionNumber:
        parsed.questionNumber || 1,
    }
  } catch {
    return {
      message: content,
      isComplete: false,
      questionNumber: 1,
    }
  }
}

export const generateFeedback = async (
  messages: IMessage[],
  type: InterviewType,
  company: string
) => {
  const response =
    await client.chat.completions.create({
      model:
        process.env.INTERVIEW_MODEL ||
        "deepseek/deepseek-chat-v3-0324:free",

      messages: [
        {
          role: "user",
          content: buildFeedbackPrompt(
            messages,
            type,
            company
          ),
        },
      ],

      max_tokens: 2048,
      temperature: 0.3,
    })

  const content =
    response.choices[0]?.message?.content

  if (!content) {
    throw new Error("Empty AI response")
  }
  let cleanedContent = content.trim()

  if (cleanedContent.startsWith("```json")) {
    cleanedContent = cleanedContent
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim()
  }
  try {
    return JSON.parse(cleanedContent)
  } catch {
    throw new Error(
      "Failed to parse feedback from AI"
    )
  }
}
export const reviewCode = async (
  problemDescription: string,
  code: string,
  language: string,
  testResults: any[]
): Promise<any> => {
  const passedCount = testResults.filter((r) => r.passed).length

  const prompt = `
Review this ${language} solution.

Problem:
${problemDescription}

Code:
${code}

Test Results:
${passedCount}/${testResults.length} test cases passed.

Respond ONLY with valid JSON (no markdown, no explanation):

{
  "score": 0,
  "timeComplexity": "O(?)",
  "spaceComplexity": "O(?)",
  "feedback": "2-3 sentence overall feedback",
  "improvements": [
    "improvement 1",
    "improvement 2"
  ],
  "approach": "brief description of the approach used"
}
`

  const response = await client.chat.completions.create({
    model: process.env.CODE_REVIEW_MODEL!,
    messages: [
      {
        role: "system",
        content:
          "You are an expert competitive programming mentor. Always respond with valid JSON only. Do not wrap the response in markdown.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
    response_format: {
      type: "json_object",
    },
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error("Empty AI response")
  }

  try {
    return JSON.parse(content)
  } catch {
    throw new Error("Failed to parse AI review")
  }
}