
import express from "express"
import type { Express, Request, Response } from "express"
import cors from "cors"
import helmet from "helmet"
import mongoose from "mongoose"
import { apiLimiter } from "./middlewares/rate-limit.middleware.js"
import notificationRouter from "./routes/notification.route.js"
import userRouter from "./routes/user.route.js"
import authRouter from "./routes/auth.route.js"

import {
  errorHandler,
  notFound,
} from "./middlewares/error.middleware.js"

const app: Express = express()

app.disable("x-powered-by")

app.use(helmet())
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000"],
    credentials: true,
  }),
)

app.get("/api/v1/health", (_req: Request, res: Response) => {
  const dbUp = mongoose.connection.readyState === 1

  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    message: dbUp ? "PrepDost API running" : "Database not connected",
    uptimeSeconds: Math.round(process.uptime()),
  })
})

app.use("/api/v1/auth", authRouter)
app.use("/api/v1", apiLimiter)
app.use("/api/v1/notifications", notificationRouter)
app.use("api/v1/users",userRouter)

app.use(notFound)
app.use(errorHandler)

export default app
