const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Project-tied conversations (legacy — project is now optional)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    // Direct (project-independent) conversation flag
    isDirect: { type: Boolean, default: false },

    // Participant user IDs (profile _id values) — used for lookup queries
    users: [{ type: mongoose.Schema.Types.ObjectId }],

    // Denormalized snapshot for display in conversation list
    participantInfo: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId },
        role:   { type: String },
        name:   { type: String },
      },
    ],

    // Legacy participant structure (kept for project conversations)
    participants: [
      {
        participantType: {
          type: String,
          enum: ["Client", "Agency", "Freelancer", "Team", "AgencyMember", "TeamMember"],
        },
        participantId: mongoose.Schema.Types.ObjectId,
      },
    ],

    // Last message metadata for conversation list display
    lastMessageAt:      { type: Date },
    lastMessagePreview: { type: String },
  },
  { timestamps: true }
);

// Compound index for finding direct conversation between two users
conversationSchema.index({ isDirect: 1, users: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
