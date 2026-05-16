const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/agencyMemberController");

router.post("/create",                protect, c.createMember);
router.get("/",                       protect, c.getMembers);
router.post("/change-password",       protect, c.changePassword);
router.patch("/attach-freelancer",    protect, c.attachFreelancer);
router.patch("/detach-freelancer",    protect, c.detachFreelancer);
router.get("/freelancers",            protect, c.getFreelancers);
router.patch("/:id/status",           protect, c.setMemberStatus);

module.exports = router;