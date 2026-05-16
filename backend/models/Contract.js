// backend/models/Contract.js

const mongoose = require("mongoose");

/**
 * CONTRACT MODEL
 *
 * Standalone contract between two parties.
 * Always linked to a project (created after pitch acceptance).
 *
 * Parties:
 *   Client    ↔ Agency
 *   Client    ↔ Freelancer
 *   Agency    ↔ Freelancer
 *   Team      ↔ Freelancer
 *
 * Status flow:
 *   draft → sent → acknowledged → signed | resiliation
 *
 * The contract workflow:
 *   1. Agency fills form → PDF auto-generated → status: sent
 *   2. Client uploads receipt → status: acknowledged
 *   3. Agency sends bon de commande → status: signed (complete)
 */
const contractSchema = new mongoose.Schema(
  {
    // ── Origin ──
    // Every contract must be linked to a project
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    pitch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pitch",
    },

    // ── Contract type ──
    contractType: {
      type: String,
      enum: ["service_agreement", "collaboration", "cdd", "cdi", "project"],
      default: "service_agreement",
    },

    // ── Parties ──
    // Party A — always the provider (agency, team, or freelancer)
    partyAType: {
      type: String,
      enum: ["Agency", "Team", "Freelancer"],
      required: true,
    },
    partyAId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref is dynamic based on partyAType
    },
    partyAName: { type: String, trim: true }, // denormalized for display

    // Party B — client, freelancer, or agency member (internal employment contracts)
    partyBType: {
      type: String,
      enum: ["Client", "Freelancer", "AgencyMember"],
      required: true,
    },
    partyBId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    partyBName: { type: String, trim: true }, // denormalized

    // ── Contract content ──
    // Structured fields that map to the PDF template articles
    title: { type: String, trim: true },

    // ARTICLE 01: Objet du contrat
    objet: { type: String, trim: true },

    // ARTICLE 02: Nature des prestations
    prestations: { type: String, trim: true },

    // ARTICLE 03: Périmètre / livrables
    livrables: { type: String, trim: true },

    // ARTICLE 05: Dispositions financières
    financialTerms: {
      amount:        { type: Number },
      currency:      { type: String, default: "DZD" },
      paymentMethod: { type: String, trim: true },    // virement, chèque, espèces…
      paymentSchedule: { type: String, trim: true },  // ex: 50% avance, 50% livraison
    },

    // ARTICLE 08: Durée
    duration: {
      startDate: Date,
      endDate:   Date,
      notes:     { type: String, trim: true },
    },

    // ARTICLE 09: Confidentialité
    confidentialityClause: { type: Boolean, default: true },

    // ARTICLE 10: Exclusivité
    exclusivityClause: { type: Boolean, default: false },

    // ARTICLE 14: Résiliation
    resiliationTerms: { type: String, trim: true },

    // Free-form additional clauses
    additionalClauses: { type: String, trim: true },

    // ── Status ──
    status: {
      type: String,
      enum: ["draft", "sent", "acknowledged", "signed", "resiliation"],
      default: "draft",
    },

    // ── Document trail ──
    // The generated PDF (contrat proforma)
    contractPdf: {
      fileId:     String,
      filename:   String,
      url:        String,
      generatedAt: Date,
    },

    // Receipt uploaded by client (proof of payment / acknowledgment)
    receipt: {
      fileId:     String,
      filename:   String,
      url:        String,
      uploadedAt: Date,
      uploadedBy: mongoose.Schema.Types.ObjectId,
    },

    // Bon de commande sent by agency after receipt
    bonDeCommande: {
      fileId:     String,
      filename:   String,
      url:        String,
      sentAt:     Date,
      sentBy:     mongoose.Schema.Types.ObjectId,
    },

    // ── Audit trail ──
    statusHistory: [
      {
        status:    String,
        changedAt: { type: Date, default: Date.now },
        changedBy: mongoose.Schema.Types.ObjectId,
        note:      String,
      },
    ],

    // ── Metadata ──
    // Who initiated the contract
    initiatedBy:   mongoose.Schema.Types.ObjectId,
    initiatedByRole: { type: String },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Indexes ──
contractSchema.index({ project: 1 });
contractSchema.index({ partyAId: 1 });
contractSchema.index({ partyBId: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Contract", contractSchema);