const Project      = require("../models/Project");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const TeamMember   = require("../models/TeamMember");
const Notification = require("../models/Notification");

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
      .sort({ deadline: 1 });

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

    // Notify each assigned member
    if (Array.isArray(assignedTo) && assignedTo.length > 0) {
      assignedTo.forEach(a => {
        const isTeam     = a.memberType === "TeamMember";
        const mRole      = isTeam ? "team_member"  : "agency_member";
        const mModel     = isTeam ? "TeamMember"   : "AgencyMember";
        const mPath      = isTeam ? "team"          : "agency";
        Notification.notify({
          recipient: a.memberId, recipientRole: mRole, recipientModel: mModel,
          type: "task_assigned", category: "tasks",
          title: `Tâche assignée : ${title}`,
          body: `Vous avez été assigné à la tâche "${title}" dans le projet "${project.title}".`,
          link: `/dashboard/${mPath}/tasks`,
          metadata: { projectId: project._id },
        });
      });
    }

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE TASK  PATCH /api/projects/:projectId/tasks/:taskId
// ─────────────────────────────────────────────
exports.updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updates = req.body; // status, priority, dueDate, assignedTo, etc.

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const wasNotDone = task.status !== "done";

    // Track handover when assignedTo changes
    if (updates.assignedTo !== undefined) {
      const oldIds = task.assignedTo.map(a => String(a.memberId));
      const newIds = (updates.assignedTo || []).map(a => String(a.memberId));

      const removed = task.assignedTo.filter(a => !newIds.includes(String(a.memberId)));
      removed.forEach(a => {
        const alreadyLogged = (task.previousAssignees || []).some(
          p => String(p.memberId) === String(a.memberId)
        );
        if (!alreadyLogged) {
          task.previousAssignees.push({
            memberId:   a.memberId,
            memberName: a.memberName,
            memberType: a.memberType,
            removedAt:  new Date(),
          });
        }
      });

      // Notify newly added assignees
      const added = (updates.assignedTo || []).filter(a => !oldIds.includes(String(a.memberId)));
      added.forEach(a => {
        const isTeam  = a.memberType === "TeamMember";
        const mRole   = isTeam ? "team_member"  : "agency_member";
        const mModel  = isTeam ? "TeamMember"   : "AgencyMember";
        const mPath   = isTeam ? "team"          : "agency";
        Notification.notify({
          recipient: a.memberId, recipientRole: mRole, recipientModel: mModel,
          type: "task_assigned", category: "tasks",
          title: `Tâche assignée : ${task.title}`,
          body: `Vous avez été assigné à la tâche "${task.title}" dans le projet "${project.title}".`,
          link: `/dashboard/${mPath}/tasks`,
          metadata: { projectId: project._id },
        });
      });
    }

    Object.assign(task, updates);
    project.progress = calculateProgress(project);
    await project.save();

    // Notify agency director when a task is marked done
    if (wasNotDone && updates.status === "done" && project.providerAgency) {
      Notification.notify({
        recipient: project.providerAgency, recipientRole: "agency", recipientModel: "Agency",
        type: "project_milestone", category: "tasks",
        title: `Tâche terminée : ${task.title}`,
        body: `La tâche a été marquée comme terminée dans le projet "${project.title}"`,
        link: `/dashboard/agency/projects`,
        metadata: { projectId: project._id },
      });
    }

    // Notify client if all tasks done and project is now 100%
    if (project.progress === 100 && project.client) {
      Notification.notify({
        recipient: project.client, recipientRole: "client", recipientModel: "Client",
        type: "project_completed", category: "projects",
        title: "Projet terminé",
        body: `Toutes les tâches du projet "${project.title}" sont complètes.`,
        link: `/dashboard/client/projects`,
        metadata: { projectId: project._id },
      });
    }

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET PROJECT TASKS  GET /api/projects/:projectId/tasks
// ─────────────────────────────────────────────
exports.getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).select("tasks");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const sorted = [...project.tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    res.json({ success: true, tasks: sorted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADD TASK COMMENT  POST /api/projects/:projectId/tasks/:taskId/comments
// ─────────────────────────────────────────────
exports.addTaskComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { authorId, authorName, authorRole, text } = req.body;

    if (!text?.trim()) return res.status(400).json({ message: "text requis" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments.push({ authorId, authorName, authorRole, text: text.trim() });
    await project.save();

    res.json({ success: true, task });
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
    const members = await AgencyMember.find({ agency: agencyId, accountStatus: "active" })
      .select("firstName lastName jobTitle email avatar accountStatus");
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

    // Sort by dueDate ascending — no dueDate goes last
    tasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE PROJECT  PATCH /api/projects/:projectId
// ─────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, deadline, projectStatus, agreedPrice, requesterId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (title       !== undefined) project.title       = title;
    if (description !== undefined) project.description = description;
    if (deadline    !== undefined) project.deadline    = deadline;
    if (agreedPrice !== undefined) project.agreedPrice = agreedPrice;

    if (projectStatus && projectStatus !== project.projectStatus) {
      project.projectStatus = projectStatus;
      if (projectStatus === "completed") project.completedAt = new Date();
      project.statusHistory.push({
        status:    projectStatus,
        changedAt: new Date(),
        changedBy: requesterId,
        note:      `Statut mis à jour : ${projectStatus}`,
      });
    }

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADD DELIVERABLE  POST /api/projects/:projectId/deliverables
// ─────────────────────────────────────────────
exports.addDeliverable = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { fileUrl, fileName, description, submittedBy } = req.body;

    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: "fileUrl et fileName requis" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.deliverables.push({ fileUrl, fileName, description, submittedBy });

    // Auto-move to in_review on first deliverable
    if (project.projectStatus === "active") {
      project.projectStatus = "in_review";
      project.statusHistory.push({
        status:    "in_review",
        changedAt: new Date(),
        changedBy: submittedBy,
        note:      "Passé en révision suite à la soumission d'un livrable",
      });
    }

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MEMBER PROJECTS  GET /api/projects/member/:memberId/projects
// ─────────────────────────────────────────────
exports.getMemberProjects = async (req, res) => {
  try {
    const { memberId } = req.params;
    const projects = await Project.find({ "assignedMembers.memberId": memberId })
      .populate("client", "firstName lastName companyName accountType")
      .populate("post",   "title")
      .sort({ deadline: 1 })
      .lean();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET TEAM PROJECTS  GET /api/projects/team/:teamId
// ─────────────────────────────────────────────
exports.getTeamProjects = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status } = req.query;

    const filter = { providerTeam: teamId };
    if (status) filter.projectStatus = status;

    const projects = await Project.find(filter)
      .populate("client", "firstName lastName companyName accountType")
      .populate("post",   "title categories budget")
      .sort({ deadline: 1 });

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET TEAM MEMBERS  GET /api/projects/team/:teamId/members
// ─────────────────────────────────────────────
exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const members = await TeamMember.find({ team: teamId, isActive: true })
      .select("firstName lastName jobTitle email avatar isActive");
    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET CLIENT PROJECTS   GET /api/projects/client/:clientId
// ─────────────────────────────────────────────
exports.getClientProjects = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status } = req.query;

    const filter = { client: clientId };
    if (status && status !== "all") filter.projectStatus = status;

    const projects = await Project.find(filter)
      .populate("providerAgency",     "agencyName")
      .populate("providerTeam",       "teamName")
      .populate("providerFreelancer", "firstName lastName")
      .populate("post",               "title categories")
      .sort({ deadline: 1 }) // closest deadline first
      .lean();

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};