import dotenv from "dotenv"

dotenv.config()

import mongoose from "mongoose"
import { UserModel } from "../models/user.model.js"

/**
 * Grants or removes the admin role for one account.
 *
 *   npm run make-admin -- someone@example.com            (make admin)
 *   npm run make-admin -- someone@example.com --remove   (back to a normal user)
 *
 * Docker: docker compose exec server node dist/scripts/make-admin.js someone@example.com
 * The role is read from the database on every request, so it applies immediately.
 */
const run = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const remove = args.includes("--remove")
  const email = args.find((arg) => !arg.startsWith("--"))?.trim().toLowerCase()

  if (!email) {
    throw new Error("Usage: make-admin <email> [--remove]")
  }

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set")

  await mongoose.connect(uri, { dbName: "prepdost" })

  const role = remove ? "user" : "admin"
  const label = role === "admin" ? "an admin" : "a normal user"
  const account = await UserModel.findOne({ email }).select("role")

  if (!account) {
    throw new Error(`No account found for ${email}. They must sign up first.`)
  }

  if (account.role === role) {
    console.log(`${email} is already ${label}`)
  } else {
    await UserModel.updateOne({ _id: account._id }, { $set: { role } })
    console.log(`${email} is now ${label}`)
  }
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await mongoose.disconnect().catch(() => undefined)
  process.exit(1)
})
