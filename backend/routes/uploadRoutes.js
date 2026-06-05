const express   = require("express");
const rateLimit = require("express-rate-limit");
const { Readable } = require("stream");
const router    = express.Router();
const mongoose  = require("mongoose");
const { upload, conn } = require("../config/db");
const { protect } = require("../middleware/auth");

// 20 uploads per 15 minutes per IP — prevents storage exhaustion
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Limite d'upload atteinte. Réessayez plus tard." },
});

// POST /api/upload
// Multer puts the file in memory (req.file.buffer), then we stream it
// to GridFSBucket using the existing mongoose connection.
router.post("/", protect, uploadLimiter, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Aucun fichier reçu" });
    }

    const connection = conn();
    const bucket = new mongoose.mongo.GridFSBucket(connection.db, {
      bucketName: "uploads",
    });

    const filename = `${Date.now()}-${req.file.originalname.replace(/\s/g, "_")}`;

    // Pre-create ObjectId — uploadStream.id returns Date.now() in Mongoose 9 / driver v6
    const fileId = new mongoose.Types.ObjectId();

    const uploadStream = bucket.openUploadStream(filename, {
      id:          fileId,
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadedBy:   req.user._id,
        uploadedAt:   new Date(),
        contentType:  req.file.mimetype,
      },
    });

    // Stream the buffer into GridFS — wrap in array so it emits one Buffer chunk,
    // not individual bytes (Readable.from iterates Buffers in older Node versions)
    const readable = Readable.from([req.file.buffer]);
    readable.pipe(uploadStream);

    uploadStream.on("finish", () => {
      return res.json({
        success:  true,
        message:  "File uploaded successfully",
        fileId:   fileId.toString(),
        id:       fileId.toString(),
        filename,
        mimeType: req.file.mimetype,
        size:     req.file.size,
        url:      `/api/upload/${fileId}`,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("GridFS upload stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement du fichier" });
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Upload failed: " + error.message });
    }
  }
});

// GET /api/upload/:id   — stream file from GridFS
// ?download=1 forces attachment disposition (browser download)
router.get("/:id", async (req, res) => {
  try {
    const connection = conn();
    const bucket = new mongoose.mongo.GridFSBucket(connection.db, {
      bucketName: "uploads",
    });

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const file = files[0];
    const contentType  = file.contentType || file.metadata?.contentType || "application/octet-stream";
    const encodedName  = encodeURIComponent(file.filename || req.params.id);
    const disposition  = req.query.download === "1" ? "attachment" : "inline";

    // Allow cross-origin embedding in iframes (FileViewerModal)
    // Remove nosniff so browsers can render images/PDFs served before metadata.contentType was added
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("X-Content-Type-Options");

    res.set("Content-Type",        contentType);
    res.set("Content-Disposition", `${disposition}; filename*=UTF-8''${encodedName}`);
    res.set("Cache-Control",       "private, max-age=3600");

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", () => {
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: "File not found" });
      }
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Download failed" });
    }
  }
});

module.exports = router;
