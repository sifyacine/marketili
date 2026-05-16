// backend/controllers/profileController.js

const Agency      = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Freelancer  = require("../models/Freelancer");
const Team        = require("../models/Team");
const Client      = require("../models/Client");
const Project     = require("../models/Project");
const ProfilePost = require("../models/ProfilePost");

const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });

const SAFE_SELECT = "-password -refreshToken";

const MODEL_MAP = {
  agency:     Agency,
  freelancer: Freelancer,
  team:       Team,
  client:     Client,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getCompletedProjects = async (role, id) => {
  const field = role === "agency"     ? "providerAgency"     :
                role === "team"       ? "providerTeam"       :
                role === "freelancer" ? "providerFreelancer" : null;
  if (!field) return 0;
  return Project.countDocuments({ [field]: id, projectStatus: "completed" });
};

// ─────────────────────────────────────────────────────────────
// GET PUBLIC PROFILE  GET /api/profile/:role/:id
// ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const { role, id } = req.params;
    const Model = MODEL_MAP[role];
    if (!Model) return fail(res, "Rôle non supporté", 400);

    const doc = await Model.findById(id).select(SAFE_SELECT).lean();
    if (!doc) return fail(res, "Profil introuvable", 404);

    const completedProjects = await getCompletedProjects(role, id);

    // For agencies: populate member count from the members array
    const membersCount = Array.isArray(doc.members) ? doc.members.length : undefined;

    return ok(res, { profile: { ...doc, completedProjects, membersCount } });
  } catch (err) {
    console.error("getProfile:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// EDIT OWN PROFILE  PATCH /api/profile/me
// Protected — req.user identifies who
// ─────────────────────────────────────────────────────────────
const ALLOWED_FIELDS = {
  agency:     ["bio", "logo", "specialties", "portfolioItems", "website", "phone", "address"],
  freelancer: ["bio", "avatar", "skills", "categories", "socialLinks", "followersCount"],
  client:     ["bio", "avatar", "industry", "location"],
  team:       ["bio", "avatar", "specialties", "portfolioItems", "website"],
  agency_member: ["bio", "avatar", "skills", "phone"],
};

exports.updateProfile = async (req, res) => {
  try {
    const role  = req.user.role;
    const Model = MODEL_MAP[role] || (role === "agency_member" ? AgencyMember : null);
    if (!Model) return fail(res, "Rôle non supporté", 400);

    const allowed = ALLOWED_FIELDS[role] || [];
    const updates = {};
    allowed.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (Object.keys(updates).length === 0)
      return fail(res, "Aucun champ modifiable fourni");

    const updated = await Model.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(SAFE_SELECT);

    if (!updated) return fail(res, "Profil introuvable", 404);
    return ok(res, { profile: updated });
  } catch (err) {
    console.error("updateProfile:", err);
    return fail(res, "Erreur serveur: " + err.message, 500);
  }
};

// ─────────────────────────────────────────────────────────────
// BROWSE PROVIDERS  GET /api/providers
// type=agency|team|freelancer|all, specialty, region, search, page, limit
// ─────────────────────────────────────────────────────────────
exports.browseProviders = async (req, res) => {
  try {
    const { type = "all", specialty, region, search, page = 1, limit = 12 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const buildFilter = (extraFields = []) => {
      const f = { isActive: true };
      if (specialty) f.specialties = specialty;
      if (region) {
        f.$or = [
          { "address.region": { $regex: region, $options: "i" } },
          { "location.region": { $regex: region, $options: "i" } },
        ];
      }
      if (search) {
        const re = { $regex: search, $options: "i" };
        f.$or = [
          ...extraFields.map(field => ({ [field]: re })),
          { bio: re },
          { specialties: re },
        ];
      }
      return f;
    };

    const run = async (Model, extraFields, select) => {
      const filter = buildFilter(extraFields);
      const [docs, total] = await Promise.all([
        Model.find(filter).select(select).sort({ updatedAt: -1 })
          .skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
        Model.countDocuments(filter),
      ]);
      return { docs, total };
    };

    let results = [];
    let total   = 0;

    if (type === "agency" || type === "all") {
      const r = await run(Agency, ["agencyName", "directorFirstName"],
        "agencyName directorFirstName directorLastName bio logo specialties address members updatedAt");
      results.push(...r.docs.map(d => ({ ...d, _role: "agency" })));
      total += r.total;
    }
    if (type === "team" || type === "all") {
      const r = await run(Team, ["teamName", "leadFirstName"],
        "teamName leadFirstName leadLastName bio avatar specialties address members updatedAt");
      results.push(...r.docs.map(d => ({ ...d, _role: "team" })));
      total += r.total;
    }
    if (type === "freelancer" || type === "all") {
      const r = await run(Freelancer, ["firstName", "lastName"],
        "firstName lastName bio avatar skills categories location followersCount updatedAt");
      results.push(...r.docs.map(d => ({ ...d, _role: "freelancer" })));
      total += r.total;
    }

    // Shuffle by updatedAt when type=all
    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return ok(res, {
      providers: results.slice(0, limitNum),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("browseProviders:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE PROFILE POST  POST /api/profile/posts
// ─────────────────────────────────────────────────────────────
exports.createProfilePost = async (req, res) => {
  try {
    const { content, media, postType } = req.body;
    if (!content?.trim() && (!media || media.length === 0))
      return fail(res, "Contenu ou média requis");

    const user = req.user;
    const authorName =
      user.agencyName || user.teamName ||
      (user.firstName ? `${user.firstName} ${user.lastName}` : null) ||
      "Anonyme";

    const post = await ProfilePost.create({
      author:       user._id,
      authorRole:   user.role,
      authorName,
      authorAvatar: user.logo || user.avatar || null,
      content:      content?.trim(),
      media:        media || [],
      postType:     postType || "update",
    });

    return ok(res, { post }, 201);
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// GET PROFILE POSTS  GET /api/profile/:role/:id/posts
// ─────────────────────────────────────────────────────────────
exports.getProfilePosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(30, parseInt(limit, 10));

    const [posts, total] = await Promise.all([
      ProfilePost.find({ author: id })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ProfilePost.countDocuments({ author: id }),
    ]);

    return ok(res, { posts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE PROFILE POST  DELETE /api/profile/posts/:id
// ─────────────────────────────────────────────────────────────
exports.deleteProfilePost = async (req, res) => {
  try {
    const post = await ProfilePost.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);
    if (post.author.toString() !== req.user._id.toString())
      return fail(res, "Non autorisé", 403);
    await post.deleteOne();
    return ok(res, { message: "Post supprimé" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};
