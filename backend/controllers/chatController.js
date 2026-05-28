const { Readable }  = require("stream");
const mongoose      = require("mongoose");
const Conversation  = require("../models/Conversation");
const Message       = require("../models/Message");
const Project       = require("../models/Project");
const AgencyMember  = require("../models/AgencyMember");
const TeamMember    = require("../models/TeamMember");
const Client        = require("../models/Client");
const Agency        = require("../models/Agency");
const Freelancer    = require("../models/Freelancer");
const Team          = require("../models/Team");
const { conn }      = require("../config/db");

const ROLE_TO_TYPE = {
  client:        "Client",
  agency:        "Agency",
  agency_member: "AgencyMember",
  team:          "Team",
  team_member:   "TeamMember",
  freelancer:    "Freelancer",
};

const MODEL_MAP = {
  client:        Client,
  agency:        Agency,
  freelancer:    Freelancer,
  team:          Team,
  agency_member: AgencyMember,
};

const getSenderName = (user) =>
  user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.agencyName || user.teamName || user.companyName || "Utilisateur";

// ─────────────────────────────────────────────
// GET OR CREATE CONVERSATION (project-tied)  GET /api/chat/project/:projectId
// ─────────────────────────────────────────────
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Projet introuvable" });
    }

    let conv = await Conversation.findOne({ project: projectId });

    if (!conv) {
      const participants = [];

      if (project.client) {
        participants.push({ participantType: "Client", participantId: project.client });
      }
      if (project.providerAgency) {
        participants.push({ participantType: "Agency", participantId: project.providerAgency });
      } else if (project.providerTeam) {
        participants.push({ participantType: "Team", participantId: project.providerTeam });
      } else if (project.providerFreelancer) {
        participants.push({ participantType: "Freelancer", participantId: project.providerFreelancer });
      }

      conv = await Conversation.create({ project: projectId, participants });

      await Project.findByIdAndUpdate(projectId, { conversationId: conv._id });
    }

    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// LIST MY CONVERSATIONS  GET /api/chat/conversations
