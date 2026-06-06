const mongoose = require("mongoose");
const multer   = require("multer");

let _conn;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    _conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS:         10000,
      socketTimeoutMS:          45000,
    });
    console.log(`✅ MongoDB connected: ${_conn.connection.host}`);

    return _conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};


const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/quicktime", "video/webm",
  "application/pdf",
]);




const _upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté"), false);
    }
  },
});

const upload = {
  single: (field)        => _upload.single(field),
  array:  (field, max)   => _upload.array(field, max),
  fields: (fields)       => _upload.fields(fields),
  none:   ()             => _upload.none(),
};

const getConn = () => _conn?.connection || mongoose.connection;

module.exports = { connectDB, conn: getConn, upload };
