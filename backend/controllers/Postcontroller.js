const Post   = require("../models/Post");
const Pitch  = require("../models/Pitch");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Push a status change into the post's history array */
const pushStatusHistory = (post, newStatus, reason = "") => {
  post.statusHistory.push({ status: newStatus, changedAt: new Date(), reason });
  post.status = newStatus;
};

/** Standard success envelope */
const ok = (res, data, code = 200) => res.status(code).json({ success: true, ...data });

/** Standard error envelope */
const fail = (res, message, code = 400) => res.status(code).json({ success: false, message });

// ─────────────────────────────────────────────
// CREATE POST
// POST /api/posts
// Body: { title, description, budget, deadline, location, categories, targetProviders }
// ─────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const {
      title, description, budget, deadline,
      location, categories, targetProviders,
    } = req.body;

    // For now clientId comes from body (Phase 7: will come from req.user._id)
    const clientId = req.body.clientId;
    if (!clientId) return fail(res, "clientId requis");

    const post = await Post.create({
      client: clientId,
      title,
      description,
      budget,
      deadline,
      location,
      categories:      categories      || [],
      targetProviders: targetProviders || ["all"],
    });

    return ok(res, { post }, 201);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map(e => e.message);
      return fail(res, msgs.join(". "));
    }
    console.error("createPost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// GET ALL OPEN POSTS  (browseable by everyone)
// GET /api/posts?status=open&region=Oran&category=Social Media&page=1&limit=10&sort=deadline
// ─────────────────────────────────────────────
const getPosts = async (req, res) => {
  try {
    const {
      status   = "open",
      region,
      city,
      country,
      category,
      targetProvider,
      search,
      sort     = "createdAt",      // createdAt | deadline | pitchCount
      order    = "desc",
      page     = 1,
      limit    = 12,
    } = req.query;

    // ── Build filter object ──
    const filter = {};

    // Status — can pass "all" to get everything (for client's own posts)
    if (status !== "all") filter.status = status;

    // Location filters
    if (region)  filter["location.region"]  = new RegExp(region,  "i");
    if (city)    filter["location.city"]    = new RegExp(city,    "i");
    if (country) filter["location.country"] = new RegExp(country, "i");

    // Category filter
    if (category) filter.categories = { $in: [new RegExp(category, "i")] };

    // Target provider type
    if (targetProvider) {
      filter.targetProviders = { $in: [targetProvider, "all"] };
    }

    // Text search on title + description
    if (search) {
      filter.$or = [
        { title:       new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    // ── Build sort object ──
    const sortObj = {};
    if (sort === "deadline")   sortObj.deadline   = order === "asc" ? 1 : -1;
    else if (sort === "pitchCount") sortObj["pitches"] = order === "asc" ? 1 : -1;
    else                       sortObj.createdAt  = order === "asc" ? 1 : -1;

    // ── Pagination ──
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // ── Query ──
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select("-statusHistory -savedBy -sentTo")  // don't send heavy arrays
        .lean(),                                     // lean() returns plain JS objects, faster
      Post.countDocuments(filter),
    ]);

    return ok(res, {
      posts,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext:    pageNum < Math.ceil(total / limitNum),
        hasPrev:    pageNum > 1,
      },
    });
  } catch (err) {
    console.error("getPosts:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// GET CLIENT'S OWN POSTS
// GET /api/posts/my?clientId=xxx&status=open
// ─────────────────────────────────────────────
const getMyPosts = async (req, res) => {
  try {
    const { clientId, status, page = 1, limit = 20 } = req.query;
    if (!clientId) return fail(res, "clientId requis");

    const filter = { client: clientId };
    if (status && status !== "all") filter.status = status;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        // Populate pitch count (just length of the array)
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Attach pitchCount as a convenience field
    const postsWithCount = posts.map(p => ({
      ...p,
      pitchCount:         p.pitches.length,
      acceptedPitchCount: p.acceptedPitches.length,
    }));

    return ok(res, {
      posts: postsWithCount,
      pagination: {
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("getMyPosts:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// GET SINGLE POST
// GET /api/posts/:id
// ─────────────────────────────────────────────
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("client", "firstName lastName companyName accountType")
      // When populated, only return these fields (not password etc.)
      .lean();

    if (!post) return fail(res, "Post introuvable", 404);

    return ok(res, { post });
  } catch (err) {
    if (err.name === "CastError") return fail(res, "ID invalide", 400);
    console.error("getPost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// UPDATE POST
// PUT /api/posts/:id
// Only owner can update, and only when status is open/reactivated
// ─────────────────────────────────────────────
const updatePost = async (req, res) => {
  try {
    const { clientId, title, description, budget, deadline, location, categories, targetProviders } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    // Ownership check (Phase 7: replace clientId with req.user._id)
    if (post.client.toString() !== clientId) {
      return fail(res, "Non autorisé", 403);
    }

    // Can only edit open or reactivated posts
    if (!["open", "reactivated"].includes(post.status)) {
      return fail(res, "Ce post ne peut plus être modifié dans son état actuel");
    }

    // Apply only provided fields
    if (title)           post.title           = title;
    if (description)     post.description     = description;
    if (budget)          post.budget          = budget;
    if (deadline)        post.deadline        = deadline;
    if (location)        post.location        = location;
    if (categories)      post.categories      = categories;
    if (targetProviders) post.targetProviders = targetProviders;

    await post.save();
    return ok(res, { post });
  } catch (err) {
    console.error("updatePost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// CLOSE POST  (client manually closes)
// PATCH /api/posts/:id/close
// Auto-rejects all remaining pending pitches
// ─────────────────────────────────────────────
const closePost = async (req, res) => {
  try {
    const { clientId, reason } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    if (post.status === "closed") return fail(res, "Ce post est déjà fermé");

    // Auto-reject all remaining pending pitches on this post
    const rejectedCount = await Pitch.updateMany(
      { post: post._id, status: "pending" },
      { status: "rejected", rejectionReason: "Post fermé par le client", respondedAt: new Date() }
    );

    pushStatusHistory(post, "closed", reason || "Fermé manuellement");
    await post.save();

    return ok(res, {
      post,
      message: `Post fermé. ${rejectedCount.modifiedCount} offre(s) rejetée(s) automatiquement.`,
    });
  } catch (err) {
    console.error("closePost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// REACTIVATE POST
// PATCH /api/posts/:id/reactivate
// Client can reopen a closed post
// ─────────────────────────────────────────────
const reactivatePost = async (req, res) => {
  try {
    const { clientId } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    if (!["closed"].includes(post.status)) {
      return fail(res, "Seuls les posts fermés peuvent être réactivés");
    }

    pushStatusHistory(post, "reactivated", "Réactivé par le client");
    await post.save();

    return ok(res, { post, message: "Post réactivé avec succès" });
  } catch (err) {
    console.error("reactivatePost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// SEND POST TO PROVIDER  (notify a specific provider)
// POST /api/posts/:id/send
// Body: { clientId, providerType, providerId }
// ─────────────────────────────────────────────
const sendPostToProvider = async (req, res) => {
  try {
    const { clientId, providerType, providerId } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    // Check not already sent to this provider
    const alreadySent = post.sentTo.some(
      s => s.providerId.toString() === providerId && s.providerType === providerType
    );
    if (alreadySent) return fail(res, "Déjà envoyé à ce prestataire");

    post.sentTo.push({ providerType, providerId, sentAt: new Date() });
    await post.save();

    return ok(res, { message: "Post envoyé au prestataire" });
  } catch (err) {
    console.error("sendPostToProvider:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────
// DELETE POST  (only if no pitches yet)
// DELETE /api/posts/:id
// ─────────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const { clientId } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) return fail(res, "Non autorisé", 403);

    if (post.pitches.length > 0) {
      return fail(res, "Impossible de supprimer un post qui a déjà reçu des offres");
    }

    await post.deleteOne();
    return ok(res, { message: "Post supprimé" });
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