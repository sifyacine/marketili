const Pitch        = require("../models/Pitch");
const Post         = require("../models/Post");
const Notification = require("../models/Notification");
const AgencyMember = require("../models/AgencyMember");
const logActivity  = require("../utils/logActivity");
const { getIo }    = require("../config/socket");

const emitPitchUpdate = (userIds) => {
  const io = getIo();
  if (!io) return;
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  ids.forEach(id => { if (id) io.to(`user:${id}`).emit("pitch_update"); });
};

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


const sendPitch = async (req, res) => {
  if (req.userRole === "agency_member" && req.user?.jobTitle === "commercial")
    return fail(res, "Accès refusé — rôle commercial", 403);
  try {
    const {
      postId,
      senderType,
      senderId,
      pitchType,
      receiverId,    
      receiverType,

      strategy,
      content,
      analysis,
      targetAudience,
      workRequirements,

      description,
      proposedPrice,
      timeline,
      contractType,

      attachments,
    } = req.body;

    if (!senderType) return fail(res, "senderType requis");
    if (!senderId) return fail(res, "senderId requis");

    const normalizedSenderType = normalizeSenderType(senderType);
    const finalPitchType = pitchType || inferPitchType(normalizedSenderType);

    const validSenderTypes = ["Agency", "Team", "Freelancer"];
    if (!validSenderTypes.includes(normalizedSenderType)) {
      return fail(res, "senderType invalide");
    }

    const isConvention = finalPitchType === "agency_to_freelancer";

    
    let post = null;
    if (!isConvention) {
      if (!postId) return fail(res, "postId requis");
      post = await Post.findById(postId);
      if (!post) return fail(res, "Post introuvable", 404);
      if (!["open", "reactivated"].includes(post.status)) {
        return fail(res, "Ce post n'accepte plus de nouvelles offres");
      }
    } else {
      if (!receiverId) return fail(res, "receiverId requis pour une convention");
    }

    const senderField =
      normalizedSenderType === "Agency"
        ? "senderAgency"
        : normalizedSenderType === "Team"
        ? "senderTeam"
        : "senderFreelancer";

    if (!isConvention) {
      const existing = await Pitch.findOne({ post: postId, [senderField]: senderId });
      if (existing) {
        return fail(res, "Vous avez déjà envoyé une offre pour ce post");
      }
    }

    const pitchData = {
      pitchType: finalPitchType,
      senderType: normalizedSenderType,
      [senderField]: senderId,
      status: "pending",
      ...(post && { post: postId, client: post.client }),
      ...(isConvention && receiverId && { freelancer: receiverId }),
      ...(contractType && { contractType }),
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
    if (workRequirements) pitchData.workRequirements = workRequirements;
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

    if (!isConvention && post) {
      await Post.findByIdAndUpdate(postId, { $push: { pitches: pitch._id } });

      Notification.notify({
        recipient: post.client, recipientRole: "client", recipientModel: "Client",
        type: "pitch_received", category: "pitches",
        title: "Nouvelle offre reçue",
        body: `Une offre a été soumise sur votre post "${post.title}"`,
        link: `/dashboard/client/pitches`,
        metadata: { postId: post._id, pitchId: pitch._id },
      });
      
      emitPitchUpdate(post.client);
    }

    if (isConvention && receiverId) {
      const Freelancer = require("../models/Freelancer");
      Notification.notify({
        recipient: receiverId, recipientRole: "freelancer", recipientModel: "Freelancer",
        type: "pitch_received", category: "pitches",
        title: "Nouvelle convention de collaboration",
        body: `Une agence vous a envoyé une convention de collaboration.`,
        link: `/dashboard/freelancer/pitches`,
        metadata: { pitchId: pitch._id },
      });
    }

    logActivity({
      actorId: pitch.senderAgency || pitch.senderTeam || pitch.senderFreelancer,
      actorRole: pitch.senderType?.toLowerCase(), actorName: pitch.senderName || String(pitch.senderAgency || ""),
      actionType: "pitch_sent", targetId: pitch._id, targetType: "Pitch",
      description: isConvention ? "Convention envoyée à un freelancer" : `Offre envoyée sur "${post?.title}"`,
    });
    return ok(res, { pitch }, 201);
  } catch (err) {
    console.error("sendPitch:", err);
    return fail(res, "Erreur serveur", 500);
  }
};


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
    const { clientId, withContract = false } = req.body;

    
    const pitch = await Pitch.findById(req.params.id)
      .populate("post");
    if (!pitch) return fail(res, "Offre introuvable", 404);
    if (pitch.client.toString() !== clientId) return fail(res, "Non autorisé", 403);
    if (pitch.status !== "pending") {
      return fail(res, "Cette offre ne peut plus être acceptée");
    }

    
    pitch.status = "accepted";
    pitch.respondedAt = new Date();
    await pitch.save();

    
    await Post.findByIdAndUpdate(pitch.post._id || pitch.post, {
      status: "in_progress",
      $push: { acceptedPitches: pitch._id },
    });

    
    await Pitch.updateMany(
      { post: pitch.post._id || pitch.post, _id: { $ne: pitch._id }, status: "pending" },
      {
        status: "rejected",
        rejectionReason: "Une autre offre a été acceptée",
        respondedAt: new Date(),
      }
    );

    
    const Project      = require("../models/Project");
    const Contract     = require("../models/Contract");
    const Conversation = require("../models/Conversation");

    const providerField =
      pitch.senderType === "Agency"  ? "providerAgency"     :
      pitch.senderType === "Team"    ? "providerTeam"       :
                                       "providerFreelancer";

    const providerId =
      pitch.senderType === "Agency"  ? pitch.senderAgency     :
      pitch.senderType === "Team"    ? pitch.senderTeam       :
                                       pitch.senderFreelancer;

    const postDoc      = pitch.post?.title ? pitch.post : await Post.findById(pitch.post);
    const projectTitle = postDoc?.title || "Nouveau projet";
    const deadline     = postDoc?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    
    const projectStatus = withContract ? "pending_contract" : "active";

    const project = await Project.create({
      post:         postDoc?._id || pitch.post,
      pitch:        pitch._id,
      client:       pitch.client,
      providerType: pitch.senderType,
      [providerField]: providerId,
      title:        projectTitle,
      description:  pitch.description || "",
      deadline,
      startDate:    new Date(),
      projectStatus,
      agreedPrice:  pitch.proposedPrice || {},
      statusHistory: [{
        status:    projectStatus,
        changedAt: new Date(),
        note:      withContract
          ? "Projet créé  en attente de signature du contrat"
          : "Projet créé automatiquement suite à l'acceptation d'une offre",
      }],
    });

    
    const participants = [
      { participantType: "Client",           participantId: pitch.client },
      { participantType: pitch.senderType,   participantId: providerId  },
    ];
    const conversation = await Conversation.create({ project: project._id, participants });
    await Project.findByIdAndUpdate(project._id, { conversationId: conversation._id });

    
    let contract = null;
    if (withContract) {
      const partyAType = pitch.senderType;
      const partyBType = "Client";

      // Resolve provider and client display names
      const Agency     = require("../models/Agency");
      const Team       = require("../models/Team");
      const Freelancer = require("../models/Freelancer");
      const Client     = require("../models/Client");

      let partyAName = "";
      if (partyAType === "Agency") {
        const ag = await Agency.findById(providerId).select("agencyName").lean();
        partyAName = ag?.agencyName || "";
      } else if (partyAType === "Team") {
        const tm = await Team.findById(providerId).select("teamName").lean();
        partyAName = tm?.teamName || "";
      } else {
        const fr = await Freelancer.findById(providerId).select("firstName lastName").lean();
        partyAName = fr ? `${fr.firstName || ""} ${fr.lastName || ""}`.trim() : "";
      }

      const clientDoc = await Client.findById(pitch.client).select("firstName lastName companyName").lean();
      const partyBName = clientDoc?.companyName ||
        `${clientDoc?.firstName || ""} ${clientDoc?.lastName || ""}`.trim() || "";

      contract = await Contract.create({
        project:         project._id,
        pitch:           pitch._id,
        contractType:    pitch.contractType || "service_agreement",
        partyAType,
        partyAId:        providerId,
        partyAName,
        partyBType,
        partyBId:        pitch.client,
        partyBName,
        title:           `Contrat — ${projectTitle}`,
        initiatedBy:     pitch.client,
        initiatedByRole: "client",
        status:          "draft",
        statusHistory: [{
          status:    "draft",
          changedAt: new Date(),
          changedBy: pitch.client,
          note:      "Contrat créé automatiquement suite à l'acceptation d'une offre",
        }],
      });
    }

    
    const senderRecipient = providerId;
    const senderModel     = pitch.senderType === "Agency"  ? "Agency"     :
                            pitch.senderType === "Team"    ? "Team"       : "Freelancer";
    const senderRole      = pitch.senderType === "Agency"  ? "agency"     :
                            pitch.senderType === "Team"    ? "team"       : "freelancer";
    const dashRoot        = pitch.senderType === "Agency"  ? "agency"     :
                            pitch.senderType === "Team"    ? "team"       : "freelancer";

    Notification.notify({
      recipient: senderRecipient, recipientRole: senderRole, recipientModel: senderModel,
      type: "pitch_accepted", category: "pitches",
      title: "Votre offre a été acceptée",
      body: withContract
        ? `Votre offre sur "${postDoc?.title || "un post"}" a été acceptée. Veuillez remplir le contrat pour démarrer le projet.`
        : `Votre offre sur "${postDoc?.title || "un post"}" a été acceptée. Un projet a été créé.`,
      link: withContract
        ? `/dashboard/${dashRoot}/contracts`
        : `/dashboard/${dashRoot}/projects`,
      metadata: { pitchId: pitch._id, projectId: project._id, contractId: contract?._id },
    });

    
    Notification.notify({
      recipient: pitch.client, recipientRole: "client", recipientModel: "Client",
      type: "project_created", category: "projects",
      title: "Projet créé",
      body: withContract
        ? `Votre projet "${projectTitle}" a été créé et attend la signature du contrat.`
        : `Votre projet "${projectTitle}" est maintenant actif.`,
      link: "/dashboard/client/projects",
      metadata: { pitchId: pitch._id, projectId: project._id },
    });

    logActivity({
      actorId: req.user._id, actorRole: "client", actorName: String(req.user._id),
      actionType: "pitch_accepted", targetId: pitch._id, targetType: "Pitch",
      description: `Offre acceptée — projet créé : "${project?.title || pitch._id}"`,
      metadata: { projectId: project?._id, withContract },
    });
    logActivity({
      actorId: project?._id, actorRole: "system", actorName: "Système",
      actionType: "project_created", targetId: project?._id, targetType: "Project",
      description: `Projet créé automatiquement : "${project?.title || ""}"`,
    });

    emitPitchUpdate([providerId, pitch.client]);

    return ok(res, {
      pitch,
      project,
      contract: contract || undefined,
      message: withContract
        ? "Offre acceptée  le prestataire doit remplir le contrat pour démarrer le projet"
        : "Offre acceptée  projet créé ",
    });
  } catch (err) {
    console.error("acceptPitch:", err);
    return fail(res, "Erreur serveur", 500);
  }
};


