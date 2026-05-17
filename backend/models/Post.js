const mongoose = require("mongoose");

/**
 * POST MODEL
 *
 * Created by a Client to describe a marketing need.
 * Visible to all providers (agencies, teams, freelancers).
 *
 * Status flow:
 *   open → in_progress (when at least one pitch accepted)
 *        → closed (manually by client, rejects remaining pitches)
 *        → reactivated (client can reopen a closed post)
 *
 * A client CAN accept multiple pitches before closing.
 * When they close, all remaining pending pitches are auto-rejected.
 */
const postSchema = new mongoose.Schema(
  {
    // ── Who created it ──
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // ── Content ──
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
      trim: true,
    },
    objectives: { type: String, trim: true, maxlength: 500 },
    // File URLs / GridFS IDs — added in Phase file-upload
    pictures: [
      {
        type: String,
      },
    ],

    // ── Requirements ──
    budget: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "DZD" },
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },

    // ── Location (for filtering) ──
    location: {
      city:    String,
      region:  String,
      country: String,
    },

    // ── Categories / tags (for filtering) ──
    categories: [String],
    // e.g. ["Social Media", "Content Creation", "SEO"]

    // ── Skills & marketing classification ──
    requiredSkills: [String],

    marketingType: {
      type: String,
      enum: ["Events", "360 Marketing", "ATL", "BTL", "Production", "Brand Marketing"],
    },

    collaborationType: {
      type: String,
      enum: ["service", "partnership", "sponsorship", "exposure"],
    },

    // ── Compensation ──
    compensationType: {
      type: String,
      enum: ["monetary", "benefits", "mixed"],
      default: "monetary",
    },

    // Free-text benefits description — used when compensationType is "benefits" or "mixed"
    benefits: { type: String, trim: true },

    // ── Media attachments (images / videos uploaded via GridFS) ──
    media: [
      {
        fileId:   String, // GridFS ObjectId as string
        filename: String,
        mimeType: String, // "image/jpeg", "video/mp4", etc.
        size:     Number, // bytes
        url:      String, // /api/upload/:fileId
      },
    ],

    // ── Who is this post targeting? ──
    // Client can target specific provider types or leave it open to all
    targetProviders: {
      type: [String],
      enum: ["agency", "team", "freelancer", "all"],
      default: ["all"],
    },

    // ── Status ──
    status: {
      type: String,
      enum: ["open", "in_progress", "closed", "reactivated"],
      default: "open",
    },
    adminNote: { type: String, trim: true },

    // ── Pitches received ──
    // Only pitch IDs are stored here — populated when needed.
    // This lets us count pitches quickly without loading all data.
    pitches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pitch",
      },
    ],

    // ── Accepted pitches (can be multiple) ──
    acceptedPitches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pitch",
      },
    ],

    // ── Projects spawned from this post ──
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    // ── Direct sends ──
    // Client can send this post directly to specific providers
    // (it's also public, but this notifies/highlights for them)
    sentTo: [
      {
        providerType: {
          type: String,
          enum: ["Agency", "Team", "Freelancer"],
        },
        providerId: mongoose.Schema.Types.ObjectId,
        sentAt: { type: Date, default: Date.now },
      },
    ],

    // ── Saved by providers ──
    savedBy: [
      {
        providerType: {
          type: String,
          enum: ["Agency", "Team", "Freelancer"],
        },
        providerId: mongoose.Schema.Types.ObjectId,
      },
    ],

    // ── Visibility ──
    isPublic: { type: Boolean, default: true },

    // ── Provider-initiated post (provider sends proposal to a specific client) ──
    initiatedBy: {
      initiatorType: { type: String, enum: ["Agency", "Team", "Freelancer"] },
      initiatorId:   { type: mongoose.Schema.Types.ObjectId },
    },

    // Track reactivation history
    statusHistory: [
      {
        status:    String,
        changedAt: { type: Date, default: Date.now },
        reason:    String,
      },
    ],
  },
  { timestamps: true }
);

// ── Indexes for fast filtering ──
postSchema.index({ status: 1 });
postSchema.index({ deadline: 1 });
postSchema.index({ "location.region": 1 });
postSchema.index({ categories: 1 });
postSchema.index({ createdAt: -1 });
// Compound index for the most common query: open posts sorted by date
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ marketingType: 1 });
postSchema.index({ collaborationType: 1 });

module.exports = mongoose.model("Post", postSchema);