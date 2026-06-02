/**
 * Migration: strip legacy location.city and location.country from all Post documents.
 *
 * These fields are no longer part of the Post schema (Algeria-only platform uses
 * location.region only). This script removes any residual values that may exist
 * in the database from before the schema cleanup.
 *
 * Usage:
 *   node backend/scripts/migrate-strip-location-fields.js
 *
 * Requires MONGO_URI in the environment (same .env the server uses).
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌  MONGO_URI not set. Copy .env to project root or set the variable.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("✅  Connected to MongoDB");

  const Post = mongoose.connection.collection("posts");

  const result = await Post.updateMany(
    {
      $or: [
        { "location.city":    { $exists: true } },
        { "location.country": { $exists: true } },
      ],
    },
    {
      $unset: {
        "location.city":    "",
        "location.country": "",
      },
    }
  );

  console.log(`✅  Done. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err.message);
  process.exit(1);
});
