const express   = require("express");
const rateLimit = require("express-rate-limit");
const router    = express.Router();

const { register, login, getMe, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Strict limiter for auth endpoints — only counts failed attempts
// (skipSuccessfulRequests: true) so legitimate users are never blocked
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de tentatives. Réessayez dans 15 minutes." },
});

// Public routes
router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);

// Protected routes (require valid JWT)
router.get("/me",        protect, getMe);
router.post("/logout",   protect, logout);

module.exports = router;
