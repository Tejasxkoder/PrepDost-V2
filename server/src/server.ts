import dotenv from "dotenv"

dotenv.config()

import app from "./app.js"
import { connectDatabase, disconnectDatabase } from "./config/database.js"
import { closeRedis } from "./config/redis.js"
import { createShutdown } from "./utils/lifecycle.js"

const PORT = Number(process.env.PORT) || 5000

const startServer = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "production") await import("./config/env.js")

    await connectDatabase()

    const server = app.listen(PORT, () => {
      console.log("Server Started")
      console.log(`Port: ${PORT}`)
      console.log(
        `Environment: ${
          process.env.NODE_ENV ?? "development"
        }`
      )
    })

    server.keepAliveTimeout = 65_000
    server.headersTimeout = 66_000

    const shutdown = createShutdown(server, {
      drainMs: Number(process.env.SHUTDOWN_TIMEOUT_MS) || 70_000,
      cleanup: async () => {
        await disconnectDatabase()
        await closeRedis()
      },
    })
    process.on("SIGTERM", () => shutdown("SIGTERM"))
    process.on("SIGINT", () => shutdown("SIGINT"))
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    )

    process.exit(1)
  }
}

void startServer()