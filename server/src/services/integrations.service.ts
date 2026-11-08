export type Provider = "github" | "leetcode"
export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export interface ActivityDay {
  date: string // YYYY-MM-DD (UTC)
  count: number
  level: ActivityLevel
}

export interface GithubActivity {
  provider: "github"
  username: string
  profileUrl: string
  totalContributions: number
  days: ActivityDay[]
}

export interface LeetcodeActivity {
  provider: "leetcode"
  username: string
  profileUrl: string
  streak: number
  totalActiveDays: number
  solved: number
  days: ActivityDay[]
}

export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = "IntegrationError"
  }
}

export const GITHUB_USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
export const LEETCODE_USERNAME_RE = /^[A-Za-z0-9_-]{1,40}$/

const DAY_MS = 86_400_000
const WINDOW_DAYS = 365
const CACHE_TTL_MS = 30 * 60 * 1000
const REQUEST_TIMEOUT_MS = 8_000

const cache = new Map<string, { expires: number; value: unknown }>()

const cached = async <T>(key: string, load: () => Promise<T>): Promise<T> => {
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as T

  const value = await load()
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value })

  if (cache.size > 500) {
    const now = Date.now()
    for (const [k, v] of cache) if (v.expires <= now) cache.delete(k)
  }
  return value
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)

const lastYearDates = (): string[] => {
  const today = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  )
  return Array.from({ length: WINDOW_DAYS }, (_, i) =>
    isoDay(today - (WINDOW_DAYS - 1 - i) * DAY_MS)
  )
}

const levelForCount = (count: number): ActivityLevel => {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

const fetchJson = async (
  url: string,
  init: RequestInit,
  upstream: string
): Promise<{ status: number; body: any }> => {
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new IntegrationError(`${upstream} is not reachable right now`, 502)
  }

  const body = await response.json().catch(() => null)
  return { status: response.status, body }
}

const GITHUB_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }
`

const GITHUB_LEVELS: Record<string, ActivityLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

const githubViaGraphQL = async (
  username: string,
  token: string
): Promise<{ total: number; days: ActivityDay[] }> => {
  const { status, body } = await fetchJson(
    "https://api.github.com/graphql",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "prepdost",
      },
      body: JSON.stringify({ query: GITHUB_QUERY, variables: { login: username } }),
    },
    "GitHub"
  )

  if (status === 401) throw new IntegrationError("GitHub token is invalid", 502)
  if (body?.errors?.some((e: any) => e.type === "NOT_FOUND")) {
    throw new IntegrationError("GitHub user not found", 404)
  }

  const calendar = body?.data?.user?.contributionsCollection?.contributionCalendar
  if (!calendar) throw new IntegrationError("Could not read GitHub activity", 502)

  const days: ActivityDay[] = calendar.weeks.flatMap((week: any) =>
    week.contributionDays.map((d: any) => ({
      date: d.date as string,
      count: d.contributionCount as number,
      level: GITHUB_LEVELS[d.contributionLevel as string] ?? 0,
    }))
  )

  return { total: calendar.totalContributions as number, days }
}

const githubViaPublicApi = async (
  username: string
): Promise<{ total: number; days: ActivityDay[] }> => {
  const { status, body } = await fetchJson(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
    { headers: { "User-Agent": "prepdost" } },
    "GitHub"
  )

  if (status === 404) throw new IntegrationError("GitHub user not found", 404)
  if (status !== 200 || !Array.isArray(body?.contributions)) {
    throw new IntegrationError("Could not read GitHub activity", 502)
  }

  const days: ActivityDay[] = body.contributions.map((d: any) => ({
    date: d.date as string,
    count: d.count as number,
    level: Math.min(4, Math.max(0, Number(d.level) || 0)) as ActivityLevel,
  }))

  const total =
    typeof body.total?.lastYear === "number"
      ? body.total.lastYear
      : days.reduce((sum, d) => sum + d.count, 0)

  return { total, days }
}

export const getGithubActivity = (username: string): Promise<GithubActivity> =>
  cached(`github:${username.toLowerCase()}`, async () => {
    const token = process.env.GITHUB_TOKEN
    const { total, days } = token
      ? await githubViaGraphQL(username, token)
      : await githubViaPublicApi(username)

    return {
      provider: "github" as const,
      username,
      profileUrl: `https://github.com/${username}`,
      totalContributions: total,
      days,
    }
  })

const LEETCODE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      userCalendar { streak totalActiveDays submissionCalendar }
    }
  }
`

export const getLeetcodeActivity = (username: string): Promise<LeetcodeActivity> =>
  cached(`leetcode:${username.toLowerCase()}`, async () => {
    const { status, body } = await fetchJson(
      "https://leetcode.com/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
          "User-Agent": "Mozilla/5.0 (compatible; prepdost)",
        },
        body: JSON.stringify({ query: LEETCODE_QUERY, variables: { username } }),
      },
      "LeetCode"
    )

    if (status >= 500) throw new IntegrationError("LeetCode is not reachable right now", 502)

    const matched = body?.data?.matchedUser
    if (!matched) {
      const notFound = body?.errors?.some((e: any) =>
        String(e.message).toLowerCase().includes("does not exist")
      )
      if (notFound || body?.data) throw new IntegrationError("LeetCode user not found", 404)
      throw new IntegrationError("Could not read LeetCode activity", 502)
    }

    let calendar: Record<string, number> = {}
    try {
      calendar = JSON.parse(matched.userCalendar?.submissionCalendar ?? "{}")
    } catch {
      calendar = {}
    }

    const countsByDay = new Map<string, number>()
    for (const [ts, count] of Object.entries(calendar)) {
      const day = isoDay(Number(ts) * 1000)
      countsByDay.set(day, (countsByDay.get(day) ?? 0) + Number(count))
    }

    const days: ActivityDay[] = lastYearDates().map((date) => {
      const count = countsByDay.get(date) ?? 0
      return { date, count, level: levelForCount(count) }
    })

    const solvedAll = matched.submitStatsGlobal?.acSubmissionNum?.find(
      (row: any) => row.difficulty === "All"
    )

    return {
      provider: "leetcode" as const,
      username: matched.username ?? username,
      profileUrl: `https://leetcode.com/u/${matched.username ?? username}/`,
      streak: Number(matched.userCalendar?.streak ?? 0),
      totalActiveDays: Number(matched.userCalendar?.totalActiveDays ?? 0),
      solved: Number(solvedAll?.count ?? 0),
      days,
    }
  })
