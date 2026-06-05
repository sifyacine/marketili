// backend/routes/subscriptionRoutes.js

const express = require("express");
const router = express.Router();
const c = require("../controllers/subscriptionController");
const { protect, adminOnly } = require("../middleware/auth");

// ── Public webhook (NO cookie auth — verified by Chargily signature) ───────────
// Must be declared before the `protect` guard below.
router.post("/webhook", c.webhook);

// ── Catalog (optional auth: works logged-out, richer logged-in) ────────────────
const { optionalAuth } = require("../middleware/auth");
router.get("/plans", optionalAuth, c.getPlans);

// ── Authenticated subscriber actions ───────────────────────────────────────────
router.get("/me", protect, c.getMySubscription);
router.post("/checkout", protect, c.createCheckout);
router.post("/verify", protect, c.verifyLastCheckout);
router.post("/cancel", protect, c.cancelSubscription);

// ── Admin ──────────────────────────────────────────────────────────────────────
router.get("/connection", protect, adminOnly, c.checkConnection);
router.post("/admin/backfill", protect, adminOnly, c.backfillTrials);
router.get("/", protect, adminOnly, c.listSubscriptions);

module.exports = router;
