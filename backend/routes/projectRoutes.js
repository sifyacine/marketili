const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

// Create project
router.post("/", projectController.createProject);

// Assign member
router.post("/:projectId/assign", projectController.assignMember);

// Create task
router.post("/:projectId/tasks", projectController.createTask);

// Update task status
router.patch("/:projectId/tasks/:taskId", projectController.updateTaskStatus);

module.exports = router;