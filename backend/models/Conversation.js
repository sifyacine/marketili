const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    
    isDirect: { type: Boolean, default: false },

    
    users: [{ type: mongoose.Schema.Types.ObjectId }],

    
    participantInfo: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId },
        role:   { type: String },
        name:   { type: String },
      },
    ],

    
    participants: [
      {
        participantType: {
          type: String,
          enum: ["Client", "Agency", "Freelancer", "Team", "AgencyMember", "TeamMember"],
        },
        participantId: mongoose.Schema.Types.ObjectId,
      },
    ],

    
    lastMessageAt:      { type: Date },
    lastMessagePreview: { type: String },
  },
  { timestamps: true }
);


conversationSchema.index({ isDirect: 1, users: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
