const Project      = require("../models/Project");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");

// ── Helper ──
const calculateProgress = (project) => {
  const total = project.tasks.length;
  if (total === 0) return 0;
  const done = project.tasks.filter(t => t.status === "done").length;
  return Math.round((done / total) * 100);
};

// ─────────────────────────────────────────────
// CREATE PROJECT  POST /api/projects
// ─────────────────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const { postId, pitchId, clientId, providerType, providerId, title, deadline } = req.body;

    const project = await Project.create({
      post: postId, pitch: pitchId, client: clientId,
      providerType, title, deadline,
      projectStatus: "active",
      ...(providerType === "Agency"     && { providerAgency: providerId }),
      ...(providerType === "Team"       && { providerTeam: providerId }),
      ...(providerType === "Freelancer" && { providerFreelancer: providerId }),
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET AGENCY PROJECTS  GET /api/projects/agency/:agencyId
// ─────────────────────────────────────────────
exports.getAgencyProjects = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { status } = req.query;

    const filter = { providerAgency: agencyId };
    if (status) filter.projectStatus = status;

    const projects = await Project.find(filter)
      .populate("client", "firstName lastName companyName accountType")
      .populate("post",   "title categories budget")
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET SINGLE PROJECT  GET /api/projects/:projectId
// ─────────────────────────────────────────────
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("client", "firstName lastName companyName accountType avatar")
      .populate("post",   "title categories budget description");

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// ASSIGN MEMBER  POST /api/projects/:projectId/assign
// ─────────────────────────────────────────────
exports.assignMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberType, memberId, memberName, role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Avoid duplicates
    const alreadyAssigned = project.assignedMembers.some(
      m => m.memberId.toString() === memberId
    );
    if (!alreadyAssigned) {
      project.assignedMembers.push({ memberType, memberId, memberName, role });
      await project.save();
    }

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// CREATE TASK  POST /api/projects/:projectId/tasks
// ─────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, dueDate, priority } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.tasks.push({ title, description, assignedTo, dueDate, priority });
    project.progress = calculateProgress(project);
    await project.save();

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE TASK  PATCH /api/projects/:projectId/tasks/:taskId
// ─────────────────────────────────────────────
exports.updateTaskStatus = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updates = req.body; // status, priority, dueDate, etc.

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, updates);
    project.progress = calculateProgress(project);
    await project.save();

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET AGENCY MEMBERS  GET /api/projects/agency/:agencyId/members
// ─────────────────────────────────────────────
exports.getAgencyMembers = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const members = await AgencyMember.find({ agency: agencyId, isActive: true })
      .select("firstName lastName jobTitle email avatar isActive");
    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// FLAG POST (commercial)  POST /api/projects/flag-post
// ─────────────────────────────────────────────
exports.flagPost = async (req, res) => {
  try {
    const { agencyId, postId, memberId, memberName, note } = req.body;

    const agency = await Agency.findById(agencyId);
    if (!agency) return res.status(404).json({ message: "Agency not found" });

    // Avoid duplicate flags of same post
    const alreadyFlagged = agency.flaggedPosts.some(
      f => f.post.toString() === postId
    );
    if (alreadyFlagged) {
      return res.status(400).json({ success: false, message: "Post déjà signalé" });
    }

    agency.flaggedPosts.push({
      post: postId, flaggedBy: memberId,
      flaggedByName: memberName, note,
    });
    await agency.save();

    res.json({ success: true, message: "Post signalé au directeur" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET FLAGGED POSTS  GET /api/projects/agency/:agencyId/flagged-posts
// ─────────────────────────────────────────────
exports.getFlaggedPosts = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const agency = await Agency.findById(agencyId)
      .populate("flaggedPosts.post", "title description categories budget deadline status")
      .populate("flaggedPosts.flaggedBy", "firstName lastName jobTitle");

    if (!agency) return res.status(404).json({ message: "Agency not found" });

    res.json({ success: true, flaggedPosts: agency.flaggedPosts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// MARK FLAGGED POST AS PITCHED  PATCH /api/projects/agency/:agencyId/flagged-posts/:postId/pitched
// ─────────────────────────────────────────────
exports.markFlaggedAsPitched = async (req, res) => {
  try {
    const { agencyId, postId } = req.params;
    const agency = await Agency.findById(agencyId);
    if (!agency) return res.status(404).json({ message: "Agency not found" });

    const flag = agency.flaggedPosts.find(f => f.post.toString() === postId);
    if (!flag) return res.status(404).json({ message: "Flagged post not found" });

    flag.pitched = true;
    await agency.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET WORKER TASKS  GET /api/projects/member/:memberId/tasks
// ─────────────────────────────────────────────
exports.getMemberTasks = async (req, res) => {
  try {
    const { memberId } = req.params;

    const projects = await Project.find({
      "tasks.assignedTo.memberId": memberId,
    }).select("title tasks deadline projectStatus");

    // Flatten tasks assigned to this member with their project context
    const tasks = [];
    projects.forEach(proj => {
      proj.tasks.forEach(task => {
        const isAssigned = task.assignedTo.some(
          a => a.memberId.toString() === memberId
        );
        if (isAssigned) {
          tasks.push({
            ...task.toObject(),
            projectId:    proj._id,
            projectTitle: proj.title,
          });
        }
      });
    });

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};