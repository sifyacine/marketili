












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
