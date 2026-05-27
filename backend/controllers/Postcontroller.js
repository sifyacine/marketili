const Post        = require("../models/Post");
const Pitch       = require("../models/Pitch");
const logActivity = require("../utils/logActivity");

// Escape special regex characters to prevent ReDoS via user-supplied input
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const pushStatusHistory = (post, newStatus, reason = "") => {
  post.statusHistory.push({ status: newStatus, changedAt: new Date(), reason });
  post.status = newStatus;
};

const ok = (res, data, code = 200) => res.status(code).json({ success: true, ...data });
const fail = (res, message, code = 400) => res.status(code).json({ success: false, message });

// ─────────────────────────────────────────────
// CREATE POST (✅ ONLY CHANGE HERE)
// ─────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    // ✅ FIX: prevent crash if req.body is undefined
    const body = req.body || {};

    const {
      title,
      description,
      objectives,
      budget,
      deadline,
      location,
      categories,
      targetProviders,
      requiredSkills,
      marketingType,
      collaborationType,
      compensationType,
      benefits,
    } = body;

    const clientId     = body.clientId;
    const initiatorType = body.initiatorType; // "Agency" | "Team" | "Freelancer"
    const initiatorId   = body.initiatorId;   // provider's _id

    if (!clientId) return fail(res, "clientId requis");

    if (budget && budget.min !== undefined && budget.max !== undefined) {
      if (Number(budget.min) > Number(budget.max)) {
        return fail(res, "Le budget minimum ne peut pas dépasser le budget maximum");
      }
    }

    // ✅ FIX: safe file handling
    const file = req.file
      ? {
          url: req.file.path,
          originalName: req.file.originalname,
        }
      : null;

    const postData = {
      client: clientId,
      title,
      description,
      objectives,
      budget,
      deadline,
      location,
      categories: categories || [],
      targetProviders: targetProviders || ["all"],
      requiredSkills: requiredSkills || [],
      marketingType,
      collaborationType,
      compensationType,
      benefits,
      file,
    };
    if (initiatorType && initiatorId) {
      postData.initiatedBy = { initiatorType, initiatorId };
      postData.isPublic = false;
      postData.sentTo   = [{ providerType: initiatorType, providerId: initiatorId }];
      const Notification = require("../models/Notification");
      Notification.notify({
        recipient: clientId, recipientRole: "client", recipientModel: "Client",
        type: "system", category: "admin",
        title: "Nouvelle proposition reçue",
        body: `Vous avez reçu une proposition de collaboration de ${body.initiatorName || initiatorType}.`,
        link: "/dashboard/client",
        metadata: { senderId: initiatorId },
      });
    }
    const post = await Post.create(postData);

    logActivity({
      actorId: post.client, actorRole: "client", actorName: String(post.client),
      actionType: "post_created", targetId: post._id, targetType: "Post",
      description: `Post créé : "${post.title}"`,
    });
    return ok(res, { post }, 201);
  } catch (err) {
    console.error("createPost:", err);

    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return fail(res, msgs.join(". "));
    }

    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// KEEP EVERYTHING BELOW EXACTLY THE SAME
// ─────────────────────────────────────────────

