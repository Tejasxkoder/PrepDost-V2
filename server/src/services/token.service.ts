import { RevokedTokenModel } from "../models/revoked-token.model.js"

/** Blocks a token until it would have expired anyway. Safe to call twice. */
export const revokeToken = async (
  jti: string | undefined,
  expSeconds: number | undefined
): Promise<void> => {
  // Tokens issued before the blocklist existed carry no jti; they simply run out.
  if (!jti || !expSeconds) return

  await RevokedTokenModel.updateOne(
    { jti },
    { $setOnInsert: { jti, expiresAt: new Date(expSeconds * 1000) } },
    { upsert: true }
  )
}

export const isTokenRevoked = async (
  jti: string | undefined
): Promise<boolean> => {
  if (!jti) return false
  return (await RevokedTokenModel.exists({ jti })) !== null
}
