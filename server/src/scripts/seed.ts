import dotenv from "dotenv"

dotenv.config()

import mongoose from "mongoose"
import { ProblemModel } from "../models/problem.model.js"
import { SEED_PROBLEMS } from "../scripts/problems.data.js"

/**
 * Upserts the starter DSA problems by slug, so it is safe to run repeatedly
 * (production included). Usage: `npm run seed`
 */
const run = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not set")

  await mongoose.connect(uri, { dbName: "prepdost" })

  let created = 0
  let updated = 0

  for (const problem of SEED_PROBLEMS) {
    const result = await ProblemModel.updateOne(
      { slug: problem.slug },
      { $set: { ...problem, isActive: true }, $setOnInsert: { solvedCount: 0, attemptCount: 0 } },
      { upsert: true }
    )
    if (result.upsertedCount) created++
    else updated++
  }

  console.log(`Seeded ${SEED_PROBLEMS.length} problems (${created} new, ${updated} updated)`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error)
  await mongoose.disconnect().catch(() => undefined)
  process.exit(1)
})
