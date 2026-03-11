const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * FREELANCER / INFLUENCER MODEL
 *
 * Can:
 * - browse and respond to open posts (client or agency)
 * - work under an agency as an assigned member
 * - work directly with a client
 * - have two separate work contexts in their dashboard
 */
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
    phone:    { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },

    // ── Profile ──
    avatar:   { type: String, default: null },
    bio:      { type: String, trim: true, maxlength: 1000 },
    location: {
      city:    String,
      region:  String,
      country: String,
    },

    // What they do
    skills:     [String],
    // e.g. ["Video Production", "Photography", "Copywriting", "Instagram"]
    categories: [String],
    // e.g. ["Social Media", "Content Creation", "Influencer Marketing"]

    // Influencer specific (optional)
    socialLinks: {
      instagram: String,
      tiktok:    String,
      youtube:   String,
      linkedin:  String,
      twitter:   String,
    },
    followersCount: {
      type: Number,
      default: 0,
    },

    portfolioItems: [
      {
        title:       String,
        description: String,
        imageUrl:    String,
        link:        String,
        createdAt:   { type: Date, default: Date.now },
      },
    ],

    // ── Activity ──
    pitchesSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pitch" }],
    savedPosts:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    // Projects from direct client work (side B)
    clientProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],

    // Collaborations assigned by agency/team (side A)
    agencyCollaborations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],

    role:         { type: String, default: "freelancer", immutable: true },
    isVerified:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

freelancerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

freelancerSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("Freelancer", freelancerSchema);