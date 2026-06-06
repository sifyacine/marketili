

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");
const Project      = require("../models/Project");


router.use(protect);


router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, category } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === "true") query.isRead = false;
    if (category && category !== "all") query.category = category;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.json({ success: true, notifications, total, unreadCount,
      pages: Math.ceil(total / limitNum), page: pageNum });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get("/check-deadlines", async (req, res) => {
  try {
    const userId   = req.user._id;
    const role     = req.userRole;
    const now      = new Date();
    const in3Days  = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const ago24h   = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    
    let projectFilter = {};
    if (role === "client")           projectFilter = { client: userId };
    else if (role === "agency")      projectFilter = { providerAgency: userId };
    else if (role === "team")        projectFilter = { providerTeam: userId };
    else if (role === "freelancer")  projectFilter = { "assignedMembers.memberId": userId };
    else if (role === "agency_member" || role === "team_member") {
      projectFilter = { "assignedMembers.memberId": userId };
    }

    const activeFilter = { ...projectFilter, projectStatus: { $nin: ["completed", "cancelled"] } };
    const projects = await Project.find(activeFilter).select("title deadline tasks").lean();

    let created = 0;

    for (const proj of projects) {
      
      if (proj.deadline && proj.deadline > now && proj.deadline <= in3Days) {
        const already = await Notification.findOne({
          recipient: userId, type: "deadline_approaching",
          "metadata.projectId": proj._id, createdAt: { $gte: ago24h },
        });
        if (!already) {
          await Notification.notify({
            recipient: userId, recipientRole: role,
            recipientModel: roleToModel(role),
            type: "deadline_approaching", category: "deadlines",
            title: `Échéance proche : ${proj.title}`,
            body: `Le projet "${proj.title}" arrive à échéance dans moins de 3 jours.`,
            link: `/dashboard/${rolePath(role)}/projects`,
            metadata: { projectId: proj._id },
          });
          created++;
        }
      }

      
      for (const task of (proj.tasks || [])) {
        if (!task.dueDate || task.status === "done") continue;
        const due = new Date(task.dueDate);

        if (due > now && due <= in3Days) {
          const alreadyTask = await Notification.findOne({
            recipient: userId, type: "deadline_approaching",
            "metadata.projectId": proj._id, title: { $regex: task.title, $options: "i" },
            createdAt: { $gte: ago24h },
          });
          if (!alreadyTask) {
            await Notification.notify({
              recipient: userId, recipientRole: role,
              recipientModel: roleToModel(role),
              type: "deadline_approaching", category: "deadlines",
              title: `Tâche urgente : ${task.title}`,
              body: `La tâche "${task.title}" dans le projet "${proj.title}" arrive à échéance bientôt.`,
              link: `/dashboard/${rolePath(role)}/tasks`,
              metadata: { projectId: proj._id },
            });
            created++;
          }
        } else if (due < now) {
          
          const alreadyOverdue = await Notification.findOne({
            recipient: userId, type: "task_overdue",
            "metadata.projectId": proj._id, title: { $regex: task.title, $options: "i" },
            createdAt: { $gte: ago24h },
          });
          if (!alreadyOverdue) {
            await Notification.notify({
              recipient: userId, recipientRole: role,
              recipientModel: roleToModel(role),
              type: "task_overdue", category: "deadlines",
              title: `Tâche en retard : ${task.title}`,
              body: `La tâche "${task.title}" dans le projet "${proj.title}" est en retard.`,
              link: `/dashboard/${rolePath(role)}/tasks`,
              metadata: { projectId: proj._id },
            });
            created++;
          }
        }
      }
    }

    res.json({ success: true, created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function roleToModel(role) {
  const map = {
    client: "Client", agency: "Agency", team: "Team", freelancer: "Freelancer",
    agency_member: "AgencyMember", team_member: "TeamMember",
  };
  return map[role] || "Client";
}

function rolePath(role) {
  const map = {
    client: "client", agency: "agency", team: "team", freelancer: "freelancer",
    agency_member: "agency", team_member: "team",
  };
  return map[role] || "client";
}


router.get("/unread-count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.patch("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: "Notification introuvable" });
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.patch("/mark-all-read", async (req, res) => {
  try {
    await Notification.markAllRead(req.user._id);
    res.json({ success: true, message: "Toutes les notifications marquées comme lues" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: "Notification supprimée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;