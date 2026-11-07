import { createHmac, randomInt, timingSafeEqual } from "node:crypto"
import { OtpModel, type OtpPurpose } from "../models/otp.model.js"
import { logger } from "../utils/logger.js"
import { otpEmail, sendMail } from "./mail.service.js"

export const OTP_TTL_MINUTES = 10
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RESEND_COOLDOWN_SECONDS = 60
const OTP_TTL_MS = OTP_TTL_MINUTES * 60 * 1000
const COOLDOWN_MS = OTP_RESEND_COOLDOWN_SECONDS * 1000

export type OtpCheck = "ok" | "invalid" | "locked"

const hashCode = (purpose: OtpPurpose, email: string, code: string): string =>
  createHmac("sha256", process.env.JWT_SECRET ?? "")
    .update(`${purpose}:${email}:${code}`)
    .digest("hex")

const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export const issueOtp = async (
  email: string,
  purpose: OtpPurpose
): Promise<string | null> => {
  const now = Date.now()

  const existing = await OtpModel.findOne({ email, purpose })
  if (existing && now - existing.lastSentAt.getTime() < COOLDOWN_MS) return null

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0")

  await OtpModel.findOneAndUpdate(
    { email, purpose },
    {
      $set: {
        codeHash: hashCode(purpose, email, code),
        attempts: 0,
        lastSentAt: new Date(now),
        expiresAt: new Date(now + OTP_TTL_MS),
      },
    },
    { upsert: true }
  )

  return code
}

export const verifyOtp = async (
  email: string,
  purpose: OtpPurpose,
  code: string
): Promise<OtpCheck> => {
  const now = new Date()

  const doc = await OtpModel.findOneAndUpdate(
    {
      email,
      purpose,
      attempts: { $lt: OTP_MAX_ATTEMPTS },
      expiresAt: { $gt: now },
    },
    { $inc: { attempts: 1 } },
    { returnDocument: "after" }
  )

  if (!doc) {
    const live = await OtpModel.exists({ email, purpose, expiresAt: { $gt: now } })
    return live ? "locked" : "invalid"
  }

  if (safeEqual(doc.codeHash, hashCode(purpose, email, code))) {
    await OtpModel.deleteOne({ _id: doc._id })
    return "ok"
  }

  return doc.attempts >= OTP_MAX_ATTEMPTS ? "locked" : "invalid"
}

export const hasLiveOtp = async (
  email: string,
  purpose: OtpPurpose
): Promise<boolean> =>
  (await OtpModel.exists({ email, purpose, expiresAt: { $gt: new Date() } })) !== null

export const clearOtps = async (email: string): Promise<void> => {
  await OtpModel.deleteMany({ email })
}

export const sendOtp = async (
  email: string,
  purpose: OtpPurpose
): Promise<boolean> => {
  const code = await issueOtp(email, purpose)
  if (!code) return false

  try {
    await sendMail({ to: email, ...otpEmail(purpose, code, OTP_TTL_MINUTES) })
  } catch (error) {
    await OtpModel.deleteOne({ email, purpose })
    throw error
  }
  return true
}

export const sendOtpInBackground = (email: string, purpose: OtpPurpose): void => {
  sendOtp(email, purpose).catch((error: unknown) => {
    logger.error("otp.send", "Could not send code", {
      purpose,
      error: error instanceof Error ? error.message : String(error),
    })
  })
}
