const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender:     mongoose.Schema.Types.ObjectId,
    senderRole: {
      type: String,
      enum: ["client", "agency", "agency_member", "freelancer", "team", "team_member"],
    },
    senderName: String,
    senderType: {
      type: String,
      enum: ["Client", "Agency", "AgencyMember", "Freelancer", "Team"],
    },
    messageType: {
      type: String,
      enum: ["text", "file", "contract_pdf", "receipt", "bon_de_commande", "system"],
      default: "text",
    },
    content: String,
    file: {
      fileId:   String,
      filename: String,
      url:      String,
      mimeType: String,
      size:     Number,
    },
    isRead:    { type: Boolean, default: false },
    readAt:    Date,
    isDeleted: { type: Boolean, default: false },
    metadata: {
      contractId: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