const withdrawPitch = async (req, res) => {
  try {
    const { senderId, senderType } = req.body;
    if (!senderId || !senderType) return fail(res, "senderId et senderType requis");

    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return fail(res, "Offre introuvable", 404);

    const normalizedSenderType = normalizeSenderType(senderType);
    const senderField =
      normalizedSenderType === "Agency"    ? "senderAgency"    :
      normalizedSenderType === "Team"      ? "senderTeam"      :
                                             "senderFreelancer";

    if (pitch[senderField]?.toString() !== senderId) {
      return fail(res, "Non autorisé — vous n'êtes pas l'émetteur de cette offre", 403);
    }

    if (pitch.status !== "pending") {
      return fail(res, "Seules les offres en attente peuvent être retirées", 400);
    }

    pitch.status = "withdrawn";
    pitch.respondedAt = new Date();
    await pitch.save();

    
    if (pitch.client) emitPitchUpdate(pitch.client);

    return ok(res, { pitch, message: "Offre retirée" });
  } catch (err) {
    console.error("withdrawPitch:", err);
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

   
    const rejSenderRecipient = pitch.senderType === "Agency"     ? pitch.senderAgency :
                               pitch.senderType === "Team"       ? pitch.senderTeam   :
                                                                  pitch.senderFreelancer;
    const rejSenderModel     = pitch.senderType === "Agency"     ? "Agency"     :
                               pitch.senderType === "Team"       ? "Team"       : "Freelancer";
    const rejSenderRole      = pitch.senderType === "Agency"     ? "agency"     :
                               pitch.senderType === "Team"       ? "team"       : "freelancer";

    const rejDashRoot = pitch.senderType === "Team" ? "team"
                      : pitch.senderType === "Freelancer" ? "freelancer" : "agency";

    Notification.notify({
      recipient: rejSenderRecipient, recipientRole: rejSenderRole, recipientModel: rejSenderModel,
      type: "pitch_rejected", category: "pitches",
      title: "Votre offre n'a pas été retenue",
      body: reason ? `Raison : ${reason}` : "Votre offre a été rejetée.",
      link: `/dashboard/${rejDashRoot}/pitches`,
      metadata: { pitchId: pitch._id },
    });

    emitPitchUpdate(rejSenderRecipient);

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


const INTERNAL_TRANSITIONS = {
  strategist:      { from: ["draft"],               to: "with_chef_de_projet" },
  chef_de_projet:  { from: ["with_chef_de_projet"], to: ["approved", "draft"] },
  director:        { from: ["approved"],             to: "sent" },
};

const updateInternalStatus = async (req, res) => {
  try {
    const { newStatus, internalNotes, actorJobTitle } = req.body;
    if (!newStatus) return fail(res, "newStatus requis");

    const pitch = await Pitch.findById(req.params.id);
    if (!pitch) return fail(res, "Offre introuvable", 404);

    const rule = INTERNAL_TRANSITIONS[actorJobTitle];
    if (!rule) return fail(res, "Rôle non autorisé à modifier le statut interne", 403);

    const allowedFrom = Array.isArray(rule.from) ? rule.from : [rule.from];
    const allowedTo   = Array.isArray(rule.to)   ? rule.to   : [rule.to];

    if (!allowedFrom.includes(pitch.internalStatus)) {
      return fail(res, `Transition impossible depuis le statut "${pitch.internalStatus}"`);
    }
    if (!allowedTo.includes(newStatus)) {
      return fail(res, `Ce rôle ne peut pas définir le statut "${newStatus}"`);
    }

    pitch.internalStatus = newStatus;
    if (internalNotes !== undefined) pitch.internalNotes = internalNotes;
    await pitch.save();

    
    if (pitch.senderAgency) {
      if (newStatus === "with_chef_de_projet") {
        
        const chefs = await AgencyMember.find({
          agency: pitch.senderAgency, jobTitle: "chef_de_projet", accountStatus: "active",
        }).select("_id").lean();
        chefs.forEach(chef => {
          Notification.notify({
            recipient: chef._id, recipientRole: "agency_member", recipientModel: "AgencyMember",
            type: "director_approval_needed", category: "pitches",
            title: "Pitch à valider",
            body: `Un pitch vous a été soumis pour validation.`,
            link: "/dashboard/agency/pitches",
            metadata: { pitchId: pitch._id },
          });
        });
      } else if (newStatus === "approved") {
        
        const directors = await AgencyMember.find({
          agency: pitch.senderAgency, jobTitle: "director", accountStatus: "active",
        }).select("_id").lean();
        
        Notification.notify({
          recipient: pitch.senderAgency, recipientRole: "agency", recipientModel: "Agency",
          type: "director_approval_needed", category: "pitches",
          title: "Pitch approuvé — prêt à envoyer",
          body: `Le chef de projet a validé le pitch. Vous pouvez maintenant l'envoyer au client.`,
          link: "/dashboard/agency/pitches",
          metadata: { pitchId: pitch._id },
        });
        directors.forEach(dir => {
          Notification.notify({
            recipient: dir._id, recipientRole: "agency_member", recipientModel: "AgencyMember",
            type: "director_approval_needed", category: "pitches",
            title: "Pitch approuvé — prêt à envoyer",
            body: `Le chef de projet a validé le pitch.`,
            link: "/dashboard/agency/pitches",
            metadata: { pitchId: pitch._id },
          });
        });
      }
    }

    
    if (pitch.senderAgency) {
      emitPitchUpdate(pitch.senderAgency);
      const allMembers = await AgencyMember.find({
        agency: pitch.senderAgency, accountStatus: "active",
      }).select("_id").lean();
      emitPitchUpdate(allMembers.map(m => m._id));
    }

    return ok(res, { pitch, message: "Statut interne mis à jour" });
  } catch (err) {
    console.error("updateInternalStatus:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

module.exports = {
  sendPitch,
  getPitchesForPost,
  getMyPitches,
  acceptPitch,
  rejectPitch,
  withdrawPitch,
  getPitchesForClient,
  getPitch,
  updateInternalStatus,
};