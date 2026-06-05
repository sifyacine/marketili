

const mongoose     = require("mongoose");
const Contract     = require("../models/Contract");
const Project      = require("../models/Project");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const Message      = require("../models/Message");
const { conn }     = require("../config/db");
const generateContractPdf = require("../utils/generateContractPdf");
const findDirectorId      = require("../utils/findDirector");
const logActivity         = require("../utils/logActivity");


const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });


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

    
    const project = await Project.findById(projectId);
    if (!project) return fail(res, "Projet introuvable", 404);

    
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


exports.getContracts = async (req, res) => {
  try {
    const { partyId, partyType, status, page = 1, limit = 20, fromDate, toDate } = req.query;

    if (!partyId || !partyType) {
      return fail(res, "partyId et partyType requis");
    }

    
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


exports.getContractByProject = async (req, res) => {
  try {
    const contract = await Contract.findOne({ project: req.params.projectId })
      .populate("project", "title projectStatus deadline")
      .lean();




    return ok(res, { contract: contract || null });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};


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

    
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_sent", category: "contracts",
        title: "Nouveau contrat à signer",
        body: `Un contrat "${contract.title}" vous a été envoyé. Veuillez envoyer un reçu.`,
        link: `/dashboard/client/contracts`,
        metadata: { projectId: contract.project, contractId: contract._id },
      });
    }

    return ok(res, { contract, message: "Contrat envoyé au client" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};


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

    
    if (contract.partyAId) {
      if (contract.partyAType === "Agency") {
        const notifPayload = {
          type: "contract_acknowledged", category: "contracts",
          title: "Reçu reçu",
          body: `Le client a uploadé un reçu pour le contrat "${contract.title}". Envoyez le bon de commande.`,
          link: `/dashboard/agency/contracts`,
          metadata: { projectId: contract.project, contractId: contract._id },
        };
        Notification.notify({ recipient: contract.partyAId, recipientRole: "agency", recipientModel: "Agency", ...notifPayload });
        const directorId = await findDirectorId(contract.partyAId);
        if (directorId) {
          Notification.notify({ recipient: directorId, recipientRole: "agency_member", recipientModel: "AgencyMember", ...notifPayload });
        }
      } else if (contract.partyAType === "Freelancer") {
        Notification.notify({
          recipient: contract.partyAId, recipientRole: "freelancer", recipientModel: "Freelancer",
          type: "contract_acknowledged", category: "contracts",
          title: "Reçu reçu",
          body: `Le client a uploadé un reçu pour le contrat "${contract.title}". Vous pouvez confirmer et démarrer le projet.`,
          link: `/dashboard/freelancer/contracts`,
          metadata: { projectId: contract.project, contractId: contract._id },
        });
      } else if (contract.partyAType === "Team") {
        Notification.notify({
          recipient: contract.partyAId, recipientRole: "team", recipientModel: "Team",
          type: "contract_acknowledged", category: "contracts",
          title: "Reçu reçu",
          body: `Le client a uploadé un reçu pour le contrat "${contract.title}". Vous pouvez confirmer et démarrer le projet.`,
          link: `/dashboard/team/contracts`,
          metadata: { projectId: contract.project, contractId: contract._id },
        });
      }
    }

    return ok(res, { contract, message: "Reçu enregistré — en attente du bon de commande" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};


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

    
    await Project.findByIdAndUpdate(contract.project, {
      $set: { projectStatus: "active" },
    });

    await contract.save();

    
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_signed", category: "contracts",
        title: "Contrat finalisé",
        body: `Le bon de commande pour "${contract.title}" a été envoyé. Le contrat est signé.`,
        link: `/dashboard/client/contracts`,
        metadata: { projectId: contract.project, contractId: contract._id },
      });
    }
    if (contract.partyAType === "Agency" && contract.partyAId) {
      const notifPayloadA = {
        type: "contract_signed", category: "contracts",
        title: "Contrat finalisé",
        body: `Le contrat "${contract.title}" est maintenant signé par les deux parties.`,
        link: `/dashboard/agency/contracts`,
        metadata: { projectId: contract.project, contractId: contract._id },
      };
      Notification.notify({ recipient: contract.partyAId, recipientRole: "agency", recipientModel: "Agency", ...notifPayloadA });
      const directorId = await findDirectorId(contract.partyAId);
      if (directorId) {
        Notification.notify({ recipient: directorId, recipientRole: "agency_member", recipientModel: "AgencyMember", ...notifPayloadA });
      }
    }

    return ok(res, { contract, message: "Contrat finalisé avec succès" });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};


