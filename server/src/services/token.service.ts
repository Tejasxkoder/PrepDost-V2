import { RevokedTokenModel } from "../models/revoked-token.model.js"

export const revokeToken = async (
  jti: string | undefined,
  expSeconds: number | undefined
): Promise<void> => {
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
