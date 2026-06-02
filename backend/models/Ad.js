const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  imageUrl:    { type: String, trim: true },
  imageFileId: { type: mongoose.Schema.Types.ObjectId },
  linkUrl:     { type: String, trim: true },
  targetRoles: [{
    type: String,
    enum: ["client", "agency", "agency_member", "team", "team_member", "freelancer", "all"],
  }],
  placement:   { type: String, enum: ["sidebar", "banner", "card"], default: "banner" },
  isActive:    { type: Boolean, default: true },
  startDate:   Date,
  endDate:     Date,
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Ad", adSchema);
