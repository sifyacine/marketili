const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const freelancerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    phone: { type: String, trim: true },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    avatar: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 1000 },

    location: {
      region: String,
    },

    carteAutoEntrepreneur: { type: String, trim: true },

    skills: [String],
    categories: [String],

    socialLinks: {
      instagram: String,
      tiktok: String,
      youtube: String,
      linkedin: String,
      twitter: String,
    },

    followersCount: { type: Number, default: 0 },

    portfolioItems: [
      {
        title: String,
        description: String,
        imageUrl: String,
        link: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    pitchesSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pitch" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    clientProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    agencyCollaborations: [{
      agency:     { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
      role:       { type: String, trim: true },
      contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
      startDate:  { type: Date, default: Date.now },
      status:     { type: String, enum: ["active", "ended"], default: "active" },
      endDate:    { type: Date },
      endReason:  { type: String, trim: true },
      endedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    }],

    role: { type: String, default: "freelancer", immutable: true },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// ✅ FIXED
freelancerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

freelancerSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("Freelancer", freelancerSchema);