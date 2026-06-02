const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/freelancerController");

router.get("/:id/collaborations", protect, c.getCollaborations);
router.get("/:id/projects",       protect, c.getFreelancerProjects);
router.get("/:id/pitches",        protect, c.getFreelancerPitches);

module.exports = router;
