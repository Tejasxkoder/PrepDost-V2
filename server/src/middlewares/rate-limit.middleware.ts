import { rateLimit } from "express-rate-limit"
import { getRedis } from "../config/redis.js"
import { RedisRateLimitStore } from "../utils/redis-rate-limit-store.js"

const build = (name: string, limit: number, windowMinutes: number, message: string) => {
  const redis = getRedis()

  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message },
    ...(redis ? { store: new RedisRateLimitStore(redis, `rl:${name}:`) } : {}),
  })
}


export const apiLimiter = build("api", 300, 15, "Too many requests, please slow down.")

export const authLimiter = build("auth", 20, 15, "Too many attempts. Try again in a few minutes.")

export const otpLimiter = build("otp", 5, 15, "Too many code requests. Try again in a few minutes.")

export const heavyLimiter = build("heavy", 60, 15, "You're going a bit fast. Give it a minute and try again.")
