
import mongoose, { Document, Schema } from "mongoose";

export interface IRevokedToken extends Document {
  jti: string;
  expiresAt: Date;
}

const revokedTokenSchema = new Schema<IRevokedToken>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

revokedTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

export const RevokedTokenModel = mongoose.model<IRevokedToken>(
  "RevokedToken",
  revokedTokenSchema,
);
