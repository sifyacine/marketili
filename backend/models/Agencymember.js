const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * AGENCY MEMBER MODEL
 *
 * Sub-accounts created and managed by an Agency.
 * Members can be assigned to projects and tasks.
 * They log in with their own credentials but belong to a parent agency.
 */
const agencyMemberSchema = new mongoose.Schema(
  {
    // ── Parent agency ──
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },

    // ── Identity ──
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    // ── Role within the agency (not platform role) ──
    // e.g. "Social Media Manager", "Graphic Designer", "Copywriter"
    jobTitle: {
      type: String,
      trim: true,
    },
    // Skills/specialties this member has
    skills: [String],

    avatar: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 500 },

    // ── Assignments ──
    // Projects this member is assigned to
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    // Tasks this member has been assigned
    assignedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    // ── Platform role — always "agency_member" ──
    role: {
      type: String,
      default: "agency_member",
      immutable: true,
    },

    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

agencyMemberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

agencyMemberSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("AgencyMember", agencyMemberSchema);