import dotenv from "dotenv"

dotenv.config()

import { parseArgs } from "node:util"
import mongoose from "mongoose"
import { UserModel } from "../models/user.model.js"
import {
  NotificationModel,
  type NotificationKind,
} from "../models/notification.model.js"

const KINDS: readonly NotificationKind[] = ["feature", "dsa", "company", "streak", "review"]

const USAGE = `Usage:
  notify --title "Voice interviews are live" --body "Try the avatar interviewer." [options]

Options:
  --kind <feature|dsa|company|streak|review>   default: feature
  --href <path>        where the notification opens, e.g. /voice   (optional)
  --email <address>    send to one user instead of everyone
  --key <text>         dedupe key: running the same command again will not notify anyone twice`

/**
 * Sends an in-app notification to every active user, or to one user with --email.
 *
 *   npm run notify -- --title "..." --body "..." [--kind feature] [--href /voice] [--email a@b.com] [--key voice-launch]
 *
 * Docker: docker compose exec server node dist/scripts/notify.js --title "..." --body "..."
 */
const run = async (): Promise<void> => {
  const { values } = parseArgs({
    options: {
      title: { type: "string" },
      body: { type: "string" },
      kind: { type: "string", default: "feature" },
      href: { type: "string" },
      email: { type: "string" },
      key: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  })

  if (values.help) {
    console.log(USAGE)
    return
  }

  const title = values.title?.trim()
  const body = values.body?.trim()
  const kind = values.kind as NotificationKind

  if (!title || !body) throw new Error(`--title and --body are required\n\n${USAGE}`)
  if (title.length > 120) throw new Error("--title must be 120 characters or fewer")
  if (body.length > 300) throw new Error("--body must be 300 characters or fewer")
  if (!KINDS.includes(kind)) throw new Error(`--kind must be one of: ${KINDS.join(", ")}`)
  if (values.href && !values.href.startsWith("/")) {
    throw new Error("--href must be an in-app path starting with /, for example /voice")
  }

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set")

  await mongoose.connect(uri, { dbName: "prepdost" })

  const filter = values.email
    ? { email: values.email.trim().toLowerCase(), isActive: true }
    : { isActive: true }

  const users = await UserModel.find(filter).select("_id").lean()
  if (users.length === 0) {
    throw new Error(values.email ? `No active account for ${values.email}` : "No active users to notify")
  }

  // --key: skip anyone who already has a notification with this key (checked here, so it also
  // holds if the unique index is not there yet).
  let recipients = users
  if (values.key) {
    const already = new Set(
      (await NotificationModel.distinct("user", { dedupeKey: values.key })).map(String)
    )
    recipients = users.filter((user) => !already.has(String(user._id)))
    if (recipients.length === 0) {
      console.log(`Nobody to notify: all ${users.length} user${users.length === 1 ? "" : "s"} already have "${values.key}"`)
      await mongoose.disconnect()
      return
    }
  }

  const docs = recipients.map((user) => ({
    user: user._id,
    kind,
    title,
    body,
    ...(values.href ? { href: values.href } : {}),
    ...(values.key ? { dedupeKey: values.key } : {}),
    read: false,
  }))

  let sent = 0
  const CHUNK = 500
  for (let i = 0; i < docs.length; i += CHUNK) {
    try {
      const inserted = await NotificationModel.insertMany(docs.slice(i, i + CHUNK), { ordered: false })
      sent += inserted.length
    } catch (error) {
      // With --key, users who already got this notification are skipped (duplicate key); the rest still go out.
      const partial = error as { code?: number; insertedDocs?: unknown[]; result?: { insertedCount?: number } }
      if (partial.code !== 11000 && !values.key) throw error
      sent += partial.insertedDocs?.length ?? partial.result?.insertedCount ?? 0
    }
  }

  console.log(`Notified ${sent} of ${users.length} user${users.length === 1 ? "" : "s"}${sent < users.length ? " (the rest already had it)" : ""}`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error)
  await mongoose.disconnect().catch(() => undefined)
  process.exit(1)
})
