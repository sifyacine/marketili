const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * TEAM MODEL
 *
 * Similar to Agency but lighter — a team is a group of collaborators
 * without the full business structure. They can:
 * - send pitches to clients
 * - hire freelancers
 * - manage internal members
 * - run projects
 */
const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    leadFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    leadLastName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      city: String,
      region: String,
      country: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    // ── Profile ──
    avatar: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 1000 },
    specialties: [String],
    portfolioItems: [
      {
        title: String,
        description: String,
        imageUrl: String,
        link: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ── Members ──
    // Teams also have sub-accounts (TeamMember model)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TeamMember",
      },
    ],

    // ── Activity ──
    pitchesSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pitch" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    role: { type: String, default: "team", immutable: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

teamSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

teamSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("Team", teamSchema);