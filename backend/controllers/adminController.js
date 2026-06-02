const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");
const Freelancer   = require("../models/Freelancer");
const Admin        = require("../models/Admin");
const Post         = require("../models/Post");
const Pitch        = require("../models/Pitch");
const Project      = require("../models/Project");
const OptionsList  = require("../models/OptionsList");
const ActivityLog  = require("../models/ActivityLog");
const logActivity  = require("../utils/logActivity");
const adController = require("./adController");

const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });

// ─────────────────────────────────────────────
// GET ALL USERS  GET /admin/users
// ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let results = [];

    const matchSearch = () =>
      search ? {
        $or: [
          { firstName:  { $regex: search, $options: "i" } },
          { lastName:   { $regex: search, $options: "i" } },
          { email:      { $regex: search, $options: "i" } },
          { agencyName: { $regex: search, $options: "i" } },
          { teamName:   { $regex: search, $options: "i" } },
        ],
      } : {};

    if (!role || role === "client")       results.push(...(await Client.find(matchSearch()).select("-password")).map(u => ({ ...u.toObject(), _roleLabel: "client" })));
    if (!role || role === "agency")       results.push(...(await Agency.find(matchSearch()).select("-password")).map(u => ({ ...u.toObject(), _roleLabel: "agency" })));
    if (!role || role === "agency_member") results.push(...(await AgencyMember.find(matchSearch()).select("-password")).map(u => ({ ...u.toObject(), _roleLabel: "agency_member" })));
    if (!role || role === "team")         results.push(...(await Team.find(matchSearch()).select("-password")).map(u => ({ ...u.toObject(), _roleLabel: "team" })));
    if (!role || role === "team_member")  results.push(...(await TeamMember.find(matchSearch()).select("-password")).map(u => ({ ...u.toObject(), _roleLabel: "team_member" })));
    if (!role || role === "freelancer")   results.push(...(await Freelancer.find(matchSearch()).select("-password")).map(u => ({ ...u.toObject(), _roleLabel: "freelancer" })));

    return ok(res, { users: results, total: results.length });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// TOGGLE USER  PATCH /admin/users/:role/:id/toggle
// ─────────────────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id, role } = req.params;
    const MODEL_MAP = {
      client: Client, agency: Agency, agency_member: AgencyMember,
      team: Team, team_member: TeamMember, freelancer: Freelancer, admin: Admin,
    };
    const Model = MODEL_MAP[role];
    if (!Model) return fail(res, "Rôle invalide");

    const user = await Model.findById(id);
    if (!user) return fail(res, "Utilisateur introuvable", 404);

    user.isActive = !user.isActive;
    await user.save();
    const userName = user.firstName ? `${user.firstName} ${user.lastName}` : (user.agencyName || user.teamName || user.email || id);
    logActivity({
      actorId: req.user._id, actorRole: "admin", actorName: "Admin",
      actionType: user.isActive ? "user_enabled" : "user_disabled",
      targetId: user._id, targetType: "User",
      description: `Compte ${user.isActive ? "activé" : "désactivé"} : ${userName} (${role})`,
    });
    return ok(res, { isActive: user.isActive });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// GET STATS  GET /admin/stats
