

const express  = require("express");
const router   = express.Router();
const c        = require("../controllers/activityController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/me", c.getMyActivity);

module.exports = router;
