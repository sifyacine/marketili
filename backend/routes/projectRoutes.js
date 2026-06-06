

const express = require("express");
const router  = express.Router();
const c       = require("../controllers/projectController");
const { protect } = require("../middleware/auth");


router.get("/agency/:agencyId/members",            protect, c.getAgencyMembers);
router.get("/agency/:agencyId/flagged-posts",      protect, c.getFlaggedPosts);
router.patch("/agency/:agencyId/flagged-posts/:postId/pitched",             protect, c.markFlaggedAsPitched);
router.patch("/agency/:agencyId/flagged-posts/:postId/send-to-strategist",  protect, c.sendToStrategist);
router.post("/flag-post",                          protect, c.flagPost);
router.get("/member/:memberId/tasks",              protect, c.getMemberTasks);
router.get("/member/:memberId/projects",           protect, c.getMemberProjects);
router.get("/client/:clientId",                    protect, c.getClientProjects);
router.get("/team/:teamId/members",                protect, c.getTeamMembers);
router.get("/team/:teamId",                        protect, c.getTeamProjects);


router.get("/agency/:agencyId",                              protect, c.getAgencyProjects);
router.post("/",                                             protect, c.createProject);
router.get("/:projectId/history",                            protect, c.getProjectHistory);
router.get("/:projectId",                                    protect, c.getProject);
router.patch("/:projectId",                                  protect, c.updateProject);
router.post("/:projectId/assign",                            protect, c.assignMember);
router.get("/:projectId/tasks",                              protect, c.getProjectTasks);
router.post("/:projectId/tasks",                             protect, c.createTask);
router.patch("/:projectId/tasks/:taskId",                    protect, c.updateTask);
router.post("/:projectId/tasks/:taskId/comments",            protect, c.addTaskComment);
router.post("/:projectId/deliverables",                      protect, c.addDeliverable);
router.get("/:projectId/deliverables",                       protect, c.getDeliverables);
router.patch("/:projectId/deliverables/:deliverableId",      protect, c.updateDeliverable);
router.post("/:projectId/notes",                             protect, c.addNote);

module.exports = router;