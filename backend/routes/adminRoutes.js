const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// ✅ IMPORT MIDDLEWARE
const { protect, adminOnly } = require("../middleware/auth");

// 🔐 Protect ALL admin routes
router.use(protect, adminOnly);

// Get all users
router.get("/users", adminController.getAllUsers);

// Toggle user
router.patch("/users/:role/:id/toggle", adminController.toggleUserStatus);

module.exports = router;