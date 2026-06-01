// backend/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { upload, conn } = require("../config/db");
const { protect } = require("../middleware/auth");

router.post("/", protect, upload.single("file"), async (req, res) => {
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
    const connection = conn(); // Call as function
    const bucket = new mongoose.mongo.GridFSBucket(connection.db, {
      bucketName: "uploads",
    });

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de fichier invalide",
      });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", () => {
      res.status(404).json({ success: false, message: "File not found" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ success: false, message: "Download failed" });
  }
});

module.exports = router;