exports.confirmAndStart = async (req, res) => {
  try {
    const { confirmedBy } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status !== "acknowledged") {
      return fail(res, "Le projet ne peut être démarré qu'après réception du reçu client");
    }

    contract.status = "signed";
    contract.statusHistory.push({
      status: "signed", changedAt: new Date(), changedBy: confirmedBy,
      note: "Prestataire a confirmé le reçu — projet démarré",
    });
    await contract.save();

    
    await Project.findByIdAndUpdate(contract.project, {
      projectStatus: "active",
      $push: {
        statusHistory: {
          status: "active",
          changedAt: new Date(),
          note: "Projet activé après confirmation du contrat",
        },
      },
    });

    
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_signed", category: "contracts",
        title: "Projet démarré",
        body: `Le prestataire a confirmé le contrat "${contract.title || ""}". Votre projet est maintenant actif.`,
        link: "/dashboard/client/projects",
        metadata: { projectId: contract.project, contractId: contract._id },
      });
    }

    logActivity({
      actorId: req.user?._id, actorRole: req.user?.role,
      actorName: req.user?.agencyName || req.user?.teamName
        || (req.user?.firstName ? `${req.user.firstName} ${req.user.lastName}` : "Prestataire"),
      actionType: "contract_signed", targetId: contract._id, targetType: "Contract",
      description: `Contrat signé et projet démarré : ${contract.title || contract._id}`,
      metadata: { projectId: contract.project },
    });

    return ok(res, { contract, message: "Contrat confirmé — projet démarré" });
  } catch (err) {
    console.error("confirmAndStart:", err);
    return fail(res, "Erreur serveur", 500);
  }
};


exports.skipContract = async (req, res) => {
  try {
    const { skippedBy } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (!["draft", "sent"].includes(contract.status)) {
      return fail(res, "Seul un contrat brouillon ou envoyé peut être ignoré");
    }

    contract.status = "resiliation";
    contract.notes = (contract.notes ? contract.notes + "\n" : "") +
      "Contrat ignoré par le prestataire projet démarré directement";
    contract.statusHistory.push({
      status: "resiliation", changedAt: new Date(), changedBy: skippedBy,
      note: "Contrat ignoré projet activé directement",
    });
    await contract.save();

    
    await Project.findByIdAndUpdate(contract.project, {
      projectStatus: "active",
      $push: {
        statusHistory: {
          status: "active",
          changedAt: new Date(),
          note: "Projet activé  contrat ignoré par le prestataire",
        },
      },
    });

    
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_signed", category: "contracts",
        title: "Projet démarré",
        body: `Le prestataire a démarré le projet sans contrat formel.`,
        link: "/dashboard/client/projects",
        metadata: { projectId: contract.project, contractId: contract._id },
      });
    }

    return ok(res, { contract, message: "Contrat ignoré — projet démarré" });
  } catch (err) {
    console.error("skipContract:", err);
    return fail(res, "Erreur serveur", 500);
  }
};


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


exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return fail(res, "Contrat introuvable", 404);

    
    const isSectionsOnly = req.body.sections && Object.keys(req.body).length === 1;
    if (contract.status !== "draft" && !isSectionsOnly) {
      return fail(res, "Seul un brouillon peut être modifié");
    }

   
    const allowed = [
      "title", "objet", "prestations", "livrables", "financialTerms",
      "duration", "confidentialityClause", "exclusivityClause",
      "resiliationTerms", "additionalClauses", "notes", "contractType",
    ];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) contract[field] = req.body[field];
    });
    if (req.body.sections) {
      contract.sections = { ...(contract.sections?.toObject?.() || contract.sections || {}), ...req.body.sections };
    }

    await contract.save();
    return ok(res, { contract });
  } catch (err) {
    return fail(res, "Erreur serveur", 500);
  }
};


exports.generateAndSendPdf = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("project", "title client providerAgency conversationId");
    if (!contract) return fail(res, "Contrat introuvable", 404);
    if (contract.status !== "draft") {
      return fail(res, "Seul un contrat en brouillon peut être généré");
    }

    
    const editable = [
      "title", "objet", "prestations", "livrables", "financialTerms",
      "duration", "confidentialityClause", "exclusivityClause",
      "resiliationTerms", "additionalClauses",
    ];
    editable.forEach(field => {
      if (req.body[field] !== undefined) contract[field] = req.body[field];
    });
    if (req.body.sections) {
      contract.sections = { ...(contract.sections?.toObject?.() || contract.sections || {}), ...req.body.sections };
    }

    
    const pdfBuffer = await generateContractPdf(contract);

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

    
    contract.contractPdf = { fileId: fileId.toString(), filename, url: fileUrl, generatedAt: new Date() };
    contract.status = "sent";
    contract.statusHistory.push({
      status: "sent", changedAt: new Date(), changedBy: req.user._id,
      note: "Contrat proforma généré et envoyé via messagerie",
    });
    await contract.save();

    
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

    
    if (contract.partyBType === "Client" && contract.partyBId) {
      Notification.notify({
        recipient: contract.partyBId, recipientRole: "client", recipientModel: "Client",
        type: "contract_sent", category: "contracts",
        title: "Contrat envoyé",
        body: `Un contrat proforma "${contract.title || ""}" vous a été envoyé. Veuillez envoyer un reçu.`,
        link: "/dashboard/client/contracts",
        metadata: { projectId: contract.project._id, contractId: contract._id },
      });
    }

    return ok(res, { contract, fileUrl, message: "Contrat généré et envoyé avec succès" });
  } catch (err) {
    console.error("generateAndSendPdf:", err);
    return fail(res, "Erreur serveur: " + err.message, 500);
  }
};