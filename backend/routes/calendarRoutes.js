const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/calendarController");

router.get("/:role/:id", protect, c.getCalendarEvents);

module.exports = router;
