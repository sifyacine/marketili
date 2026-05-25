// backend/config/db.js
const mongoose = require("mongoose");
const multer = require("multer");

let _conn;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    _conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB connected: ${_conn.connection.host}`);
    console.log(`✅ GridFS ready for file operations`);
    return _conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Simple memory storage for multer - we'll handle GridFS manually in routes
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté"), false);
    }
  },
});

const getConn = () => _conn?.connection || mongoose.connection;

module.exports = {
  connectDB,
  conn: getConn,
  upload: {
    single: (field) => upload.single(field),
    array: (field, max) => upload.array(field, max),
    fields: (fields) => upload.fields(fields),
    none: () => upload.none(),
  },
};