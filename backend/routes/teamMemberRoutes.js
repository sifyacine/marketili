const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/teamMemberController");

router.post("/create",               protect, c.createMember);
router.get("/",                      protect, c.getMembers);
router.patch("/:id/toggle",          protect, c.toggleMember);
router.patch("/:id/restore",         protect, c.restoreMember);
router.post("/change-password",      protect, c.changePassword);

module.exports = router;
