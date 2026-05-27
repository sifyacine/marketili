// backend/config/db.js
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");

let _gfs;
let _upload;
let _conn;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    _conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,   // fail fast if MongoDB unreachable
      connectTimeoutMS:         10000,  // max time to establish initial connection
      socketTimeoutMS:          45000,  // max time for any single DB operation
    });
    console.log(`✅ MongoDB connected: ${_conn.connection.host}`);

    _gfs = Grid(_conn.connection.db, mongoose.mongo);
    _gfs.collection("uploads");
    console.log("✅ GridFS initialized");

    const storage = new GridFsStorage({
      url: mongoURI,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      file: (req, file) => {
        const allowed = [
          "image/jpeg", "image/png", "image/webp", "image/gif",
          "video/mp4", "video/quicktime", "video/webm",
          "application/pdf",
        ];
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

    _upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

    return _conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const upload = {
  single: (field) => (req, res, next) => {
    if (!_upload) return res.status(500).json({ message: "Upload not initialized" });
    _upload.single(field)(req, res, next);
  },
  array: (field, max) => (req, res, next) => {
    if (!_upload) return res.status(500).json({ message: "Upload not initialized" });
    _upload.array(field, max)(req, res, next);
  },
  fields: (fields) => (req, res, next) => {
    if (!_upload) return res.status(500).json({ message: "Upload not initialized" });
    _upload.fields(fields)(req, res, next);
  },
  none: () => (req, res, next) => {
    if (!_upload) return res.status(500).json({ message: "Upload not initialized" });
    _upload.none()(req, res, next);
  },
};

const getGfs = () => _gfs;
const getConn = () => _conn?.connection || mongoose.connection;

module.exports = { connectDB, conn: getConn, gfs: getGfs, upload };