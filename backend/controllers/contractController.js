// backend/controllers/contractController.js

const Contract = require("../models/Contract");
const Project  = require("../models/Project");

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