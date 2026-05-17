// backend/controllers/contractController.js

const mongoose     = require("mongoose");
const Contract     = require("../models/Contract");
const Project      = require("../models/Project");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const Message      = require("../models/Message");
const { conn }     = require("../config/db");
const generateContractPdf = require("../utils/generateContractPdf");

// ── Helpers ──
const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });

// ─────────────────────────────────────────────────────────────
// CREATE CONTRACT   POST /api/contracts
// Called by the agency (director) after a project is created.
// ─────────────────────────────────────────────────────────────
exports.createContract = async (req, res) => {
  try {
    const {
      projectId,
      pitchId,
      contractType,
      partyAType, partyAId, partyAName,
      partyBType, partyBId, partyBName,
      title, objet, prestations, livrables,
      financialTerms, duration,
      confidentialityClause, exclusivityClause,
      resiliationTerms, additionalClauses,
      initiatedBy, initiatedByRole,
      notes,
    } = req.body;

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) return fail(res, "Projet introuvable", 404);

    // Only one active contract per project (draft or sent)
    const existing = await Contract.findOne({
      project: projectId,
      status: { $in: ["draft", "sent", "acknowledged"] },
    });
    if (existing) {
      return fail(res, "Un contrat est déjà en cours pour ce projet");
    }

    const contract = await Contract.create({
      project: projectId,
      pitch:   pitchId,
      contractType: contractType || "service_agreement",
      partyAType, partyAId, partyAName,
      partyBType, partyBId, partyBName,
      title, objet, prestations, livrables,
      financialTerms, duration,
      confidentialityClause: confidentialityClause ?? true,
      exclusivityClause:     exclusivityClause     ?? false,
      resiliationTerms, additionalClauses,
      initiatedBy, initiatedByRole,
      notes,
      status: "draft",
      statusHistory: [{
        status:    "draft",
        changedAt: new Date(),
        changedBy: initiatedBy,
        note:      "Contrat créé",
      }],
    });

    return ok(res, { contract }, 201);
  } catch (err) {
    console.error("createContract:", err);
    return fail(res, "Erreur serveur: " + err.message, 500);
  }
};

