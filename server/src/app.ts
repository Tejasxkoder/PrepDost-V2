import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import authRouter from "./routes/auth.route.js";
import interviewRouter from "./routes/interview.route.js";
import interviewVoiceRouter from "./routes/interview-voice.route.js";
import notificationRouter from "./routes/notification.route.js";
import problemRouter from "./routes/problem.route.js";
import submissionRouter from "./routes/submission.route.js";
import userRouter from "./routes/user.route.js";
import voiceRouter from "./routes/voice.route.js";

import {
  errorHandler,
  notFound,
} from "./middlewares/error.middleware.js";

import {
  apiLimiter,
  authLimiter,
  heavyLimiter,
  otpLimiter,
} from "./middlewares/rate-limit.middleware.js";

const app: Express = express();

app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));
app.disable("x-powered-by");

app.use(helmet());

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000"],
    credentials: true,
  })
);

app.get("/api/v1/health", (_req: Request, res: Response) => {
  const dbUp = mongoose.connection.readyState === 1;

  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    message: dbUp ? "PrepDost API running" : "Database not connected",
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.use("/api/v1", apiLimiter);

app.post(
  [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/verify-email",
    "/api/v1/auth/reset-password",
  ],
  authLimiter
);

app.post(
  ["/api/v1/auth/forgot-password", "/api/v1/auth/resend-verification"],
  otpLimiter
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/problems", problemRouter);
app.use("/api/v1/notifications", notificationRouter);

app.use("/api/v1/interviews", heavyLimiter, interviewRouter);
app.use("/api/v1/submissions", heavyLimiter, submissionRouter);
app.use("/api/v1/voice", heavyLimiter, voiceRouter);
app.use("/api/v1/interview-voice", heavyLimiter, interviewVoiceRouter);

app.use(notFound);
app.use(errorHandler);

export default app;