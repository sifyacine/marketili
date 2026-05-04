const Project = require("../models/Project");

/**
 * Helper — recalculate project progress
 */
const calculateProgress = (project) => {
  const total = project.tasks.length;
  if (total === 0) return 0;

  const done = project.tasks.filter(t => t.status === "done").length;
  return Math.round((done / total) * 100);
};

/**
 * CREATE PROJECT (called when pitch accepted)
 */
exports.createProject = async (req, res) => {
  try {
    const { postId, pitchId, clientId, providerType, providerId, title, deadline } = req.body;

    const project = await Project.create({
      post: postId,
      pitch: pitchId,
      client: clientId,
      providerType,
      title,
      deadline,

      ...(providerType === "Agency" && { providerAgency: providerId }),
      ...(providerType === "Team" && { providerTeam: providerId }),
      ...(providerType === "Freelancer" && { providerFreelancer: providerId }),

      projectStatus: "active",
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ASSIGN MEMBER TO PROJECT
 */
exports.assignMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberType, memberId, memberName, role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.assignedMembers.push({
      memberType,
      memberId,
      memberName,
      role,
    });

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE TASK
 */
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, dueDate, priority } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.tasks.push({
      title,
      description,
      assignedTo,
      dueDate,
      priority,
    });

    project.progress = calculateProgress(project);

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE TASK STATUS
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;

    project.progress = calculateProgress(project);

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};