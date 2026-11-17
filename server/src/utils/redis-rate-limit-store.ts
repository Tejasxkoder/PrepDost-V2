import type { Redis } from "ioredis"
import type { ClientRateLimitInfo, IncrementResponse, Options, Store } from "express-rate-limit"
import { logger } from "./logger.js"

const HIT_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { hits, ttl }
`

interface RateLimitCommands {
  rateLimitHit(key: string, windowMs: number): Promise<[number, number]>
}


export class RedisRateLimitStore implements Store {
  readonly prefix: string
  readonly localKeys = false
  private windowMs = 60_000
  private lastWarning = 0

  constructor(
    private readonly redis: Redis,
    prefix: string
  ) {
    this.prefix = prefix

    if (!("rateLimitHit" in redis)) {
      redis.defineCommand("rateLimitHit", { numberOfKeys: 1, lua: HIT_SCRIPT })
    }
  }

  init(options: Options): void {
    this.windowMs = options.windowMs
  }

  private key(key: string): string {
    return this.prefix + key
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const [hits, ttl] = await this.redis
      .multi()
      .get(this.key(key))
      .pttl(this.key(key))
      .exec()
      .then((results) => [Number(results?.[0]?.[1] ?? 0), Number(results?.[1]?.[1] ?? -1)] as const)

    if (!hits || ttl < 0) return undefined
    return { totalHits: hits, resetTime: new Date(Date.now() + ttl) }
  }

  async increment(key: string): Promise<IncrementResponse> {
    try {
      const [totalHits, ttl] = await (this.redis as unknown as RateLimitCommands).rateLimitHit(
        this.key(key),
        this.windowMs
      )

      return { totalHits, resetTime: new Date(Date.now() + ttl) }
    } catch (error) {
      if (Date.now() - this.lastWarning > 30_000) {
        this.lastWarning = Date.now()
        logger.warn("rate-limit", "Redis unavailable, letting requests through without counting", {
          prefix: this.prefix,
          error: error instanceof Error ? error.message : String(error),
        })
      }

      return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) }
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await this.redis.decr(this.key(key))
    } catch {
    }
  }

  async resetKey(key: string): Promise<void> {
    await this.redis.del(this.key(key))
  }
}
