import mongoose, { Document, Schema } from "mongoose"

export type NotificationKind =
  | "feature"
  | "dsa"
  | "company"
  | "streak"
  | "review"

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  kind: NotificationKind
  title: string
  body: string
  href?: string
  read: boolean
  dedupeKey?: string
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kind: {
      type: String,
      enum: ["feature", "dsa", "company", "streak", "review"],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 300 },
    href: { type: String, trim: true },
    read: { type: Boolean, default: false },
    dedupeKey: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, read: 1 })
notificationSchema.index(
  { user: 1, dedupeKey: 1 },
  {
    unique: true,
    partialFilterExpression: { dedupeKey: { $type: "string" } },
  }
)

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema
)