const getPosts = async (req, res) => {
  try {
    const {
      status = "open",
      region,
      city,
      country,
      category,
      targetProvider,
      marketingType,
      collaborationType,
      search,
      sort = "deadline",
      order = "asc",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (status !== "all") filter.status = status;

    if (region)  filter["location.region"]  = new RegExp(escapeRegex(region),  "i");
    if (city)    filter["location.city"]    = new RegExp(escapeRegex(city),    "i");
    if (country) filter["location.country"] = new RegExp(escapeRegex(country), "i");

    if (category) filter.categories = { $in: [new RegExp(escapeRegex(category), "i")] };

    if (targetProvider) {
      filter.targetProviders = { $in: [targetProvider, "all"] };
    }

    if (marketingType)    filter.marketingType    = marketingType;
    if (collaborationType) filter.collaborationType = collaborationType;

    if (search) {
      filter.$or = [
        { title:       new RegExp(escapeRegex(search), "i") },
        { description: new RegExp(escapeRegex(search), "i") },
      ];
    }

    const sortObj = {};
    if (sort === "deadline") sortObj.deadline = order === "asc" ? 1 : -1;
    else if (sort === "pitchCount") sortObj["pitches"] = order === "asc" ? 1 : -1;
    else sortObj.createdAt = order === "asc" ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select("-statusHistory -savedBy -sentTo")
        .lean(),
      Post.countDocuments(filter),
    ]);

    return ok(res, {
      posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("getPosts:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const getMyPosts = async (req, res) => {
  try {
    const { clientId, status, page = 1, limit = 20 } = req.query;
    if (!clientId) return fail(res, "clientId requis");

    const filter = { client: clientId };
    if (status && status !== "all") filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(filter),
    ]);

    const postsWithCount = posts.map(p => ({
      ...p,
      pitchCount: p.pitches.length,
      acceptedPitchCount: p.acceptedPitches.length,
    }));

    return ok(res, {
      posts: postsWithCount,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("getMyPosts:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("client", "firstName lastName companyName accountType")
      .lean();

    if (!post) return fail(res, "Post introuvable", 404);
    return ok(res, { post });
  } catch (err) {
    if (err.name === "CastError") return fail(res, "ID invalide", 400);
    console.error("getPost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ✅ KEEP THESE (VERY IMPORTANT)

const updatePost = async (req, res) => {
  try {
    const {
      clientId, title, description, objectives, budget, deadline, location,
      categories, targetProviders,
      requiredSkills, marketingType, collaborationType, compensationType, benefits,
    } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) {
      return fail(res, "Non autorisé", 403);
    }

    if (!["open", "reactivated"].includes(post.status)) {
      return fail(res, "Ce post ne peut plus être modifié dans son état actuel");
    }

    if (budget && budget.min !== undefined && budget.max !== undefined) {
      if (Number(budget.min) > Number(budget.max)) {
        return fail(res, "Le budget minimum ne peut pas dépasser le budget maximum");
      }
    }

    if (title)             post.title             = title;
    if (description)       post.description       = description;
    if (objectives !== undefined) post.objectives = objectives;
    if (budget)            post.budget            = budget;
    if (deadline)          post.deadline          = deadline;
    if (location)          post.location          = location;
    if (categories)        post.categories        = categories;
    if (targetProviders)   post.targetProviders   = targetProviders;
    if (requiredSkills)    post.requiredSkills    = requiredSkills;
    if (marketingType)     post.marketingType     = marketingType;
    if (collaborationType) post.collaborationType = collaborationType;
    if (compensationType)  post.compensationType  = compensationType;
    if (benefits !== undefined) post.benefits     = benefits;

    await post.save();
    return ok(res, { post });
  } catch (err) {
    console.error("updatePost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const closePost = async (req, res) => {
  try {
    const { clientId, reason } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    if (post.status === "closed") return fail(res, "Ce post est déjà fermé");

    const rejectedCount = await Pitch.updateMany(
      { post: post._id, status: "pending" },
      { status: "rejected", rejectionReason: "Post fermé", respondedAt: new Date() }
    );

    pushStatusHistory(post, "closed", reason || "Fermé");
    await post.save();
    logActivity({
      actorId: post.client, actorRole: "client", actorName: String(post.client),
      actionType: "post_closed", targetId: post._id, targetType: "Post",
      description: `Post fermé : "${post.title}"`,
    });
    return ok(res, { post });
  } catch (err) {
    console.error("closePost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const reactivatePost = async (req, res) => {
  try {
    const { clientId } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    pushStatusHistory(post, "reactivated");
    await post.save();

    return ok(res, { post });
  } catch (err) {
    console.error("reactivatePost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const sendPostToProvider = async (req, res) => {
  try {
    const { clientId, providerType, providerId } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    post.sentTo.push({ providerType, providerId, sentAt: new Date() });
    await post.save();

    return ok(res, { message: "Envoyé" });
  } catch (err) {
    console.error("sendPostToProvider:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const deletePost = async (req, res) => {
  try {
    const { clientId } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    if (post.pitches.length > 0) {
      return fail(res, "Impossible de supprimer");
    }

    await post.deleteOne();
    return ok(res, { message: "Supprimé" });
  } catch (err) {
    console.error("deletePost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

module.exports = {
  createPost,
  getPosts,
  getMyPosts,
  getPost,
  updatePost,
  closePost,
  reactivatePost,
  sendPostToProvider,
  deletePost,
};