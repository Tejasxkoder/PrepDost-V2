import { rateLimit } from "express-rate-limit"
import { getRedis } from "../config/redis.js"
import { RedisRateLimitStore } from "../utils/redis-rate-limit-store.js"

const MINUTE = 60 * 1000

interface LimiterConfig {
  name: string
  maxRequests: number
  windowMinutes: number
  message: string
}

const createLimiter = ({ name, maxRequests, windowMinutes, message }: LimiterConfig) => {
  const redis = getRedis()

  const redisStoreOption = redis
    ? { store: new RedisRateLimitStore(redis, `rl:${name}:`) }
    : {}

  return rateLimit({
    windowMs: windowMinutes * MINUTE,
    limit: maxRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message },
    ...redisStoreOption,
    passOnStoreError: true, 
  })
}

export const apiLimiter = createLimiter({
  name: "api",
  maxRequests: 300,
  windowMinutes: 15,
  message: "Too many requests, please slow down.",
})

export const authLimiter = createLimiter({
  name: "auth",
  maxRequests: 20,
  windowMinutes: 15,
  message: "Too many attempts. Try again in a few minutes.",
})

export const otpLimiter = createLimiter({
  name: "otp",
  maxRequests: 5,
  windowMinutes: 15,
  message: "Too many code requests. Try again in a few minutes.",
})

export const heavyLimiter = createLimiter({
  name: "heavy",
  maxRequests: 60,
  windowMinutes: 15,
  message: "You're going a bit fast. Give it a minute and try again.",
})