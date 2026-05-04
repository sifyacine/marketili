const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const agencyMemberController = require("../controllers/agencyMemberController");

// Only logged-in agency can create members
router.post("/create", protect, agencyMemberController.createMember);

router.get("/", protect, agencyMemberController.getMembers);

module.exports = router;