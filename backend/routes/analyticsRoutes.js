// backend/routes/analyticsRoutes.js

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const { getAgencyAnalytics } = require("../controllers/analyticsController");

router.get("/agency/:agencyId", protect, getAgencyAnalytics);

module.exports = router;
