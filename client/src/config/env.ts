import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().min(1).default("/api/v1"),
  NEXT_PUBLIC_USE_MOCKS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

// Literal access is required so Next.js can inline NEXT_PUBLIC_* at build time.
export const env = schema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
});
