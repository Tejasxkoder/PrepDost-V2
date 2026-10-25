
import mongoose, { Document, Schema } from "mongoose";

export type OtpPurpose = "verify" | "reset";

export interface IOtp extends Document {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  attempts: number;
  lastSentAt: Date;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: ["verify", "reset"],
      required: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastSentAt: {
      type: Date,
      required: true,
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

otpSchema.index(
  { email: 1, purpose: 1 },
  { unique: true },
);

otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

export const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);