// ─────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const now      = new Date();
    const weekAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      clientCount, agencyCount, teamCount, freelancerCount,
      agencyMemberCount, teamMemberCount,
      postTotal, postOpen, postInProgress, postClosed,
      pitchTotal, pitchPending, pitchAccepted, pitchRejected,
      projectTotal, projectActive, projectCompleted, projectCancelled,
      newThisWeek, newThisMonth,
      postsThisWeek, postsThisMonth,
    ] = await Promise.all([
      Client.countDocuments(),
      Agency.countDocuments(),
      Team.countDocuments(),
      Freelancer.countDocuments(),
      AgencyMember.countDocuments(),
      TeamMember.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: "open" }),
      Post.countDocuments({ status: "in_progress" }),
      Post.countDocuments({ status: "closed" }),
      Pitch.countDocuments(),
      Pitch.countDocuments({ status: "pending" }),
      Pitch.countDocuments({ status: "accepted" }),
      Pitch.countDocuments({ status: "rejected" }),
      Project.countDocuments(),
      Project.countDocuments({ projectStatus: "active" }),
      Project.countDocuments({ projectStatus: "completed" }),
      Project.countDocuments({ projectStatus: "cancelled" }),
      Client.countDocuments({ createdAt: { $gte: weekAgo } }),
      Client.countDocuments({ createdAt: { $gte: monthAgo } }),
      Post.countDocuments({ createdAt: { $gte: weekAgo } }),
      Post.countDocuments({ createdAt: { $gte: monthAgo } }),
    ]);

    return ok(res, {
      users: {
        total: clientCount + agencyCount + teamCount + freelancerCount,
        client: clientCount, agency: agencyCount, team: teamCount,
        freelancer: freelancerCount, agencyMember: agencyMemberCount,
        teamMember: teamMemberCount,
      },
      posts:    { total: postTotal, open: postOpen, inProgress: postInProgress, closed: postClosed },
      pitches:  { total: pitchTotal, pending: pitchPending, accepted: pitchAccepted, rejected: pitchRejected },
      projects: { total: projectTotal, active: projectActive, completed: projectCompleted, cancelled: projectCancelled },
      activity: {
        newClientsThisWeek: newThisWeek, newClientsThisMonth: newThisMonth,
        postsThisWeek, postsThisMonth,
      },
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// GET ADMIN POSTS  GET /admin/posts
// ─────────────────────────────────────────────
exports.getAdminPosts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("client", "firstName lastName companyName accountType email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Attach pitch count per post
    const postIds = posts.map(p => p._id);
    const pitchCounts = await Pitch.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(pitchCounts.map(pc => [pc._id.toString(), pc.count]));

    const enriched = posts.map(p => ({
      ...p,
      pitchCount: countMap[p._id.toString()] || 0,
    }));

    return ok(res, { posts: enriched, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// REMOVE POST  PATCH /admin/posts/:id/remove
// ─────────────────────────────────────────────
exports.removePost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    post.status    = "closed";
    post.adminNote = reason || "Retiré par un administrateur";
    await post.save();

    logActivity({
      actorId: req.user._id, actorRole: "admin", actorName: "Admin",
      actionType: "post_removed", targetId: post._id, targetType: "Post",
      description: `Post retiré : "${post.title}" — ${reason || "sans raison"}`,
    });

    return ok(res, { post });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// REACTIVATE POST  PATCH /admin/posts/:id/reactivate
// ─────────────────────────────────────────────
exports.reactivatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    const prevStatus = post.status;
    post.status    = "open";
    post.adminNote = "";
    await post.save();

    logActivity({
      actorId: req.user._id, actorRole: "admin", actorName: "Admin",
      actionType: "post_reactivated", targetId: post._id, targetType: "Post",
      description: `Post réactivé : "${post.title}" (était: ${prevStatus})`,
    });

    return ok(res, { post, prevStatus });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// GET RECENT ACTIVITY  GET /admin/activity
// ─────────────────────────────────────────────
exports.getRecentActivity = async (req, res) => {
  try {
    const [recentClients, recentAgencies, recentTeams, recentFreelancers, recentPosts, recentPitches] =
      await Promise.all([
        Client.find().sort({ createdAt: -1 }).limit(5).select("firstName lastName email createdAt").lean(),
        Agency.find().sort({ createdAt: -1 }).limit(3).select("agencyName email createdAt").lean(),
        Team.find().sort({ createdAt: -1 }).limit(3).select("teamName email createdAt").lean(),
        Freelancer.find().sort({ createdAt: -1 }).limit(3).select("firstName lastName email createdAt").lean(),
        Post.find().sort({ createdAt: -1 }).limit(8)
          .populate("client", "firstName lastName companyName accountType")
          .select("title status createdAt client").lean(),
        Pitch.find().sort({ createdAt: -1 }).limit(8)
          .populate("post", "title")
          .select("pitchType status createdAt post senderFreelancer senderAgency senderTeam").lean(),
      ]);

    const registrations = [
      ...recentClients.map(u => ({ type: "client", name: `${u.firstName} ${u.lastName}`, email: u.email, createdAt: u.createdAt })),
      ...recentAgencies.map(u => ({ type: "agency", name: u.agencyName, email: u.email, createdAt: u.createdAt })),
      ...recentTeams.map(u => ({ type: "team", name: u.teamName, email: u.email, createdAt: u.createdAt })),
      ...recentFreelancers.map(u => ({ type: "freelancer", name: `${u.firstName} ${u.lastName}`, email: u.email, createdAt: u.createdAt })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    return ok(res, { registrations, posts: recentPosts, pitches: recentPitches });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// OPTIONS CRUD
// GET /admin/options/:key
// POST /admin/options/:key/add  { value }
// DELETE /admin/options/:key/:value
// ─────────────────────────────────────────────
exports.getOptions = async (req, res) => {
  try {
    const { key } = req.params;
    const doc = await OptionsList.findOne({ key });
    return ok(res, { key, values: doc?.values || [], label: doc?.label || key });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.addOptionValue = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, label } = req.body;
    if (!value?.trim()) return fail(res, "Valeur requise");

    const doc = await OptionsList.findOneAndUpdate(
      { key },
      { $addToSet: { values: value.trim() }, $setOnInsert: { label: label || key } },
      { upsert: true, new: true }
    );
    return ok(res, { key, values: doc.values });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.deleteOptionValue = async (req, res) => {
  try {
    const { key, value } = req.params;
    const doc = await OptionsList.findOneAndUpdate(
      { key },
      { $pull: { values: decodeURIComponent(value) } },
      { new: true }
    );
    return ok(res, { key, values: doc?.values || [] });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.getAllOptions = async (req, res) => {
  try {
    const docs = await OptionsList.find().lean();
    return ok(res, { options: docs });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// ACTIVITY LOG  GET /admin/activity
// ─────────────────────────────────────────────
exports.getActivityLog = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 30;
    const filter = {};
    if (req.query.adminOnly === "true") {
      filter.actionType = { $in: ["post_removed", "post_reactivated"] };
    } else if (req.query.actionType) {
      filter.actionType = req.query.actionType;
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);
    return ok(res, { logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// ADS  (proxy to adController)
// ─────────────────────────────────────────────
exports.getAdminAds = adController.getAdminAds;
exports.createAd    = adController.createAd;
exports.updateAd    = adController.updateAd;
exports.toggleAd    = adController.toggleAd;
exports.deleteAd    = adController.deleteAd;
