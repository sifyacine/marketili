// backend/config/db.js
// MongoDB connection + GridFS + multer storage — all in one place

const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");

const mongoURI = process.env.MONGO_URI;


// ── Main mongoose connection (used by all models) ──
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// ── Separate connection for GridFS ──
const conn = mongoose.createConnection(mongoURI);

conn.on("error", (err) => console.error("GridFS connection error:", err));

// ── Initialize GridFS stream ──
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  console.log("✅ GridFS initialized");
});

// ── GridFS multer storage engine ──
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/quicktime","video/webm"];
    if (!allowed.includes(file.mimetype)) {
      return new Error("Type de fichier non supporté");
    }
    return {
      bucketName: "uploads",
      filename: `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`,
      metadata: { originalName: file.originalname, uploadedAt: new Date() },
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = { connectDB, conn, gfs: () => gfs, upload };