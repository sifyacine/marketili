const mongoose = require("mongoose");

const profilePostSchema = new mongoose.Schema(
  {
    author:       { type: mongoose.Schema.Types.ObjectId, required: true },
    authorRole:   { type: String, enum: ["agency", "team", "freelancer", "client"], required: true },
    authorName:   { type: String, trim: true },
    authorAvatar: { type: String },

    content: { type: String, trim: true, maxlength: 2000 },

    media: [{
      fileId: String,
      url:    String,
      type:   { type: String, enum: ["image", "video", "pdf"], default: "image" },
    }],

    postType: {
      type: String,
      enum: ["update", "achievement", "campaign", "announcement"],
      default: "update",
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

profilePostSchema.index({ author: 1, authorRole: 1, createdAt: -1 });

module.exports = mongoose.model("ProfilePost", profilePostSchema);
