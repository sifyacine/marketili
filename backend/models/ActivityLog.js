const mongoose = require("mongoose");

const ACTION_TYPES = [
  "user_registered", "user_disabled", "user_enabled", "user_deleted",
  "post_created", "post_closed",
  "pitch_sent", "pitch_accepted",
  "project_created", "project_completed",
  "contract_signed",
  "ad_created",
  "member_created", "account_restored",
];

const activityLogSchema = new mongoose.Schema({
  actorId:     { type: mongoose.Schema.Types.ObjectId },
  actorRole:   { type: String },
  actorName:   { type: String },
  actionType:  { type: String, enum: ACTION_TYPES, required: true },
  targetId:    { type: mongoose.Schema.Types.ObjectId },
  targetType:  { type: String },
  description: { type: String, required: true },
  metadata:    { type: mongoose.Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actionType: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