// ─────────────────────────────────────────────────────────────
// GET CONTRACTS FOR A PARTY
// GET /api/contracts?partyId=xxx&partyType=Agency&status=sent
// Used by agency director, client, freelancer, team
// ─────────────────────────────────────────────────────────────
exports.getContracts = async (req, res) => {
  try {
    const { partyId, partyType, status, page = 1, limit = 20, fromDate, toDate } = req.query;

    if (!partyId || !partyType) {
      return fail(res, "partyId et partyType requis");
    }

    // A party can appear as partyA or partyB
    const filter = {
      $or: [
        { partyAId: partyId, partyAType: partyType },
        { partyBId: partyId, partyBType: partyType },
      ],
    };

    if (status && status !== "all") filter.status = status;

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate)   filter.createdAt.$lte = new Date(new Date(toDate).setHours(23, 59, 59, 999));
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [contracts, total] = await Promise.all([
      Contract.find(filter)
        .populate("project", "title projectStatus deadline agreedPrice")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Contract.countDocuments(filter),
    ]);

    return ok(res, { contracts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error("getContracts:", err);
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE CONTRACT   GET /api/contracts/:id
// ─────────────────────────────────────────────────────────────
exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("project", "title projectStatus deadline agreedPrice client providerAgency")
      .lean();

    if (!contract) return fail(res, "Contrat introuvable", 404);
    return ok(res, { contract });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// GET CONTRACT FOR A PROJECT   GET /api/contracts/project/:projectId
// ─────────────────────────────────────────────────────────────
exports.getContractByProject = async (req, res) => {
  try {
    const contract = await Contract.findOne({ project: req.params.projectId })
      .populate("project", "title projectStatus deadline")
      .lean();

    // Not having a contract is valid — return null not a 404
    return ok(res, { contract: contract || null });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// SEND CONTRACT (agency → client)   PATCH /api/contracts/:id/send
// Moves status from draft → sent
// ─────────────────────────────────────────────────────────────
exports.sendContract = async (req, res) => {
  try {
    const { sentBy } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status !== "draft") {
      return fail(res, "Seul un contrat en brouillon peut être envoyé");
    }

    contract.status = "sent";
    contract.statusHistory.push({
      status: "sent", changedAt: new Date(), changedBy: sentBy,
      note: "Contrat envoyé au client",
    });
    await contract.save();

    // Notify client (partyB when type is client)
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_sent", category: "contracts",
        title: "Nouveau contrat à signer",
        body: `Un contrat "${contract.title}" vous a été envoyé. Veuillez envoyer un reçu.`,
        link: `/dashboard/client/contracts`,
        metadata: { projectId: contract.project },
      });
    }

    return ok(res, { contract, message: "Contrat envoyé au client" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// UPLOAD RECEIPT (client)   PATCH /api/contracts/:id/receipt
// Client uploads proof of payment → status: acknowledged
// ─────────────────────────────────────────────────────────────
exports.uploadReceipt = async (req, res) => {
  try {
    const { uploadedBy, filename, url, fileId } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status !== "sent") {
      return fail(res, "Le reçu ne peut être envoyé qu'après réception du contrat");
    }

    contract.receipt = { fileId, filename, url, uploadedAt: new Date(), uploadedBy };
    contract.status = "acknowledged";
    contract.statusHistory.push({
      status: "acknowledged", changedAt: new Date(), changedBy: uploadedBy,
      note: "Reçu uploadé par le client",
    });
    await contract.save();

    // Notify agency director
    if (contract.partyAType === "Agency" && contract.partyAId) {
      Notification.notify({
        recipient: contract.partyAId, recipientRole: "agency", recipientModel: "Agency",
        type: "contract_acknowledged", category: "contracts",
        title: "Reçu reçu",
        body: `Le client a uploadé un reçu pour le contrat "${contract.title}". Envoyez le bon de commande.`,
        link: `/dashboard/agency/contracts`,
        metadata: { projectId: contract.project },
      });
    }

    return ok(res, { contract, message: "Reçu enregistré — en attente du bon de commande" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// SEND BON DE COMMANDE (agency)   PATCH /api/contracts/:id/bon-de-commande
// Agency sends BDC after receipt → status: signed (complete)
// ─────────────────────────────────────────────────────────────
exports.sendBonDeCommande = async (req, res) => {
  try {
    const { sentBy, filename, url, fileId } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status !== "acknowledged") {
      return fail(res, "Le bon de commande ne peut être envoyé qu'après réception du reçu");
    }

    contract.bonDeCommande = { fileId, filename, url, sentAt: new Date(), sentBy };
    contract.status = "signed";
    contract.statusHistory.push({
      status: "signed", changedAt: new Date(), changedBy: sentBy,
      note: "Bon de commande envoyé — contrat finalisé",
    });

    // Also update the project status to active if still pending
    await Project.findByIdAndUpdate(contract.project, {
      $set: { projectStatus: "active" },
    });

    await contract.save();

    // Notify both parties
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_signed", category: "contracts",
        title: "Contrat finalisé",
        body: `Le bon de commande pour "${contract.title}" a été envoyé. Le contrat est signé.`,
        link: `/dashboard/client/contracts`,
        metadata: { projectId: contract.project },
      });
    }
    if (contract.partyAType === "Agency" && contract.partyAId) {
      Notification.notify({
        recipient: contract.partyAId, recipientRole: "agency", recipientModel: "Agency",
        type: "contract_signed", category: "contracts",
        title: "Contrat finalisé",
        body: `Le contrat "${contract.title}" est maintenant signé par les deux parties.`,
        link: `/dashboard/agency/contracts`,
        metadata: { projectId: contract.project },
      });
    }

    return ok(res, { contract, message: "Contrat finalisé avec succès" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// RESILIATION   PATCH /api/contracts/:id/resiliation
// Either party can trigger resiliation with a reason
// ─────────────────────────────────────────────────────────────
exports.resiliate = async (req, res) => {
  try {
    const { initiatedBy, reason } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status === "resiliation") {
      return fail(res, "Ce contrat est déjà résilié");
    }

    contract.status = "resiliation";
    contract.notes = (contract.notes ? contract.notes + "\n" : "") +
      `Résiliation: ${reason || "Aucune raison fournie"}`;
    contract.statusHistory.push({
      status: "resiliation", changedAt: new Date(), changedBy: initiatedBy,
      note: reason || "Résiliation demandée",
    });
    await contract.save();

    return ok(res, { contract, message: "Contrat résilié" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE DRAFT   PATCH /api/contracts/:id
// Edit a contract still in draft state
// ─────────────────────────────────────────────────────────────
exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status !== "draft") {
      return fail(res, "Seul un brouillon peut être modifié");
    }

    // Only allow updating content fields, never parties or project
    const allowed = [
      "title", "objet", "prestations", "livrables", "financialTerms",
      "duration", "confidentialityClause", "exclusivityClause",
      "resiliationTerms", "additionalClauses", "notes", "contractType",
    ];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) contract[field] = req.body[field];
    });

    await contract.save();
    return ok(res, { contract });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};

// ─────────────────────────────────────────────────────────────
// GENERATE & SEND PDF   POST /api/contracts/:id/generate-pdf
// Agency director fills form → PDF created → sent to chat → status: sent
// ─────────────────────────────────────────────────────────────
exports.generateAndSendPdf = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("project", "title client providerAgency conversationId");
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status !== "draft") {
      return fail(res, "Seul un contrat en brouillon peut être généré");
    }

    // Update content fields from form submission
    const editable = [
      "title", "objet", "prestations", "livrables", "financialTerms",
      "duration", "confidentialityClause", "exclusivityClause",
      "resiliationTerms", "additionalClauses",
    ];
    editable.forEach(field => {
      if (req.body[field] !== undefined) contract[field] = req.body[field];
    });

    // Generate PDF buffer
    const pdfBuffer = await generateContractPdf(contract);

    // Upload buffer directly to GridFS
    const bucket = new mongoose.mongo.GridFSBucket(conn().db, { bucketName: "uploads" });
    const filename = `contrat-${contract._id}-${Date.now()}.pdf`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: "application/pdf",
      metadata: { contractId: contract._id.toString(), type: "contract_pdf" },
    });
    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
      uploadStream.write(pdfBuffer);
      uploadStream.end();
    });
    const fileId = uploadStream.id;
    const fileUrl = `/api/upload/${fileId}`;

    // Save PDF ref + advance status
    contract.contractPdf = { fileId: fileId.toString(), filename, url: fileUrl, generatedAt: new Date() };
    contract.status = "sent";
    contract.statusHistory.push({
      status: "sent", changedAt: new Date(), changedBy: req.user._id,
      note: "Contrat proforma généré et envoyé via messagerie",
    });
    await contract.save();

    // Find or create conversation for the project
    let conversation = await Conversation.findOne({ project: contract.project._id });
    if (!conversation) {
      const participants = [];
      if (contract.project.client) {
        participants.push({ participantType: "Client", participantId: contract.project.client });
      }
      if (contract.project.providerAgency) {
        participants.push({ participantType: "Agency", participantId: contract.project.providerAgency });
      }
      conversation = await Conversation.create({ project: contract.project._id, participants });
    }

    // Sender info
    const senderTypeMap = {
      agency: "Agency", agency_member: "AgencyMember",
      client: "Client", freelancer: "Freelancer",
      team: "Team", team_member: "TeamMember",
    };
    const senderType = senderTypeMap[req.userRole] || "Agency";
    const senderName =
      req.user.agencyName ||
      req.user.companyName ||
      `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() ||
      "Prestataire";

    // Post contract_pdf message
    await Message.create({
      conversation: conversation._id,
      sender: req.user._id, senderRole: req.userRole, senderName, senderType,
      messageType: "contract_pdf",
      content: `Contrat proforma : ${contract.title || "Contrat"}`,
      file: {
        fileId: fileId.toString(), filename, url: fileUrl,
        mimeType: "application/pdf", size: pdfBuffer.length,
      },
      metadata: { contractId: contract._id },
    });

    // Notify client
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_sent", category: "contracts",
        title: "Contrat envoyé",
        body: `Un contrat proforma "${contract.title || ""}" vous a été envoyé. Veuillez envoyer un reçu.`,
        link: "/dashboard/client/contracts",
        metadata: { projectId: contract.project._id },
      });
    }

    return ok(res, { contract, fileUrl, message: "Contrat généré et envoyé avec succès" });
  } catch (err) {
    console.error("generateAndSendPdf:", err);
    return fail(res, "Erreur serveur: " + err.message, 500);
  }
};