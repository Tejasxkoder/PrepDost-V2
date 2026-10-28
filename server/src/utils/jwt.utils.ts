
import { randomUUID } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_EXPIRES_IN = (
  process.env.JWT_EXPIRES_IN || "7d"
) as SignOptions["expiresIn"];

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  tv?: number;
  jti?: string;
  exp?: number;
}

export type TokenClaims = Pick<
  JWTPayload,
  "id" | "email" | "role" | "tv"
>;

export const generateToken = (claims: TokenClaims): string => {
  return jwt.sign(claims, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    jwtid: randomUUID(),
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
