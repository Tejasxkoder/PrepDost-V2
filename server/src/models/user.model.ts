
import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  tokenVersion: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    githubUsername: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    leetcodeUsername: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ githubUsername: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ lastLoginAt: -1 });

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.tokenVersion;

  return user;
};

export const UserModel = mongoose.model<IUser>("User", userSchema);
