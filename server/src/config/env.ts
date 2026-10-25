import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    PORT: z.coerce.number().default(5000),

    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters"),

    JWT_EXPIRES_IN: z.string().default("7d"),

    FRONTEND_URL: z.string().default("http://localhost:3000"),

    OPENROUTER_API_KEY: z
      .string()
      .min(1, "OPENROUTER_API_KEY is required"),

    DEEPGRAM_API_KEY: z
      .string()
      .min(1, "DEEPGRAM_API_KEY is required"),

    JUDGE0_URL: z.string().default("https://judge0-ce.p.rapidapi.com"),

    JUDGE0_API_KEY: z
      .string()
      .min(1, "JUDGE0_API_KEY is required"),

    SMTP_HOST: z.string().optional(),

    SMTP_PORT: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().default(587)
    ),

    SMTP_USER: z.string().optional(),

    SMTP_PASS: z.string().optional(),

    MAIL_FROM: z.string().optional(),

    EMAIL_TO_CONSOLE: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (
      env.NODE_ENV !== "production" ||
      env.EMAIL_TO_CONSOLE === "true"
    ) {
      return;
    }

    const requiredEmailSettings = [
      "SMTP_HOST",
      "SMTP_USER",
      "SMTP_PASS",
      "MAIL_FROM",
    ] as const;

    for (const key of requiredEmailSettings) {
      if (!env[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required in production (sign-up and password reset send emails)`,
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables");

  for (const issue of parsed.error.issues) {
    console.error(
      `• ${issue.path.join(".")}: ${issue.message}`
    );
  }

  process.exit(1);
}

export const ENV = parsed.data;