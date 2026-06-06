const Project      = require("../models/Project");
const PersonalNote = require("../models/PersonalNote");


const dlColor = (date) => {
  if (!date) return "#9e9e9e";
  const days = Math.ceil((new Date(date) - new Date()) / 86400000);
  if (days > 14) return "#22c55e";
  if (days >= 7)  return "#f59e0b";
  if (days >= 3)  return "#f97316";
  return "#ef4444";
};


exports.getCalendarEvents = async (req, res) => {
  try {
    const { role, id } = req.params;
    const events = [];

    
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

        
        if (role !== "client") {
          (p.tasks || []).forEach(t => {
            if (!t.dueDate) return;
            
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

    
    if (["agency_member", "team_member"].includes(role)) {
      const projects = await Project.find({ "tasks.assignedTo.memberId": id })
        .select("title tasks")
        .lean();

      projects.forEach(p => {
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

    
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, events });
  } catch (err) {
    console.error("calendarController:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
