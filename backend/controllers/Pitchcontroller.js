const Pitch = require("../models/Pitch");
const Post = require("../models/Post");

const ok = (res, data, code = 200) =>
  res.status(code).json({ success: true, ...data });

const fail = (res, msg, code = 400) =>
  res.status(code).json({ success: false, message: msg });

const parseMaybeJSON = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeSenderType = (senderType = "") => {
  const t = String(senderType).toLowerCase();
  if (t.includes("agency")) return "Agency";
  if (t.includes("team")) return "Team";
  if (t.includes("freelancer")) return "Freelancer";
  return senderType;
};

const inferPitchType = (senderType) => {
  const normalized = normalizeSenderType(senderType);
  if (normalized === "Agency") return "agency_to_client";
  if (normalized === "Team") return "team_to_client";
  return "freelancer_to_client";
};

const buildAttachment = (file) => {
  const fileId =
    (file?.id || file?.fileId || file?.filename)?.toString?.() ||
    String(file?.filename || Date.now());

  return {
    fileId,
    filename: file?.filename || "file",
    mimeType: file?.contentType || file?.mimetype || "application/octet-stream",
    size: file?.size || 0,
    url: `/api/upload/${fileId}`,
    uploadedAt: new Date(),
  };
};

// POST /api/pitches
const sendPitch = async (req, res) => {
  try {
    const {
      postId,
      senderType,
      senderId,
      pitchType,

      strategy,
      content,
      analysis,
      targetAudience,

      description,
      proposedPrice,
      timeline,

      attachments,
    } = req.body;

    if (!postId) return fail(res, "postId requis");
    if (!senderType) return fail(res, "senderType requis");
    if (!senderId) return fail(res, "senderId requis");

    const normalizedSenderType = normalizeSenderType(senderType);
    const finalPitchType = pitchType || inferPitchType(normalizedSenderType);

    const validSenderTypes = ["Agency", "Team", "Freelancer"];
    if (!validSenderTypes.includes(normalizedSenderType)) {
      return fail(res, "senderType invalide");
    }

    const post = await Post.findById(postId);
    if (!post) return fail(res, "Post introuvable", 404);
    if (!["open", "reactivated"].includes(post.status)) {
      return fail(res, "Ce post n'accepte plus de nouvelles offres");
    }

    const senderField =
      normalizedSenderType === "Agency"
        ? "senderAgency"
        : normalizedSenderType === "Team"
        ? "senderTeam"
        : "senderFreelancer";

    const existing = await Pitch.findOne({
      post: postId,
      [senderField]: senderId,
    });
    if (existing) {
      return fail(res, "Vous avez déjà envoyé une offre pour ce post");
    }

    const pitchData = {
      pitchType: finalPitchType,
      post: postId,
      client: post.client,
      senderType: normalizedSenderType,
      [senderField]: senderId,
      status: "pending",
    };

    const parsedStrategy = parseMaybeJSON(strategy);
    const parsedContent = parseMaybeJSON(content);
    const parsedAnalysis = parseMaybeJSON(analysis);
    const parsedTargetAudience = parseMaybeJSON(targetAudience);
    const parsedProposedPrice = parseMaybeJSON(proposedPrice);
    const parsedTimeline = parseMaybeJSON(timeline);
    const parsedAttachments = parseMaybeJSON(attachments, []);

    if (parsedStrategy) pitchData.strategy = parsedStrategy;
    if (parsedContent) pitchData.content = parsedContent;
    if (parsedAnalysis) pitchData.analysis = parsedAnalysis;
    if (parsedTargetAudience) pitchData.targetAudience = parsedTargetAudience;
    if (description) pitchData.description = description;
    if (parsedProposedPrice) pitchData.proposedPrice = parsedProposedPrice;
    if (parsedTimeline) pitchData.timeline = parsedTimeline;

    const finalAttachments = [];

    if (Array.isArray(parsedAttachments)) {
      finalAttachments.push(...parsedAttachments);
    }

    if (req.file) {
      finalAttachments.push(buildAttachment(req.file));
    }

    if (finalAttachments.length) {
      pitchData.attachments = finalAttachments;
    }

    const pitch = await Pitch.create(pitchData);

    await Post.findByIdAndUpdate(postId, {
      $push: { pitches: pitch._id },
    });

    return ok(res, { pitch }, 201);
  } catch (err) {
    console.error("sendPitch:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// GET /api/pitches/post/:postId?clientId=xxx
const getPitchesForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { clientId } = req.query;

    const post = await Post.findById(postId);
    if (!post) return fail(res, "Post introuvable", 404);

    if (post.client.toString() !== clientId) {
      return fail(res, "Non autorisé", 403);
    }

    const pitches = await Pitch.find({ post: postId })
      .populate("senderAgency", "agencyName directorFirstName directorLastName")
      .populate("senderTeam", "teamName leadFirstName leadLastName")
      .populate("senderFreelancer", "firstName lastName skills")
      .sort({ createdAt: -1 })
      .lean();

    await Pitch.updateMany(
      { post: postId, isReadByRecipient: false },
      { isReadByRecipient: true }
    );

    return ok(res, { pitches, total: pitches.length });
  } catch (err) {
    console.error("getPitchesForPost:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// GET /api/pitches/my?senderId=xxx&senderType=Agency
const getMyPitches = async (req, res) => {
  try {
    const { senderId, senderType, status, page = 1, limit = 20 } = req.query;
    if (!senderId || !senderType) {
      return fail(res, "senderId et senderType requis");
    }

    const normalizedSenderType = normalizeSenderType(senderType);
    const senderField =
      normalizedSenderType === "Agency"
        ? "senderAgency"
        : normalizedSenderType === "Team"
        ? "senderTeam"
        : "senderFreelancer";

    const filter = { [senderField]: senderId };
    if (status && status !== "all") filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [pitches, total] = await Promise.all([
      Pitch.find(filter)
        .populate("post", "title status deadline budget categories")
        .populate("client", "firstName lastName companyName accountType")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Pitch.countDocuments(filter),
    ]);

    return ok(res, {
      pitches,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("getMyPitches:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const acceptPitch = async (req, res) => {
  try {
    const { clientId } = req.body;
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return fail(res, "Offre introuvable", 404);
    if (pitch.client.toString() !== clientId) return fail(res, "Non autorisé", 403);
    if (pitch.status !== "pending") {
      return fail(res, "Cette offre ne peut plus être acceptée");
    }

    pitch.status = "accepted";
    pitch.respondedAt = new Date();
    await pitch.save();

    await Post.findByIdAndUpdate(pitch.post, {
      status: "in_progress",
      $push: { acceptedPitches: pitch._id },
    });

    await Pitch.updateMany(
      { post: pitch.post, _id: { $ne: pitch._id }, status: "pending" },
      {
        status: "rejected",
        rejectionReason: "Une autre offre a été acceptée",
        respondedAt: new Date(),
      }
    );

    return ok(res, {
      pitch,
      message: "Offre acceptée — projet créé automatiquement en Phase 4",
    });
  } catch (err) {
    console.error("acceptPitch:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const rejectPitch = async (req, res) => {
  try {
    const { clientId, reason } = req.body;
    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return fail(res, "Offre introuvable", 404);
    if (pitch.client.toString() !== clientId) return fail(res, "Non autorisé", 403);
    if (pitch.status !== "pending") {
      return fail(res, "Cette offre ne peut plus être rejetée");
    }

    pitch.status = "rejected";
    pitch.respondedAt = new Date();
    pitch.rejectionReason = reason || "";
    await pitch.save();

    return ok(res, { pitch, message: "Offre rejetée" });
  } catch (err) {
    console.error("rejectPitch:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

const getPitch = async (req, res) => {
  try {
    const pitch = await Pitch.findById(req.params.id)
      .populate("post", "title status deadline budget")
      .populate("client", "firstName lastName companyName accountType")
      .populate("senderAgency", "agencyName directorFirstName directorLastName")
      .populate("senderTeam", "teamName leadFirstName leadLastName")
      .populate("senderFreelancer", "firstName lastName skills")
      .lean();

    if (!pitch) return fail(res, "Offre introuvable", 404);
    return ok(res, { pitch });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// GET /api/pitches/client/:clientId
const getPitchesForClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const pitches = await Pitch.find({ client: clientId })
      .populate("post", "title status deadline budget")
      .populate("senderAgency", "agencyName")
      .populate("senderTeam", "teamName")
      .populate("senderFreelancer", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, { pitches, total: pitches.length });
  } catch (err) {
    console.error("getPitchesForClient:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

module.exports = {
  sendPitch,
  getPitchesForPost,
  getMyPitches,
  acceptPitch,
  rejectPitch,
  getPitchesForClient,
  getPitch,
};