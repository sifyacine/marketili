const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/agencyMemberController");

router.post("/create",          protect, c.createMember);
router.get("/",                 protect, c.getMembers);
router.post("/change-password", protect, c.changePassword);
router.patch("/:id/toggle",     protect, c.toggleMember);

module.exports = router;