const mongoose = require("mongoose");

/**
 * PITCH MODEL
 *
 * One model, four pitch types. Each type uses different fields.
 * The pitchType field acts as a discriminator.
 *
 * Types:
 *   "agency_to_client"     — Highly structured (the main pitch flow)
 *   "team_to_client"       — Medium structure
 *   "freelancer_to_client" — Lighter, more personal
 *   "agency_to_freelancer" — Agency hiring a freelancer (CDD or CDI)
 *
 * Privacy: Pitches are PRIVATE between the sender and the post owner.
 * A client sees only pitches on their own posts.
 * Providers see only pitches they sent.
 */
const pitchSchema = new mongoose.Schema(
  {
    // ── Type discriminator ──
    pitchType: {
      type: String,
      enum: [
        "agency_to_client",
        "team_to_client",
        "freelancer_to_client",
        "agency_to_freelancer",
      ],
      required: true,
    },

    // ── References — which post and which providers ──
    // post is required for client-facing pitches
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    // The client receiving the pitch (from the post or direct)
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    // The freelancer being hired (agency_to_freelancer only)
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },

    // ── Sender — only one of these will be set ──
    senderAgency:     { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    senderTeam:       { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    senderFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },

    // ── Computed sender info (for display without populate) ──
    senderType: {
      type: String,
      enum: ["Agency", "Team", "Freelancer"],
      required: true,
    },

    // ════════════════════════════════════════════════════════════
    // AGENCY → CLIENT STRATEGY FIELDS
    // These fields are ONLY used when pitchType === "agency_to_client"
    // This is the most structured pitch on the platform.
    // ════════════════════════════════════════════════════════════

    // Block 1: Strategy & Planning
    strategy: {
      // Stratégie & Planification
      strategyOverview: { type: String, trim: true },
      // Idée créative
      creativeIdea: { type: String, trim: true },
      // Objectifs (image, visibilité, présence)
      objectives: { type: String, trim: true },
      // Buts mesurables (comment atteindre les objectifs)
      measurableGoals: { type: String, trim: true },
      // Techniques et tactiques
      techniques: { type: String, trim: true },
    },

    // Block 2: Content & Organization
    content: {
      // Piliers de contenu
      contentPillars: [String],
      // Calendrier de publication
      publicationCalendar: { type: String, trim: true },
      // Fréquence de posting
      postingFrequency: { type: String, trim: true },
      // Organisation du feed
      feedOrganization: { type: String, trim: true },
    },

    // Block 3: Analysis & Design
    analysis: {
      // Analyse concurrentielle
      competitiveAnalysis: { type: String, trim: true },
      // Palette de couleurs
      colorPalette: [String],
      // INSPO (inspiration references)
      inspiration: [String],
      // Stratégie de positionnement
      positioningStrategy: { type: String, trim: true },
    },

    // Block 4: Target Audience
    targetAudience: {
      // Age range
      ageMin: Number,
      ageMax: Number,
      // Gender
      gender: {
        type: String,
        enum: ["male", "female", "all", "other"],
      },
      // Niche / interests
      niche: [String],
      // Location targeting
      locations: [String],
    },

    // ════════════════════════════════════════════════════════════
    // SHARED FIELDS — used by all pitch types
    // ════════════════════════════════════════════════════════════

    // A general description / cover letter (required for non-agency pitches)
    description: {
      type: String,
      trim: true,
    },

    // Work requirements (used by agency_to_freelancer)
    workRequirements: {
      type: String,
      trim: true,
    },

    proposedPrice: {
      amount:   { type: Number },
      currency: { type: String, default: "DZD" },
    },

    // How long the project will take
    timeline: {
      duration: Number,
      unit: {
        type: String,
        enum: ["days", "weeks", "months"],
        default: "weeks",
      },
      startDate: Date,
      endDate:   Date,
    },

    // For agency_to_freelancer: is this CDD or CDI?
    contractType: {
      type: String,
      enum: ["cdd", "cdi"],
    },

    // File attachments (URLs / GridFS IDs — Phase file-upload)
    attachments: [String],

    // ── Status ──
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },

    // When the client responded
    respondedAt: Date,

    // Optional rejection reason
    rejectionReason: { type: String, trim: true },

    // ── Read tracking ──
    // Has the recipient opened/read this pitch?
    isReadByRecipient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ──
pitchSchema.index({ post: 1, status: 1 });
pitchSchema.index({ senderAgency: 1 });
pitchSchema.index({ senderTeam: 1 });
pitchSchema.index({ senderFreelancer: 1 });
pitchSchema.index({ client: 1 });
pitchSchema.index({ pitchType: 1 });
pitchSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Pitch", pitchSchema);