

const express = require("express");
const router = express.Router();
const c = require("../controllers/subscriptionController");
const { protect, adminOnly } = require("../middleware/auth");



router.post("/webhook", c.webhook);


const { optionalAuth } = require("../middleware/auth");
router.get("/plans", optionalAuth, c.getPlans);


router.get("/me", protect, c.getMySubscription);
router.post("/checkout", protect, c.createCheckout);
router.post("/verify", protect, c.verifyLastCheckout);
router.post("/cancel", protect, c.cancelSubscription);


router.get("/connection", protect, adminOnly, c.checkConnection);
router.post("/admin/backfill", protect, adminOnly, c.backfillTrials);
router.get("/", protect, adminOnly, c.listSubscriptions);

module.exports = router;
