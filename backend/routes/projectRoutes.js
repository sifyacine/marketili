const express = require("express");
const router  = express.Router();
const c       = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

// ── Project CRUD ──
router.post("/",                                   protect, c.createProject);
router.get("/agency/:agencyId",                    protect, c.getAgencyProjects);
router.get("/:projectId",                          protect, c.getProject);
router.post("/:projectId/assign",                  protect, c.assignMember);
router.post("/:projectId/tasks",                   protect, c.createTask);
router.patch("/:projectId/tasks/:taskId",          protect, c.updateTaskStatus);

// ── Agency-specific ──
router.get("/agency/:agencyId/members",            protect, c.getAgencyMembers);
router.get("/agency/:agencyId/flagged-posts",      protect, c.getFlaggedPosts);
router.patch("/agency/:agencyId/flagged-posts/:postId/pitched", protect, c.markFlaggedAsPitched);
router.post("/flag-post",                          protect, c.flagPost);

// ── Worker tasks ──
router.get("/member/:memberId/tasks",              protect, c.getMemberTasks);

module.exports = router;