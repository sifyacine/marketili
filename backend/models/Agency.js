const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * AGENCY MODEL
 *
 * An agency is a registered business that:
 * - browses and responds to client posts with structured pitches
 * - manages internal team members (sub-accounts)
 * - can hire freelancers on the platform
 * - has a shared internal workspace
 */
const agencySchema = new mongoose.Schema(
  {
    // ── Agency identity ──
    agencyName: {
      type: String,
      required: [true, "Agency name is required"],
      trim: true,
    },
    directorFirstName: {
      type: String,
      required: [true, "Director first name is required"],
      trim: true,
    },
    directorLastName: {
      type: String,
      required: [true, "Director last name is required"],
      trim: true,
    },
    businessNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      region: String,
      country: String,
      postalCode: String,
    },

    // ── Contact ──
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    // ── Profile & Portfolio ──
    logo: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    specialties: [
      {
        type: String,
        // e.g. ["Social Media", "SEO", "Content Creation", "Paid Ads"]
      },
    ],
    portfolioItems: [
      {
        title: String,
        description: String,
        imageUrl: String,
        link: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ── Internal members ──
    // These are AgencyMember sub-accounts created by the agency director.
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AgencyMember",
      },
    ],

    // ── Activity ──
    pitchesSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pitch",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    // ── Role ──
    role: {
      type: String,
      default: "agency",
      immutable: true,
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

agencySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

agencySchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Agency", agencySchema);