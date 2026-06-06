

const Pitch      = require("../models/Pitch");
const Project    = require("../models/Project");
const AgencyMember = require("../models/AgencyMember");
const mongoose   = require("mongoose");


exports.getAgencyAnalytics = async (req, res) => {
  try {
    const agencyId = new mongoose.Types.ObjectId(req.params.agencyId);
    const now = new Date();

    
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString("fr-FR", { month: "short", year: "2-digit" }), start: d });
    }
    const rangeStart = months[0].start;

    
    const pitches = await Pitch.find({ senderAgency: agencyId })
      .select("status createdAt").lean();

    const pitchTotal    = pitches.length;
    const pitchAccepted = pitches.filter(p => p.status === "accepted").length;
    const pitchRejected = pitches.filter(p => p.status === "rejected").length;
    const pitchPending  = pitches.filter(p => p.status === "pending").length;
    const pitchWithdrawn= pitches.filter(p => p.status === "withdrawn").length;
    const winRate       = pitchTotal > 0 ? Math.round((pitchAccepted / pitchTotal) * 100) : 0;

    const pitchesPerMonth = months.map(m => {
      const end = new Date(m.start.getFullYear(), m.start.getMonth() + 1, 1);
      return {
        label: m.label,
        count: pitches.filter(p => new Date(p.createdAt) >= m.start && new Date(p.createdAt) < end).length,
      };
    });

    
    const projects = await Project.find({ providerAgency: agencyId })
      .select("projectStatus createdAt agreedPrice tasks assignedMembers deadline").lean();

    const projectTotal     = projects.length;
    const projectCompleted = projects.filter(p => p.projectStatus === "completed").length;
    const projectActive    = projects.filter(p => p.projectStatus === "active").length;
    const projectPending   = projects.filter(p => p.projectStatus === "pending").length;
    const projectCancelled = projects.filter(p => p.projectStatus === "cancelled").length;
    const projectInReview  = projects.filter(p => p.projectStatus === "in_review").length;
    const completionRate   = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0;

    const projectsPerMonth = months.map(m => {
      const end = new Date(m.start.getFullYear(), m.start.getMonth() + 1, 1);
      return {
        label: m.label,
        count: projects.filter(p => new Date(p.createdAt) >= m.start && new Date(p.createdAt) < end).length,
      };
    });

    
    const totalRevenue = projects
      .filter(p => p.projectStatus === "completed" && p.agreedPrice?.amount)
      .reduce((sum, p) => sum + (p.agreedPrice.amount || 0), 0);

    const revenuePerMonth = months.map(m => {
      const end = new Date(m.start.getFullYear(), m.start.getMonth() + 1, 1);
      return {
        label: m.label,
        amount: projects
          .filter(p => p.projectStatus === "completed" && p.agreedPrice?.amount
            && new Date(p.createdAt) >= m.start && new Date(p.createdAt) < end)
          .reduce((sum, p) => sum + (p.agreedPrice.amount || 0), 0),
      };
    });

    
    const allTasks = projects.flatMap(p => p.tasks || []);
    const taskTotal     = allTasks.length;
    const taskTodo      = allTasks.filter(t => t.status === "todo").length;
    const taskInProgress= allTasks.filter(t => t.status === "in_progress").length;
    const taskInReview  = allTasks.filter(t => t.status === "in_review").length;
    const taskDone      = allTasks.filter(t => t.status === "done").length;
    const taskOverdue   = allTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== "done").length;

    
    const members = await AgencyMember.find({ agency: agencyId })
      .select("firstName lastName jobTitle").lean();

    const memberStats = members.map(m => {
      const assigned = allTasks.filter(t =>
        (t.assignedTo || []).some(a => String(a.memberId) === String(m._id)));
      const done = assigned.filter(t => t.status === "done").length;
      const overdue = assigned.filter(t =>
        t.dueDate && new Date(t.dueDate) < now && t.status !== "done").length;
      return { _id: m._id, name: `${m.firstName} ${m.lastName}`, jobTitle: m.jobTitle,
        total: assigned.length, done, overdue };
    }).sort((a, b) => b.total - a.total).slice(0, 10);

    res.json({
      success: true,
      pitches: {
        total: pitchTotal, accepted: pitchAccepted, rejected: pitchRejected,
        pending: pitchPending, withdrawn: pitchWithdrawn, winRate,
        perMonth: pitchesPerMonth,
      },
      projects: {
        total: projectTotal, completed: projectCompleted, active: projectActive,
        pending: projectPending, cancelled: projectCancelled, inReview: projectInReview,
        completionRate, perMonth: projectsPerMonth,
      },
      tasks: {
        total: taskTotal, todo: taskTodo, inProgress: taskInProgress,
        inReview: taskInReview, done: taskDone, overdue: taskOverdue,
      },
      revenue: { total: totalRevenue, perMonth: revenuePerMonth },
      members: memberStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
