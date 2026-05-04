const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const agencyMemberSchema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },

    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },

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

    jobTitle: {
  type: String,
  enum: [
    "director",
    "commercial",
    "strategist",
    "designer",
    "editor",
    "smm",
    "community_manager"
  ],
  trim: true
},
    skills: [String],

    avatar: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 500 },

    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    role: { type: String, default: "agency_member", immutable: true },

    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// ✅ FIXED
agencyMemberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

agencyMemberSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("AgencyMember", agencyMemberSchema);