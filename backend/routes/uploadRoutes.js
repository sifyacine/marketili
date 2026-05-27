// backend/routes/uploadRoutes.js
const express   = require("express");
const rateLimit = require("express-rate-limit");
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

router.post("/", protect, uploadLimiter, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const connection = conn(); // Call as function
    const bucket = new mongoose.mongo.GridFSBucket(connection.db, {
      bucketName: "uploads",
    });

    const fileId = req.file.id;
    const url = `/api/upload/${fileId}`;

    res.json({
      success: true,
      message: "File uploaded successfully",
      fileId: fileId.toString(),
      id: fileId.toString(),
      filename: req.file.filename,
      url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
});

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
    const contentType = file.contentType || "application/octet-stream";
    const encodedName = encodeURIComponent(file.filename || req.params.id);
    const disposition = req.query.download === "1" ? "attachment" : "inline";

    res.set("Content-Type", contentType);
    res.set("Content-Disposition", `${disposition}; filename*=UTF-8''${encodedName}`);
    res.set("Cache-Control", "private, max-age=3600");

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