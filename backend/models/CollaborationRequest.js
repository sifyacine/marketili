// backend/models/CollaborationRequest.js

const mongoose = require("mongoose");

const collaborationRequestSchema = new mongoose.Schema(
  {
    fromType: { type: String, enum: ["Freelancer", "Agency"], required: true },
    fromId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    fromName: { type: String, required: true, trim: true },

    toType: { type: String, enum: ["Agency", "Team", "Client"], required: true },
    toId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    toName: { type: String, required: true, trim: true },

    message:      { type: String, trim: true, maxlength: 1000 },
    proposedRole: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "withdrawn"],
      default: "pending",
    },

    respondedAt:   Date,
    declineReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Prevent duplicate pending requests from the same sender to the same target
collaborationRequestSchema.index(
  { fromId: 1, toId: 1, status: 1 },
  { unique: false }
);

module.exports = mongoose.model("CollaborationRequest", collaborationRequestSchema);
