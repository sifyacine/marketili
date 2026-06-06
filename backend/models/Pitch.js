const mongoose = require("mongoose");













const pitchSchema = new mongoose.Schema(
  {
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

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },

    senderAgency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    senderTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    senderFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer" },

    senderType: {
      type: String,
      enum: ["Agency", "Team", "Freelancer"],
      required: true,
    },

    strategy: {
      strategyOverview: { type: String, trim: true },
      creativeIdea: { type: String, trim: true },
      objectives: { type: String, trim: true },
      measurableGoals: { type: String, trim: true },
      techniques: { type: String, trim: true },
    },

    content: {
      contentPillars: [String],
      publicationCalendar: { type: String, trim: true },
      postingFrequency: { type: String, trim: true },
      feedOrganization: { type: String, trim: true },
    },

    analysis: {
      competitiveAnalysis: { type: String, trim: true },
      colorPalette: [String],
      inspiration: [String],
      positioningStrategy: { type: String, trim: true },
      socialNetworks: [String],
      confidentialityClause: { type: Boolean },
      effectiveDate: { type: Date },
      amendments: { type: String, trim: true },
      artNote03: { type: String, trim: true },
      artNote04: { type: String, trim: true },
    },

    targetAudience: {
      ageMin: Number,
      ageMax: Number,
      gender: {
        type: String,
        enum: ["male", "female", "all", "other"],
      },
      niche: [String],
      locations: [String],
    },

    description: {
      type: String,
      trim: true,
    },

    workRequirements: {
      type: String,
      trim: true,
    },

    proposedPrice: {
      amount: { type: Number },
      currency: { type: String, default: "DZD" },
      paymentMethod: { type: String, trim: true },
      paymentSchedule: { type: String, trim: true },
    },

    timeline: {
      duration: Number,
      unit: {
        type: String,
        enum: ["days", "weeks", "months"],
        default: "weeks",
      },
      startDate: Date,
      endDate: Date,
    },

    contractType: {
      type: String,
      enum: ["cdd", "cdi"],
    },

attachments: [{
  fileId: String,
  filename: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now }
}
    ],
  
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },

    respondedAt: Date,

    rejectionReason: { type: String, trim: true },

    isReadByRecipient: { type: Boolean, default: false },

    
    internalStatus: {
      type: String,
      enum: ["draft", "with_chef_de_projet", "approved", "sent"],
      default: "draft",
    },
    internalNotes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AgencyMember" },
  },
  { timestamps: true }
);

pitchSchema.index({ post: 1, status: 1 });
pitchSchema.index({ senderAgency: 1 });
pitchSchema.index({ senderTeam: 1 });
pitchSchema.index({ senderFreelancer: 1 });
pitchSchema.index({ client: 1 });
pitchSchema.index({ pitchType: 1 });
pitchSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Pitch", pitchSchema);