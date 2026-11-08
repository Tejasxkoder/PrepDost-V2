import type { HydratedDocument } from "mongoose"
import { OAuth2Client } from "google-auth-library"
import { z } from "zod"
import { UserModel, type IUser } from "../models/user.model.js"
import { HttpError } from "../utils/http-error.js"
import { logger } from "../utils/logger.js"
import { issueSession } from "./auth.service.js"
import { clearOtps } from "./otp.service.js"

export const googleSchema = z.object({
  credential: z.string().min(20).max(4096),
})

interface GoogleProfile {
  sub: string
  email: string
  name: string
  picture?: string
}

const googleClient = new OAuth2Client()

const displayName = (name: string | undefined, email: string): string => {
  const clean = (name ?? "").replace(/\s+/g, " ").trim().slice(0, 100)
  if (clean.length >= 2) return clean

  const local = (email.split("@")[0] ?? "").slice(0, 100)
  return local.length >= 2 ? local : "PrepDost User"
}

const isDuplicateKey = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: number }).code === 11000


const verifyGoogleCredential = async (
  credential: string
): Promise<GoogleProfile> => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()

  if (!clientId) {
    throw new HttpError(
      "Google sign-in is not set up on this server.",
      503,
      "GOOGLE_NOT_CONFIGURED"
    )
  }

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    })
    payload = ticket.getPayload()
  } catch (error) {
    logger.warn("auth.google", "ID token rejected", {
      error: error instanceof Error ? error.message : String(error),
    })
    throw new HttpError(
      "Google sign-in failed. Please try again.",
      401,
      "GOOGLE_TOKEN_INVALID"
    )
  }

  if (!payload?.sub || !payload.email) {
    throw new HttpError(
      "Google did not share an email address for this account.",
      401,
      "GOOGLE_TOKEN_INVALID"
    )
  }

  if (!payload.email_verified) {
    throw new HttpError(
      "Your Google email address is not verified.",
      403,
      "GOOGLE_EMAIL_UNVERIFIED"
    )
  }

  const email = payload.email.toLowerCase()

  return {
    sub: payload.sub,
    email,
    name: displayName(payload.name, email),
    picture: payload.picture?.startsWith("https://") ? payload.picture : undefined,
  }
}

const findExisting = async (
  profile: GoogleProfile
): Promise<HydratedDocument<IUser> | null> =>
  (await UserModel.findOne({ googleId: profile.sub })) ??
  (await UserModel.findOne({ email: profile.email }))

export const loginWithGoogle = async (credential: string) => {
  const profile = await verifyGoogleCredential(credential)

  let user = await findExisting(profile)
  let created = false

  if (!user) {
    try {
      user = await UserModel.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.sub,
        avatar: profile.picture,
        emailVerified: true,
        lastLoginAt: new Date(),
      })
      created = true
    } catch (error) {
      if (!isDuplicateKey(error)) throw error
      user = await findExisting(profile)
      if (!user) throw error
    }
  }

  if (user.googleId && user.googleId !== profile.sub) {
    throw new HttpError(
      "This email is already linked to a different Google account.",
      409,
      "GOOGLE_ACCOUNT_MISMATCH"
    )
  }

  if (!user.isActive) {
    throw new HttpError("Account is deactivated", 403)
  }

  if (created) {
    return { user: user.toJSON(), token: issueSession(user) }
  }

  if (!user.googleId) {
    user.googleId = profile.sub

    if (user.emailVerified === false) {
      user.password = undefined
      user.name = profile.name
      user.emailVerified = true
      user.tokenVersion = (user.tokenVersion ?? 0) + 1
      await clearOtps(user.email)
    }
  }

  if (!user.avatar && profile.picture) user.avatar = profile.picture

  user.lastLoginAt = new Date()
  await user.save()

  return { user: user.toJSON(), token: issueSession(user) }
}
