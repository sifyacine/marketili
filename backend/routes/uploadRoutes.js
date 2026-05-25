// backend/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Readable } = require("stream");
const { upload, conn } = require("../config/db");
const { protect } = require("../middleware/auth");

// POST /api/upload - Upload a file to GridFS
router.post("/", protect, (req, res) => {
  upload.single("file")(req, res, async (err) => {
    // Handle multer errors
    if (err) {
      console.error("Multer error:", err);
      
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Fichier trop volumineux (max 50MB)",
        });
      }
      
      if (err.message === "Type de fichier non supporté") {
        return res.status(400).json({
          success: false,
          message: "Type de fichier non supporté",
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'upload",
        error: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni",
        });
      }

      const connection = conn();
      if (!connection || !connection.db) {
        return res.status(500).json({
          success: false,
          message: "Base de données non disponible",
        });
      }

      const bucket = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: "uploads",
      });

      // Create readable stream from buffer
      const readableStream = Readable.from(req.file.buffer);
      
      // Generate unique filename
      const filename = `${Date.now()}-${req.file.originalname.replace(/\s/g, "_")}`;

      // Open upload stream to GridFS
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          size: req.file.size,
          uploadedAt: new Date(),
        },
      });

      // Pipe the buffer to GridFS
      readableStream.pipe(uploadStream);

      uploadStream.on("finish", () => {
        const fileId = uploadStream.id;
        const url = `/api/upload/${fileId}`;

        res.json({
          success: true,
          message: "Fichier uploadé avec succès",
          fileId: fileId.toString(),
          id: fileId.toString(),
          filename,
          url,
        });
      });

      uploadStream.on("error", (error) => {
        console.error("Upload stream error:", error);
        res.status(500).json({
          success: false,
          message: "Erreur lors de l'upload vers GridFS",
          error: error.message,
        });
      });
    } catch (error) {
      console.error("Upload processing error:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du traitement de l'upload",
        error: error.message,
      });
    }
  });
});

// GET /api/upload/:id - Download a file from GridFS
router.get("/:id", async (req, res) => {
  try {
    const connection = conn();
    if (!connection || !connection.db) {
      return res.status(500).json({
        success: false,
        message: "Base de données non disponible",
      });
    }

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
    
    // Get file info first to set headers
    const files = await bucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Fichier introuvable",
      });
    }

    const file = files[0];

    // Set response headers
    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Disposition", `inline; filename="${file.filename}"`);
    res.set("Content-Length", file.length);

    // Create download stream
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", (error) => {
      console.error("Download stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Erreur lors du téléchargement",
        });
      }
    });

    // Pipe to response
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Erreur lors du téléchargement",
        error: error.message,
      });
    }
  }
});

module.exports = router;