// ─────────────────────────────────────────────
exports.getMyConversations = async (req, res) => {
  try {
    const userId   = req.user._id;
    const userRole = req.userRole;

    // ── Direct conversations ──
    const directConvs = await Conversation.find({
      isDirect: true,
      users: userId,
    }).sort({ lastMessageAt: -1, updatedAt: -1 }).lean();

    // ── Project conversations ──
    let projectFilter = {};
    if (userRole === "client")
      projectFilter.client = userId;
    else if (userRole === "agency")
      projectFilter.providerAgency = userId;
    else if (userRole === "team")
      projectFilter.providerTeam = userId;
    else if (userRole === "freelancer")
      projectFilter.providerFreelancer = userId;
    else if (userRole === "agency_member") {
      const member = await AgencyMember.findById(userId).select("agency").lean();
      if (member?.agency) projectFilter.providerAgency = member.agency;
    } else if (userRole === "team_member") {
      const member = await TeamMember.findById(userId).select("team").lean();
      if (member?.team) projectFilter.providerTeam = member.team;
    }

    const userProjects = Object.keys(projectFilter).length
      ? await Project.find(projectFilter).select("_id title").lean()
      : [];
    const projectIds = userProjects.map((p) => p._id);

    const projectConvs = projectIds.length
      ? await Conversation.find({ project: { $in: projectIds } })
          .sort({ lastMessageAt: -1, updatedAt: -1 }).lean()
      : [];

    // Attach project title as synthetic participantInfo
    const projectConvsWithInfo = projectConvs.map((conv) => {
      const project = userProjects.find((p) => String(p._id) === String(conv.project));
      return {
        ...conv,
        participantInfo: [{
          userId: conv.project,
          role: "project",
          name: project?.title || "Projet",
        }],
      };
    });

    // ── Merge and sort by last activity ──
    const allConvs = [...directConvs, ...projectConvsWithInfo].sort((a, b) => {
      const at = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0);
      const bt = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0);
      return bt - at;
    });

    // ── Attach unread counts ──
    const withUnread = await Promise.all(
      allConvs.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender:       { $ne: userId },
          isRead:       false,
        });
        return { ...conv, unreadCount };
      })
    );

    res.json({ success: true, conversations: withUnread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// START OR FIND DIRECT CONVERSATION  POST /api/chat/conversations/direct
// ─────────────────────────────────────────────
exports.startDirectConversation = async (req, res) => {
  try {
    const { targetUserId, targetRole } = req.body;
    const currentUser = req.user;
    const currentRole = req.userRole;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: "targetUserId requis" });
    }

    // Prevent conversation with self
    if (String(currentUser._id) === String(targetUserId)) {
      return res.status(400).json({ success: false, message: "Vous ne pouvez pas vous envoyer de message" });
    }

    // Find existing direct conversation between these two users
    let conv = await Conversation.findOne({
      isDirect: true,
      users: { $all: [currentUser._id, targetUserId] },
    });

    if (!conv) {
      // Resolve target name from role model
      let targetName = "Utilisateur";
      const TargetModel = MODEL_MAP[targetRole];
      if (TargetModel) {
        const target = await TargetModel.findById(targetUserId).lean();
        if (target) targetName = getSenderName(target);
      }

      const currentName = getSenderName(currentUser);

      conv = await Conversation.create({
        isDirect: true,
        users: [currentUser._id, targetUserId],
        participantInfo: [
          { userId: currentUser._id, role: currentRole, name: currentName },
          { userId: targetUserId,    role: targetRole || "unknown", name: targetName },
        ],
      });
    }

    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MESSAGES  GET /api/chat/:conversationId/messages
// ─────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId   = req.user._id;
    const userRole = req.userRole;

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation introuvable" });
    }

    // Participant-only access
    if (conv.isDirect) {
      const isParticipant = conv.users.some((uid) => String(uid) === String(userId));
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: "Accès refusé" });
      }
    } else if (conv.project) {
      // Project conversation — verify the user belongs to this project
      const project = await Project.findById(conv.project).select(
        "client providerAgency providerTeam providerFreelancer"
      );
      if (project) {
        const allowed =
          String(project.client) === String(userId) ||
          String(project.providerAgency) === String(userId) ||
          String(project.providerTeam) === String(userId) ||
          String(project.providerFreelancer) === String(userId) ||
          userRole === "admin";
        if (!allowed) {
          return res.status(403).json({ success: false, message: "Accès refusé" });
        }
      }
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    res.json({
      success: true,
      messages,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// SEND MESSAGE  POST /api/chat/:conversationId/messages
// ─────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType, metadata } = req.body;

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation introuvable" });
    }

    // Verify sender is a participant in direct conversations
    if (conv.isDirect) {
      const isParticipant = conv.users.some(
        (uid) => String(uid) === String(req.user._id)
      );
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: "Accès refusé" });
      }
    }

    const user     = req.user;
    const userRole = req.userRole;

    const msgData = {
      conversation: conversationId,
      sender:       user._id,
      senderRole:   userRole,
      senderName:   getSenderName(user),
      senderType:   ROLE_TO_TYPE[userRole] || "Client",
      messageType:  messageType || "text",
      isRead:       false,
    };

    if (content)  msgData.content  = content;
    if (metadata) msgData.metadata = metadata;

    if (req.file) {
      // Stream the buffer into GridFS to get a real ObjectId
      const bucket = new mongoose.mongo.GridFSBucket(conn().db, { bucketName: "uploads" });
      const storedFilename = `${Date.now()}-${req.file.originalname.replace(/\s/g, "_")}`;
      const uploadStream = bucket.openUploadStream(storedFilename, {
        contentType: req.file.mimetype,
        metadata: { originalName: req.file.originalname, uploadedBy: req.user._id },
      });
      await new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error",  reject);
        Readable.from(req.file.buffer).pipe(uploadStream);
      });
      const fileId = uploadStream.id;

      msgData.messageType = msgData.messageType === "text" ? "file" : msgData.messageType;
      msgData.file = {
        fileId:   fileId.toString(),
        filename: req.file.originalname || storedFilename,
        url:      `/api/upload/${fileId}`,
        mimeType: req.file.mimetype || "application/octet-stream",
        size:     req.file.size || 0,
      };
    }

    if (!msgData.content && !msgData.file) {
      return res.status(400).json({ success: false, message: "Contenu ou fichier requis" });
    }

    const message = await Message.create(msgData);

    // Update conversation's last message metadata
    const preview = message.content
      ? message.content.slice(0, 60)
      : "📎 Fichier joint";
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt:      message.createdAt,
      lastMessagePreview: preview,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// MARK READ  PATCH /api/chat/:conversationId/read
// ─────────────────────────────────────────────
exports.markRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET UNREAD COUNT  GET /api/chat/unread-count
// ─────────────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const userId   = req.user._id;
    const userRole = req.userRole;

    // Direct conversations unread
    const directConvs = await Conversation.find({
      isDirect: true,
      users: userId,
    }).select("_id");
    const directConvIds = directConvs.map((c) => c._id);

    // Project conversations unread (legacy)
    let projectFilter = {};
    if (userRole === "client")        projectFilter.client               = userId;
    else if (userRole === "agency")   projectFilter.providerAgency       = userId;
    else if (userRole === "team")     projectFilter.providerTeam         = userId;
    else if (userRole === "freelancer") projectFilter.providerFreelancer = userId;
    else if (userRole === "agency_member") {
      const member = await AgencyMember.findById(userId).select("agency");
      if (member) projectFilter.providerAgency = member.agency;
    }

    const projects   = await Project.find(projectFilter).select("_id");
    const projectIds = projects.map((p) => p._id);
    const projectConvs = await Conversation.find({
      project: { $in: projectIds },
    }).select("_id");
    const projectConvIds = projectConvs.map((c) => c._id);

    const allConvIds = [...directConvIds, ...projectConvIds];

    const count = await Message.countDocuments({
      conversation: { $in: allConvIds },
      sender:       { $ne: userId },
      isRead:       false,
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
