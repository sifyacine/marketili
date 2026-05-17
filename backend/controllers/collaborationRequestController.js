// backend/controllers/collaborationRequestController.js

const CollaborationRequest = require("../models/CollaborationRequest");
const Freelancer           = require("../models/Freelancer");
const Notification         = require("../models/Notification");

// POST /api/collaboration-requests
const sendRequest = async (req, res) => {
  try {
    const { fromId, fromType, fromName, toId, toType, toName, message, proposedRole } = req.body;

    if (!fromId || !toId || !fromType || !toType) {
      return res.status(400).json({ success: false, message: "Champs obligatoires manquants" });
    }

    // Check for an existing pending request between the same pair
    const existing = await CollaborationRequest.findOne({
      fromId, toId, status: "pending",
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Une demande est déjà en attente pour ce destinataire",
      });
    }

    const request = await CollaborationRequest.create({
      fromType, fromId, fromName,
      toType, toId, toName,
      message, proposedRole,
    });

    // Determine recipient model + role for notification
    const toRoleMap = { Agency: "agency", Team: "team", Client: "client" };
    const toModelMap = { Agency: "Agency", Team: "Team", Client: "Client" };
    const toRole  = toRoleMap[toType]  || "agency";
    const toModel = toModelMap[toType] || "Agency";
    const dashPath = toRole === "agency" ? "agency" : toRole === "team" ? "team" : "client";

    Notification.notify({
      recipient: toId, recipientRole: toRole, recipientModel: toModel,
      type: "collaboration_request", category: "pitches",
      title: "Demande de collaboration reçue",
      body: `${fromName} souhaite collaborer avec vous.`,
      link: `/dashboard/${dashPath}/members`,
      metadata: { requestId: request._id },
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/collaboration-requests/mine
const getMyRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { fromId: req.user._id };
    if (status && status !== "all") query.status = status;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [requests, total] = await Promise.all([
      CollaborationRequest.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      CollaborationRequest.countDocuments(query),
    ]);

    res.json({ success: true, requests, total, pages: Math.ceil(total / limitNum), page: pageNum });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/collaboration-requests/incoming
const getIncomingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { toId: req.user._id };
    if (status && status !== "all") query.status = status;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [requests, total] = await Promise.all([
      CollaborationRequest.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      CollaborationRequest.countDocuments(query),
    ]);

    res.json({ success: true, requests, total, pages: Math.ceil(total / limitNum), page: pageNum });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/collaboration-requests/:id/respond
const respondToRequest = async (req, res) => {
  try {
    const { action, declineReason } = req.body;
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ success: false, message: "action doit être 'accept' ou 'decline'" });
    }

    const request = await CollaborationRequest.findOne({
      _id: req.params.id,
      toId: req.user._id,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ success: false, message: "Demande introuvable ou déjà traitée" });
    }

    request.respondedAt = new Date();

    if (action === "accept") {
      request.status = "accepted";
      await request.save();

      // Push agencyCollaborations entry if accepting a freelancer
      if (request.fromType === "Freelancer" && request.toType === "Agency") {
        await Freelancer.findByIdAndUpdate(request.fromId, {
          $push: {
            agencyCollaborations: {
              agency:    request.toId,
              role:      request.proposedRole || "collaborateur",
              startDate: new Date(),
              status:    "active",
            },
          },
        });
      }

      Notification.notify({
        recipient: request.fromId, recipientRole: "freelancer", recipientModel: "Freelancer",
        type: "collaboration_request_accepted", category: "pitches",
        title: "Demande de collaboration acceptée",
        body: `${request.toName} a accepté votre demande de collaboration.`,
        link: "/dashboard/freelancer/collaborations",
        metadata: { requestId: request._id },
      });
    } else {
      request.status = "declined";
      if (declineReason) request.declineReason = declineReason;
      await request.save();

      Notification.notify({
        recipient: request.fromId, recipientRole: "freelancer", recipientModel: "Freelancer",
        type: "collaboration_request_declined", category: "pitches",
        title: "Demande de collaboration refusée",
        body: declineReason
          ? `${request.toName} a refusé votre demande : ${declineReason}`
          : `${request.toName} a refusé votre demande de collaboration.`,
        link: "/dashboard/freelancer/collaborations",
        metadata: { requestId: request._id },
      });
    }

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/collaboration-requests/:id/withdraw
const withdrawRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findOne({
      _id: req.params.id,
      fromId: req.user._id,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ success: false, message: "Demande introuvable ou déjà traitée" });
    }

    request.status = "withdrawn";
    request.respondedAt = new Date();
    await request.save();

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendRequest, getMyRequests, getIncomingRequests, respondToRequest, withdrawRequest };
