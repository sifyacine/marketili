const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teamMemberSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
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

    jobTitle: { type: String, trim: true },
    skills: [String],

    avatar: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 500 },

    assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    role: { type: String, default: "team_member", immutable: true },

    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);


teamMemberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

teamMemberSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("TeamMember", teamMemberSchema);