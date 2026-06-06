const express   = require("express");
const rateLimit = require("express-rate-limit");
const router    = express.Router();

const { register, login, getMe, logout, verifyEmail, resendVerification, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");



const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de tentatives. Réessayez dans 15 minutes." },
});


router.post("/register",     authLimiter, register);
router.post("/login",        authLimiter, login);
router.post("/verify-email",    authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password",  authLimiter, resetPassword);


router.get("/me",                   protect, getMe);
router.post("/logout",              protect, logout);
router.post("/resend-verification", authLimiter, protect, resendVerification);

module.exports = router;
