const Project      = require("../models/Project");
const PersonalNote = require("../models/PersonalNote");

// Shared deadline color logic (mirrored from frontend util)
const dlColor = (date) => {
  if (!date) return "#9e9e9e";
  const days = Math.ceil((new Date(date) - new Date()) / 86400000);
  if (days > 14) return "#22c55e";
  if (days >= 7)  return "#f59e0b";
  if (days >= 3)  return "#f97316";
  return "#ef4444";
};

// GET /api/calendar/:role/:id
exports.getCalendarEvents = async (req, res) => {
  try {
    const { role, id } = req.params;
    const events = [];

    // ── Projects query by role ──────────────────────────────────────────────
    let projectFilter = null;
    if (role === "client")        projectFilter = { client: id };
    else if (role === "agency")   projectFilter = { providerAgency: id };
    else if (role === "team")     projectFilter = { providerTeam: id };
    else if (role === "freelancer") projectFilter = { providerFreelancer: id };

    if (projectFilter) {
      const projects = await Project.find(projectFilter)
        .select("title deadline projectStatus tasks")
        .lean();

      projects.forEach(p => {
        // Project deadline event
        if (p.deadline) {
          events.push({
            type:      "project",
            title:     p.title,
            date:      p.deadline,
            status:    p.projectStatus,
            projectId: p._id,
            color:     dlColor(p.deadline),
          });
        }

        // Task events (for all roles except client — tasks are provider-side)
        if (role !== "client") {
          (p.tasks || []).forEach(t => {
            if (!t.dueDate) return;
            // For member roles, only their assigned tasks
            if (["agency_member", "team_member"].includes(role)) {
              const isAssigned = (t.assignedTo || []).some(a => a.memberId?.toString() === id);
              if (!isAssigned) return;
            }
            events.push({
              type:      "task",
              title:     t.title,
              date:      t.dueDate,
              status:    t.status,
              priority:  t.priority,
              taskId:    t._id,
              projectId: p._id,
              projectTitle: p.title,
              color:     dlColor(t.dueDate),
            });
          });
        }
      });
    }

    // ── Member roles: tasks only ────────────────────────────────────────────
    if (["agency_member", "team_member"].includes(role)) {
      const projects = await Project.find({ "tasks.assignedTo.memberId": id })
        .select("title tasks")
        .lean();

      projects.forEach(p => {
        (p.tasks || []).forEach(t => {
          if (!t.dueDate) return;
          const isAssigned = (t.assignedTo || []).some(a => a.memberId?.toString() === id);
          if (!isAssigned) return;
          // Avoid duplicates if already added
          const exists = events.some(e => e.taskId?.toString() === t._id?.toString());
          if (!exists) {
            events.push({
              type:         "task",
              title:        t.title,
              date:         t.dueDate,
              status:       t.status,
              priority:     t.priority,
              taskId:       t._id,
              projectId:    p._id,
              projectTitle: p.title,
              color:        dlColor(t.dueDate),
            });
          }
        });
      });
    }

    // ── Freelancer assigned tasks ───────────────────────────────────────────
    if (role === "freelancer") {
      const memberProjects = await Project.find({ "tasks.assignedTo.memberId": id })
        .select("title tasks")
        .lean();

      memberProjects.forEach(p => {
        (p.tasks || []).forEach(t => {
          if (!t.dueDate) return;
          const isAssigned = (t.assignedTo || []).some(a => a.memberId?.toString() === id);
          if (!isAssigned) return;
          const exists = events.some(e => e.taskId?.toString() === t._id?.toString());
          if (!exists) {
            events.push({
              type:         "task",
              title:        t.title,
              date:         t.dueDate,
              status:       t.status,
              priority:     t.priority,
              taskId:       t._id,
              projectId:    p._id,
              projectTitle: p.title,
              color:        dlColor(t.dueDate),
            });
          }
        });
      });
    }

    // ── Personal reminders ──────────────────────────────────────────────────
    const reminders = await PersonalNote.find({
      owner: id, isReminder: true, reminderDate: { $exists: true, $ne: null },
    }).lean();

    reminders.forEach(n => {
      events.push({
        type:   "reminder",
        title:  n.text,
        date:   n.reminderDate,
        noteId: n._id,
        color:  "#7c3aed",
        isDone: n.isDone,
      });
    });

    // Sort by date ascending
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, events });
  } catch (err) {
    console.error("calendarController:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
