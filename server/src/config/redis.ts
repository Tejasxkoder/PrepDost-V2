import { Redis } from "ioredis"
import { logger } from "../utils/logger.js"

let client: Redis | undefined
let resolved = false

export const getRedis = (): Redis | undefined => {
  if (resolved) return client
  resolved = true

  const url = process.env.REDIS_URL?.trim()
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        "redis",
        "REDIS_URL is not set: rate limits are counted per server instance. Fine for one instance, set it before running more."
      )
    }
    return undefined
  }

  client = new Redis(url, {
    family: 0,
    connectTimeout: 5_000,
    commandTimeout: 750,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (attempt) => Math.min(attempt * 250, 5_000),
  })

  let lastLoggedError = 0
  client.on("error", (error) => {
    if (Date.now() - lastLoggedError < 60_000) return
    lastLoggedError = Date.now()
    logger.error("redis", "Redis error", { error: error.message })
  })
  client.on("ready", () => logger.info("redis", "Redis connected"))

  return client
}

export const closeRedis = async (): Promise<void> => {
  if (!client) return

  try {
    await client.quit()
  } catch {
    client.disconnect()
  }
}
