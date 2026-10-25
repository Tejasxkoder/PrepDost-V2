import { rateLimit } from "express-rate-limit";

const build = (
  limit: number,
  windowMinutes: number,
  message: string
) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
};

export const apiLimiter = build(
  300,
  15,
  "Too many requests, please slow down."
);

export const authLimiter = build(
  20,
  15,
  "Too many attempts. Try again in a few minutes."
);

export const otpLimiter = build(
  5,
  15,
  "Too many code requests. Try again in a few minutes."
);

export const heavyLimiter = build(
  60,
  15,
  "You're going a bit fast. Give it a minute and try again."
);